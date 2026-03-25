import { PutCommand, QueryCommand, TransactWriteCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

const USERS_TABLE = process.env.DYNAMODB_CART_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
    console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    process.exit(1);
}

export interface CartItem {
    companyId: string;
    productName: string;
    price: number;
    userId: string;
    durationMonths?: number;
    employeeCount?: number;
}

// Normalization helper for consistent product comparison
const normalizeProductName = (name: string): string => {
    const n = name.toLowerCase().trim();

    // Explicit Alias Mapping
    if (n.includes('roadmap')) return 'hr-transformation-roadmap';
    if (n.includes('vendor')) return 'hcm-vendor-fit';
    if (n.includes('shared service')) return 'shared-service-designer';
    if (n.includes('maturity') || n.includes('diagnostics') || n.includes('tech analysis')) return 'hr-tech-maturity-analysis';
    if (n.includes('change management')) return 'intelligent-change-management';

    return n
        .replace(/generator/g, '')
        .replace(/analysis|assessment|diagnostics/g, 'analysis')
        .replace(/designer|planner/g, 'designer')
        .replace(/\u00A0/g, ' ')
        .trim();
};

// Add or update items in company cart
export const addOrUpdateCartItem = async (item: CartItem) => {
    console.log("Adding or updating cart item:", item);

    try {
        // 1. Fetch all items and check for existing match using normalized names
        const allItems = await getCartItems(item.companyId);
        const normalizedTarget = normalizeProductName(item.productName);

        // Find existing matches (could be multiple if duplicates previously existed)
        const matches = allItems.filter(i => normalizeProductName(i.productName) === normalizedTarget);

        if (matches.length > 0) {
            console.log(`Item similar to ${item.productName} already exists in cart. Merging/Updating.`);

            // Update the first match
            const mainMatch = matches[0];
            const updateCommand = new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: mainMatch.pk,
                    sk: mainMatch.sk,
                },
                UpdateExpression: "SET price = :price, productName = :productName, addedBy = :addedBy, addedAt = :addedAt, durationMonths = :durationMonths, employeeCount = :employeeCount",
                ExpressionAttributeValues: {
                    ":price": item.price,
                    ":productName": item.productName,
                    ":addedBy": item.userId,
                    ":addedAt": new Date().toISOString(),
                    ":durationMonths": item.durationMonths || 1,
                    ":employeeCount": item.employeeCount || 0,
                },
            });
            await ddbDocClient.send(updateCommand);

            // 2. SELF-HEALING: If there were duplicates, remove others
            if (matches.length > 1) {
                console.log(`Found ${matches.length - 1} duplicates for ${item.productName}. Cleaning up...`);
                for (let i = 1; i < matches.length; i++) {
                    await deleteCartItem(matches[i].pk, matches[i].sk);
                }
            }

            return { success: true, itemId: mainMatch.itemId, updated: true };
        }

        // 3. If no match found, create a new one
        const uniqueId = uuidv4();
        const cartSK = `CART#${uniqueId}`;

        const command = new PutCommand({
            TableName: USERS_TABLE,
            Item: {
                pk: `COMPANY#${item.companyId}`,
                sk: cartSK,
                productName: item.productName,
                price: item.price,
                addedBy: item.userId,
                addedAt: new Date().toISOString(),
                itemId: uniqueId,
                durationMonths: item.durationMonths || 1,
                employeeCount: item.employeeCount || 0,
            },
        });

        await ddbDocClient.send(command);
        console.log(`Item ${item.productName} added to cart for company ${item.companyId}`);
        return { success: true, itemId: uniqueId, updated: false };
    } catch (e) {
        console.error("Error adding/updating item in cart:", e);
        throw e;
    }
};

// Fetch all cart items for a company
export const getCartItems = async (orgId: string) => {
    const command = new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${orgId}`,
            ":skPrefix": "CART#", // Get all items that start with CART#
        },
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        console.log(`Found ${Items?.length || 0} items in cart for company ${orgId}`);
        return Items || [];
    } catch (e) {
        console.error("Error fetching cart items:", e);
        throw e;
    }
};

// Delete a specific cart item
export const deleteCartItem = async (pk: string, sk: string) => {
    console.log("Deleting cart item:", { pk, sk });

    const command = new DeleteCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: pk,
            sk: sk,
        },
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Successfully deleted cart item: ${pk}#${sk}`);
        return { success: true };
    } catch (e) {
        console.error("Error deleting cart item:", e);
        throw e;
    }
};

// Clear all cart items for a company
export const clearCart = async (orgId: string) => {
    try {
        // First, get all cart items
        const cartItems = await getCartItems(orgId);

        if (cartItems.length === 0) {
            console.log("Cart is already empty");
            return { success: true, deletedCount: 0 };
        }

        // Delete each item
        const deletePromises = cartItems.map(item =>
            deleteCartItem(item.pk, item.sk)
        );

        await Promise.all(deletePromises);
        console.log(`Cleared ${cartItems.length} items from cart for company ${orgId}`);
        return { success: true, deletedCount: cartItems.length };
    } catch (e) {
        console.error("Error clearing cart:", e);
        throw e;
    }
};

// Updated checkout function
export const checkout = async (orgId: string) => {
    // 1. Get all items from the company's cart
    const cartItems = await getCartItems(orgId);

    if (cartItems.length === 0) {
        throw new Error("Cart is empty. Nothing to check out.");
    }

    // 2. Prepare the transaction
    const orderId = uuidv4();
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

    const transactionItems = [];

    // Create the order/receipt item
    const orderItem = {
        Put: {
            TableName: USERS_TABLE,
            Item: {
                pk: `COMPANY#${orgId}`, // Changed from USER# to COMPANY#
                sk: `ORDER#${orderId}`,
                orderId: orderId,
                totalAmount: totalAmount,
                itemCount: cartItems.length,
                createdAt: new Date().toISOString(),
                status: 'completed',
                // Store a snapshot of the items in the order
                items: cartItems.map(item => ({
                    itemId: item.itemId,
                    productName: item.productName,
                    price: item.price,
                    addedBy: item.addedBy,
                })),
            },
        },
    };
    transactionItems.push(orderItem);

    // Add a delete request for each item in the cart
    for (const item of cartItems) {
        transactionItems.push({
            Delete: {
                TableName: USERS_TABLE,
                Key: {
                    pk: item.pk,
                    sk: item.sk,
                },
            },
        });
    }

    // 3. Execute the transaction
    const command = new TransactWriteCommand({
        TransactItems: transactionItems,
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Checkout successful for company ${orgId}. Order ID: ${orderId}`);
        return { orderId, totalAmount, itemCount: cartItems.length };
    } catch (e) {
        console.error("Error during checkout transaction:", e);
        throw new Error("Checkout failed. Please try again.");
    }
};

// Get order history for a company
export const getOrderHistory = async (orgId: string) => {
    const command = new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${orgId}`,
            ":skPrefix": "ORDER#",
        },
        ScanIndexForward: false, // Get most recent orders first
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return Items || [];
    } catch (e) {
        console.error("Error fetching order history:", e);
        throw e;
    }
};
