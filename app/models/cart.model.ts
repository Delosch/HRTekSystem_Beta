import { PutCommand, QueryCommand, TransactWriteCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

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
}

// Add items to company cart with unique sort keys
export const addOrUpdateCartItem = async (item: CartItem) => {
    console.log("creating cart\n", item);
    
    // Create a unique sort key for each cart item using product name + timestamp
    const uniqueId = uuidv4();
    const cartSK = `CART#${uniqueId}`;
    
    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: {
            pk: `COMPANY#${item.companyId}`,
            sk: cartSK, // Unique sort key for each item
            productName: item.productName,
            price: item.price,
            addedBy: item.userId,
            addedAt: new Date().toISOString(),
            itemId: uniqueId, // Store the unique ID for easy reference
        },
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Item ${item.productName} added to cart for company ${item.companyId}`);
        return { success: true, itemId: uniqueId };
    } catch (e) {
        console.error("Error adding item to cart:", e);
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
