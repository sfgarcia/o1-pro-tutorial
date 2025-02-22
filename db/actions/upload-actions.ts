"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"
import type {
  UploadFileStorageParams,
  MoveFileStorageParams,
  DeleteFileStorageParams
} from "@/types"

/**
 * @description Handles Supabase storage operations for receipt management
 *
 * Key Features:
 * - Secure file upload with size and type validation
 * - Atomic file operations with proper error handling
 * - Environment-based bucket configuration
 * - RLS-compatible path structure
 *
 * @dependencies
 * - Supabase JS Client: For storage operations
 * - Environment Variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKETS
 *
 * @notes
 * - All file paths should follow {bucket}/{userId}/{status}/{filename} format
 * - Uses service role key for admin operations (handle with care)
 * - Validates against 10MB file size limit and image types only
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds 10MB limit" }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, error: "Only JPG, PNG, and WEBP files allowed" }
  }

  return { isValid: true }
}

export async function uploadFileStorage({
  bucket,
  path,
  file
}: UploadFileStorageParams): Promise<ActionState<{ path: string }>> {
  try {
    // Validate environment configuration
    const allowedBuckets =
      process.env.SUPABASE_STORAGE_BUCKETS?.split(",") || []
    if (!allowedBuckets.includes(bucket)) {
      throw new Error("Invalid storage bucket configured")
    }

    // Validate file constraints
    const validation = validateFile(file)
    if (!validation.isValid) {
      return { isSuccess: false, message: validation.error! }
    }

    // Execute upload with error handling
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
        duplex: "half"
      })

    if (error) throw error

    return {
      isSuccess: true,
      message: "File uploaded successfully",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("File upload error:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "File upload failed"
    }
  }
}

export async function moveFileStorage({
  sourceBucket,
  sourcePath,
  destBucket,
  destPath
}: MoveFileStorageParams): Promise<ActionState<void>> {
  try {
    // Validate buckets
    const allowedBuckets =
      process.env.SUPABASE_STORAGE_BUCKETS?.split(",") || []
    if (
      !allowedBuckets.includes(sourceBucket) ||
      !allowedBuckets.includes(destBucket)
    ) {
      throw new Error("Invalid source or destination bucket")
    }

    // Supabase currently requires same-bucket moves
    if (sourceBucket !== destBucket) {
      throw new Error("Cross-bucket moves not supported")
    }

    const { data, error } = await supabase.storage
      .from(sourceBucket)
      .move(sourcePath, destPath)

    if (error) throw error

    return {
      isSuccess: true,
      message: "File moved successfully",
      data: undefined
    }
  } catch (error) {
    console.error("File move error:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "File move failed"
    }
  }
}

export async function deleteFileStorage({
  bucket,
  path
}: DeleteFileStorageParams): Promise<ActionState<void>> {
  try {
    const allowedBuckets =
      process.env.SUPABASE_STORAGE_BUCKETS?.split(",") || []
    if (!allowedBuckets.includes(bucket)) {
      throw new Error("Invalid storage bucket")
    }

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error

    return {
      isSuccess: true,
      message: "File deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("File deletion error:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "File deletion failed"
    }
  }
}
