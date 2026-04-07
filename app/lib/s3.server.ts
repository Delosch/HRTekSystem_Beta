import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  S3ClientConfig,
  HeadObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash, randomUUID } from "crypto";
import mime from "mime-types";

// --- Configuration & Initialization ---

// Load environment variables correctly
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// S3 bucket region
const S3_BUCKET_REGION = process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1";

// Validate all required vars
if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
  console.error("❌ S3 Config Error: Missing required environment variables.");
  console.log("  AWS_REGION:", AWS_REGION ? "✅" : "❌");
  console.log("  AWS_ACCESS_KEY_ID:", AWS_ACCESS_KEY_ID ? "✅" : "❌");
  console.log("  AWS_S3_BUCKET_NAME (from S3_BUCKET_NAME):", AWS_S3_BUCKET_NAME ? "✅" : "❌");
  // Don't exit here in dev, maybe just log? 
  // Actually, senior says exit(1) is fine.
}

console.log(`📡 S3 Client Target: ${AWS_S3_BUCKET_NAME} in ${S3_BUCKET_REGION}`);

// Configure S3 client - use S3_BUCKET_REGION for bucket operations
const s3Config: S3ClientConfig = {
  region: S3_BUCKET_REGION, // Use bucket's actual region (us-east-1)
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID as string,
    secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
  },
  // Don't set explicit endpoint - let SDK auto-resolve based on bucket location
};

// Initialize S3 client
const s3Client = new S3Client(s3Config);
const BUCKET_NAME = AWS_S3_BUCKET_NAME;
const DEFAULT_BUCKET_REGION = S3_BUCKET_REGION || AWS_REGION || "us-east-1";
let cachedBucketRegion: string | null = null;

function getBucketRegionFromError(error: any): string | null {
  const metadataHeaders = error?.$metadata?.httpHeaders;
  const responseHeaders = error?.$response?.headers;
  const regionFromHeaders =
    metadataHeaders?.["x-amz-bucket-region"] ||
    responseHeaders?.["x-amz-bucket-region"];

  return (
    regionFromHeaders ||
    error?.BucketRegion ||
    error?.Region ||
    null
  );
}

function shouldRetryWithRegion(error: any): boolean {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.name || error?.Code || "").toLowerCase();

  return (
    message.includes("must be addressed using the specified endpoint") ||
    message.includes("incorrect region") ||
    message.includes("permanentredirect") ||
    code.includes("permanentredirect") ||
    code.includes("authorizationheadermalformed")
  );
}

function createRegionalClient(region: string): S3Client {
  return new S3Client({
    ...s3Config,
    region,
  });
}

async function discoverBucketRegion(): Promise<string | null> {
  if (cachedBucketRegion) return cachedBucketRegion;

  const candidateRegions = Array.from(
    new Set([DEFAULT_BUCKET_REGION, AWS_REGION, "us-east-1"].filter(Boolean) as string[])
  );

  for (const region of candidateRegions) {
    const probeClient = createRegionalClient(region);
    try {
      await probeClient.send(
        new HeadBucketCommand({
          Bucket: BUCKET_NAME,
        })
      );
      cachedBucketRegion = region;
      return cachedBucketRegion;
    } catch (error: any) {
      const detected = getBucketRegionFromError(error);
      if (detected) {
        cachedBucketRegion = detected;
        return detected;
      }
    }
  }

  cachedBucketRegion = DEFAULT_BUCKET_REGION;
  return cachedBucketRegion;
}

// ------------------------------------------------------------
// Helper validation functions
// ------------------------------------------------------------

function isValidMimeType(contentType: string): boolean {
  return mime.lookup(contentType) !== false;
}

function isValidFolderName(folder: string): boolean {
  return typeof folder === "string" && folder.trim().length > 0 && !folder.includes("..");
}

function isValidS3Key(key: string): boolean {
  return typeof key === "string" && key.trim().length > 0 && !key.startsWith("/") && !key.includes("..");
}

// ------------------------------------------------------------
// Generate Presigned Upload URL
// ------------------------------------------------------------
export async function getPresignedUploadUrl(contentType: string, folder: string) {
  if (!isValidMimeType(contentType)) throw new Error("Invalid content type");
  if (!isValidFolderName(folder)) throw new Error("Invalid folder name");

  try {
    const resolvedRegion = await discoverBucketRegion();
    const client = createRegionalClient(resolvedRegion || DEFAULT_BUCKET_REGION);

    const extension = mime.extension(contentType) || "bin";
    const fileName = `${folder.trim()}/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 600 });
    return { uploadUrl: signedUrl, key: fileName };
  } catch (error: any) {
    console.error("Error generating presigned upload URL:", error);
    throw new Error(error.message);
  }
}

// ------------------------------------------------------------
// Direct Upload with Hash Deduplication
// ------------------------------------------------------------
export async function uploadFileToS3(file: File, folder: string): Promise<string> {
  if (!(file instanceof File)) throw new Error("Invalid file");
  if (!isValidFolderName(folder)) throw new Error("Invalid folder name");
  if (file.size === 0) return "";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = mime.extension(file.type) || "bin";

    const hash_hex = createHash("sha256").update(buffer).digest("hex");
    const hash_base64 = createHash("sha256").update(buffer).digest("base64");

    const s3Key = `${folder.trim()}/${hash_hex}.${ext}`;

    // Check if already exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        })
      );
      return s3Key; // duplicate
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode !== 404) {
        throw new Error("Error checking existing file: " + err.message);
      }
    }

    // Upload new file
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
        ChecksumSHA256: hash_base64,
      })
    );

    return s3Key;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.message);
  }
}

// ------------------------------------------------------------
// Generate Presigned GET URL
// ------------------------------------------------------------
export async function getPresignedGetUrl(
  key: string,
  options?: {
    downloadFileName?: string;
  }
): Promise<string> {
  if (!isValidS3Key(key)) throw new Error("Invalid S3 key");

  try {
    const resolvedRegion = await discoverBucketRegion();
    const client = createRegionalClient(resolvedRegion || DEFAULT_BUCKET_REGION);

    const responseContentDisposition = options?.downloadFileName
      ? `attachment; filename="${options.downloadFileName.replace(/"/g, "")}"`
      : undefined;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: responseContentDisposition,
    });

    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error: any) {
    console.error("Error generating get URL:", error);
    throw new Error(error.message);
  }
}

// ------------------------------------------------------------
// Generic Upload to S3 (for payment proofs, documents, etc.)
// ------------------------------------------------------------
export async function uploadToS3(
  data: Buffer | File,
  key: string,
  contentType?: string
): Promise<string> {
  if (!isValidS3Key(key)) throw new Error("Invalid S3 key");

  try {
    let buffer: Buffer;
    let fileContentType: string;

    if (data instanceof File) {
      buffer = Buffer.from(await data.arrayBuffer());
      fileContentType = data.type;
    } else if (Buffer.isBuffer(data)) {
      buffer = data;
      fileContentType = contentType || "application/octet-stream";
    } else {
      throw new Error("Invalid data type. Expected Buffer or File.");
    }

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: fileContentType,
      ContentLength: buffer.length,
    });

    try {
      await s3Client.send(putCommand);
    } catch (error: any) {
      if (!shouldRetryWithRegion(error)) {
        throw error;
      }

      const detectedRegion = getBucketRegionFromError(error) || await discoverBucketRegion();
      if (!detectedRegion) {
        throw error;
      }

      cachedBucketRegion = detectedRegion;
      console.warn(`Retrying S3 upload with detected bucket region: ${detectedRegion}`);
      const regionalClient = createRegionalClient(detectedRegion);
      await regionalClient.send(putCommand);
    }

    // Return the S3 key (can be used to generate presigned URLs later)
    return key;
  } catch (error: any) {
    console.error("Upload to S3 error:", error);
    throw new Error(error.message);
  }
}

