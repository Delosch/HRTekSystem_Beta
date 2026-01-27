import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "HRTekTable"; // Ensure this matches your actual table name env var

export interface PageSeoData {
    route: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonical?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    updatedAt?: string;
}

export async function getPageSeo(route: string): Promise<PageSeoData | null> {
    const ddb = getDynamoDBDocumentClient();
    const params = {
        TableName: TABLE_NAME,
        Key: {
            pk: `SEO#PAGE#${route}`,
            sk: "METADATA",
        },
    };

    try {
        const { Item } = await ddb.send(new GetCommand(params));
        return Item as PageSeoData | null;
    } catch (error) {
        console.error(`Error fetching SEO for ${route}:`, error);
        return null;
    }
}

export async function updatePageSeo(data: PageSeoData) {
    const ddb = getDynamoDBDocumentClient();
    const params = {
        TableName: TABLE_NAME,
        Item: {
            pk: `SEO#PAGE#${data.route}`,
            sk: "METADATA",
            ...data,
            updatedAt: new Date().toISOString(),
        },
    };

    try {
        await ddb.send(new PutCommand(params));
        return { success: true };
    } catch (error) {
        console.error("Error updating SEO:", error);
        throw error;
    }
}

// Optional: List all configured SEO pages
export async function getAllSeoPages() {
    // Note: This is inefficient for large tables, but fine for small number of SEO configs.
    // Ideally use a GSI if needed.
    // For now, scan is okay if pk starts with SEO#PAGE
    // Actually, without GSI, we can't efficiently query just SEO items unless we scan.
    // Assuming strict PK structure, we might just store a list of routes in a separate item if needed.
    // Or just rely on the fixed list in the Admin UI.
    return [];
}
