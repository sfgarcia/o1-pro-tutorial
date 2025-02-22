/**
 * @description Type definitions for Supabase storage operations
 *
 * @interface UploadFileStorageParams - Parameters for file upload operation
 * @interface MoveFileStorageParams - Parameters for file move operation
 * @interface DeleteFileStorageParams - Parameters for file delete operation
 *
 * @notes
 * - All paths should be relative to bucket root
 * - Bucket names must match values in SUPABASE_STORAGE_BUCKETS env var
 */

export interface UploadFileStorageParams {
  bucket: string
  path: string
  file: File
}

export interface MoveFileStorageParams {
  sourceBucket: string
  sourcePath: string
  destBucket: string
  destPath: string
}

export interface DeleteFileStorageParams {
  bucket: string
  path: string
}

export type StorageErrorType =
  | "invalid_bucket"
  | "file_validation"
  | "storage_operation"
  | "unknown_error"
