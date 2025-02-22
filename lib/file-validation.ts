/**
 * @description
 * File validation utilities for receipt uploads. Contains:
 * - File size validation (10MB max)
 * - MIME type validation (image/jpeg, image/png)
 * - Structured error messages
 *
 * Constants:
 * - MAX_FILE_SIZE: 10MB in bytes
 * - ALLOWED_MIME_TYPES: Approved image types
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"]

export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size exceeds 10MB limit"
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPG and PNG files are supported"
    }
  }

  return { isValid: true }
}
