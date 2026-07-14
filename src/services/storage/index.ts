import fs from "fs";
import path from "path";

// In a real application, you would configure AWS S3 Client for Cloudflare R2:
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface StorageProvider {
  uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
}

class LocalStorageProvider implements StorageProvider {
  async uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Clean up filename to prevent directory traversal
    const safeName = Date.now() + "_" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = path.join(uploadDir, safeName);
    
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/${safeName}`;
  }
}

class R2StorageProvider implements StorageProvider {
  async uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    // Falls back to local storage if AWS SDK or credentials are missing
    try {
      if (
        !process.env.R2_ACCOUNT_ID ||
        !process.env.R2_ACCESS_KEY_ID ||
        !process.env.R2_SECRET_ACCESS_KEY ||
        !process.env.R2_BUCKET_NAME
      ) {
        throw new Error("R2 Credentials missing");
      }
      
      // dynamically import AWS SDK to prevent import errors if not installed
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      
      const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });

      const safeName = Date.now() + "_" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
      
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: safeName,
          Body: fileBuffer,
          ContentType: mimeType,
        })
      );
      
      const customDomain = process.env.R2_CUSTOM_DOMAIN || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
      return `${customDomain}/${safeName}`;
    } catch (e) {
      console.warn("[Vistana Storage] Cloudflare R2 upload failed or not configured, falling back to local file storage:", e);
      return new LocalStorageProvider().uploadImage(fileBuffer, fileName, mimeType);
    }
  }
}

// Same class of bug fixed in src/services/db/supabaseDb.ts: deciding the
// provider once at module top-level reads process.env at import time, which
// on Cloudflare Workers can run before per-request env population — risking
// a silent fall-through to LocalStorageProvider. That fallback is doubly
// broken there anyway, since Workers have no writable filesystem (fs.*
// calls will throw) — it only works under `next dev` / a Node server.
// Resolving the provider lazily, per call, avoids the timing issue and
// keeps the R2 path as the only one that can actually work in production.
let cachedProvider: StorageProvider | null = null;

function resolveStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const useR2 = Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );

  if (!useR2) {
    console.warn(
      "[Vistana Storage] R2 credentials not set (or not visible at runtime) — using LocalStorageProvider, " +
      "which writes to the local filesystem and will fail on Cloudflare Workers (no writable fs there). " +
      "Set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME as Wrangler secrets for production."
    );
  }

  cachedProvider = useR2 ? new R2StorageProvider() : new LocalStorageProvider();
  return cachedProvider;
}

export const storage: StorageProvider = {
  uploadImage: (fileBuffer, fileName, mimeType) =>
    resolveStorageProvider().uploadImage(fileBuffer, fileName, mimeType),
};
