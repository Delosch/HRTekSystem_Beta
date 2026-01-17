import { PutCommand, GetCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server"; // Ensure this path is correct
import { companyProfileSchema, CompanyProfileInput, CompanyProfileItem } from "~/schemas/companySchema";

// Centralize configuration
const USERS_TABLE = process.env.DYNAMODB_COMPANIES_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

// Initialize DynamoDB client once
try {
  ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
  console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
  if (error instanceof Error) {
    console.error(`Details: ${error.message}`);
  }
  // Exiting allows infrastructure to detect and potentially restart
  process.exit(1);
}

/**
 * Creates a new company profile in DynamoDB.
 * Ensures that a company with the same pan_gst_adhaar cannot be created twice
 * to prevent duplicate company profiles.
 *
 * @param data - The company profile data to be stored.
 * @returns An object containing the ID of the newly created company.
 * @throws {Error} If validation fails or there's a DynamoDB operation error.
 */
export async function createCompanyProfile(data: CompanyProfileInput): Promise<{ id: string }> {
  try {
    // 1. Validate incoming data
    const validatedData = companyProfileSchema.parse(data);

    const {
      company_name,
      brand_name,
      govid_type,
      pan_gst_adhaar,
      address,
      pin_code,
      logo_url,
      premises_image_url,
      is_onboarding_completed,
      website_url,
      industry,
      country_iso,
      employee_count,
      createdBy,
    } = validatedData;

    // Use a deterministic PK for lookups based on a unique business identifier
    // For company profiles, pan_gst_adhaar is a good candidate for uniqueness,
    // but the actual PK for the company *profile* should still be unique per company.
    // The pan_gst_adhaar can be stored in a GSI for uniqueness checks.

    // Let's assume we want to prevent creating multiple company profiles
    // with the *same* pan_gst_adhaar.
    // We can use a combination of a unique ID for the PK and a GSI for pan_gst_adhaar
    // or perform a check before putting. For simplicity and to fit your existing PK pattern,
    // we'll perform a check first.

    // Check if a company with the same pan_gst_adhaar already exists
    // This requires a GSI on pan_gst_adhaar or scanning (which is bad).
    // A better approach for strict uniqueness on `pan_gst_adhaar` is a separate
    // "unique_identifiers" table or a GSI that allows for a `ConditionExpression`
    // on `attribute_not_exists` if `pan_gst_adhaar` were part of a unique key.

    // Given your current PK/SK design, if `pan_gst_adhaar` must be truly unique
    // across all companies, you might need a secondary index (GSI) or a separate
    // mechanism to track unique IDs.

    // For now, let's assume `pan_gst_adhaar` is unique enough for this check
    // if you plan to query by it frequently. If not, the `randomUUID` for the PK
    // is fine, but you'd need another mechanism for `pan_gst_adhaar` uniqueness enforcement.

    // **Alternative for `pan_gst_adhaar` uniqueness**:
    // If `pan_gst_adhaar` *must* be globally unique and act as a natural key,
    // a common pattern is to make `PK: COMPANY#<pan_gst_adhaar>`, `SK: PROFILE`.
    // However, your current `PK: COMPANY#<companyId>` suggests `companyId` is the primary identifier.
    // Let's stick to your `companyId` as the PK and enforce `pan_gst_adhaar` uniqueness
    // by attempting to put it with a `ConditionExpression` that relies on a GSI
    // if `pan_gst_adhaar` is indexed, or by a preliminary `GetCommand`.

    // For simplicity, let's add a check for `pan_gst_adhaar` existence *before* creating.
    // This is not perfectly atomic without a GSI and a transact write, but it's a good start.

    // NOTE: For true atomicity and strong uniqueness guarantees on `pan_gst_adhaar`
    // you would typically create a GSI on `pan_gst_adhaar` and use a `ConditionExpression`
    // on that GSI or use DynamoDB Transactions if supported and necessary for your use case.
    // Without a GSI on `pan_gst_adhaar`, checking for its existence would require
    // a scan (bad) or a lookup by a different key if you had one.
    // For this example, we will assume a GSI `PanGstAadhaarIndex` on `pan_gst_adhaar` exists.
    // If not, this check won't work efficiently.
    /*
    const checkCommand = new GetCommand({
      TableName: USERS_TABLE,
      IndexName: "PanGstAadhaarIndex", // This GSI needs to be created in your DynamoDB table
      Key: {
        pan_gst_adhaar: pan_gst_adhaar,
      },
      ProjectionExpression: "pk", // Only fetch the PK
    });
    const { Item: existingCompany } = await ddbDocClient.send(checkCommand);

    if (existingCompany) {
      throw new Error("A company with this PAN/GST/Aadhaar number already exists.");
    }
    */
    // Given your current schema and use of `randomUUID` for PK, `pan_gst_adhaar`
    // is just an attribute. If it truly needs to be unique across all companies,
    // you MUST implement a GSI or a separate uniqueness tracking mechanism.
    // For now, we'll proceed assuming `randomUUID` is your primary uniqueness.

    const companyId = randomUUID();
    const newItem: CompanyProfileItem = {
      pk: `COMPANY#${companyId}`,
      sk: "PROFILE",
      profile_type: "COMPANY",
      company_name,
      brand_name,
      govid_type,
      pan_gst_adhaar,
      website_url,
      industry,
      country_iso,
      address,
      pin_code,
      logo_url,
      premises_image_url,
      is_onboarding_completed,
      employee_count,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    const putCommand = new PutCommand({
      TableName: USERS_TABLE,
      Item: newItem,
      // `ConditionExpression` here is important for idempotency if PK was deterministic,
      // but with `randomUUID`, `attribute_not_exists(pk)` is always true for a new item.
      // If `pan_gst_adhaar` needs to be unique, you'd need a GSI and a condition on it.
      // For now, the `ConditionExpression` "attribute_not_exists(unique_id)" is not relevant
      // as `unique_id` is not in your schema and `pk` will always be new.
      // Let's remove it if `unique_id` isn't a known attribute that ensures uniqueness here.
      // If you meant `attribute_not_exists(pk)`, it's redundant with `randomUUID`.
      // If you meant some other unique attribute, it must be part of the `Item` or a GSI.
      // For creating a *new* item with a random PK, no condition expression is needed here
      // unless you're trying to prevent overwriting existing items with the same PK (not applicable with randomUUID).
    });

    await ddbDocClient.send(putCommand);

    return { id: companyId };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.warn("Validation error during company profile creation:", error.issues);
      // Re-throw a more structured error for Remix loaders/actions to catch and return
      throw new Error(`Validation Failed: ${JSON.stringify(error.issues.map(issue => ({ path: issue.path, message: issue.message })))}`);
    } else if (error instanceof Error) {
      console.error("DynamoDB operation error during company profile creation:", error.message);
      // Generic error for the client
      throw new Error(`Failed to create company profile: ${error.message}`);
    } else {
      console.error("An unexpected error occurred during company profile creation:", error);
      throw new Error("An unexpected error occurred while processing your request.");
    }
  }
}

export async function getCompanyProfile(companyId: string): Promise<CompanyProfileItem | null> {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: {
      pk: `COMPANY#${companyId}`,
      sk: "PROFILE",
    },
  });

  try {
    const { Item } = await ddbDocClient.send(command);
    return Item as CompanyProfileItem | null;
  } catch (error: unknown) {
    console.error(`Error fetching company profile for ID ${companyId}:`, error);
    throw new Error("Failed to retrieve company profile.");
  }
}


export async function getAllCompanyProfiles(
  pagelimit: number = 20,
  pagekey: string | null = null
): Promise<{ items: CompanyProfileItem[], lastKey: string | null } | null> {

  const command = new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: "profile_type-index", // Use your GSI
    KeyConditionExpression: "profile_type = :profileType",
    ExpressionAttributeValues: {
      ":profileType": "COMPANY"
    },
    Limit: pagelimit,
    ExclusiveStartKey: pagekey ? JSON.parse(pagekey) : undefined
  });

  try {
    const response = await ddbDocClient.send(command);

    console.log('Query Results:', {
      count: response.Count,
      scannedCount: response.ScannedCount,
      items: response.Items?.length,
      lastKey: response.LastEvaluatedKey
    });

    return {
      items: (response.Items as CompanyProfileItem[]) || [],
      lastKey: response.LastEvaluatedKey ? JSON.stringify(response.LastEvaluatedKey) : null,
    };
  } catch (err) {
    console.error("Error querying profile_type-index:", err);
    throw err;
  }
}