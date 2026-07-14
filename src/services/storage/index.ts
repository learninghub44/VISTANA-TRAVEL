import fs from "fs";
import path from "path";
import { getSupabaseClient } from "@/services/db/supabaseClient";

export interface StorageProvider {
  uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
}

// Local-disk fallback for `next dev`. NOTE: this cannot work on Cloudflare
// Workers at all — there is no writable filesystem there — so it only ever
// runs in local development where NEXT_PUBLIC_SUPABASE_URL is unset.
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

// Default bucket name; override with SUPABASE_STORAGE_BUCKET if you want a
// different bucket. The bucket must exist and be public (see
// supabase/migrations/20260714120001_create_storage_bucket.sql) so uploaded
// images are servable via a plain public URL without extra signing.
const DEFAULT_BUCKET = "images";

class SupabaseStorageProvider implements StorageProvider {
  async uploadImage(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    const safeName = Date.now() + "_" + fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");

    const client = getSupabaseClient();
    const { error } = await client.storage.from(bucket).upload(safeName, fileBuffer, {
      contentType: mimeType,
      cacheControl: "31536000", // 1 year — filenames are already unique (timestamp-prefixed)
      upsert: false,
    });

    if (error) {
      throw new Error(`[Vistana Storage] Supabase Storage upload failed (bucket "${bucket}"): ${error.message}`);
    }

    const { data } = client.storage.from(bucket).getPublicUrl(safeName);
    return data.publicUrl;
  }
}

// Provider is resolved lazily (per call, cached after first success) rather
// than once at module load — same Workers/OpenNext env-timing concern as
// src/services/db/supabaseClient.ts. Supabase Storage is used whenever
// Supabase itself is configured (same credentials as the database), falling
// back to local disk only for `next dev` without Supabase configured at all.
let cachedProvider: StorageProvider | null = null;

function resolveStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!useSupabase) {
    console.warn(
      "[Vistana Storage] NEXT_PUBLIC_SUPABASE_URL not set — using LocalStorageProvider, which writes to the local " +
      "filesystem and will fail on Cloudflare Workers (no writable fs there). Configure Supabase to enable image uploads in production."
    );
  }

  cachedProvider = useSupabase ? new SupabaseStorageProvider() : new LocalStorageProvider();
  return cachedProvider;
}

export const storage: StorageProvider = {
  uploadImage: (fileBuffer, fileName, mimeType) =>
    resolveStorageProvider().uploadImage(fileBuffer, fileName, mimeType),
};
