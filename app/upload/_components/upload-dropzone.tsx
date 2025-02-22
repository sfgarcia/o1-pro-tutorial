"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useAuth } from "@clerk/nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud } from "lucide-react"
import { validateFile } from "../../../lib/file-validation"
import type { ActionState } from "@/types"

/**
 * @description
 * Client component for drag-and-drop receipt upload with integrated validation and processing.
 * Handles the complete upload flow:
 * 1. Client-side file validation
 * 2. Supabase storage upload to 'pending' bucket
 * 3. Triggers server-side processing via form submission
 *
 * Key features:
 * - Drag-and-drop UI with visual feedback
 * - File type/size validation before upload
 * - Loading states during processing
 * - Error handling with user feedback
 *
 * @dependencies
 * - react-dropzone: Handles drag-and-drop functionality
 * - @clerk/nextjs: For user authentication
 * - @supabase/auth-helpers-nextjs: Client-side Supabase operations
 */
export function UploadDropzone() {
  const { userId } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!userId) {
        setUploadError("User not authenticated")
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      // Client-side validation
      const validation = validateFile(file)
      if (!validation.isValid) {
        setUploadError(validation.error || "Invalid file")
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        // Generate unique file path
        const timestamp = Date.now()
        const fileExtension = file.name.split(".").pop()
        const fileName = `${timestamp}.${fileExtension}`
        const filePath = `pending/${userId}/${fileName}`

        // Upload to Supabase storage
        const { error } = await supabase.storage
          .from("receipts")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          })

        if (error) throw error

        // Trigger processing
        const response = await fetch("/api/process-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath, userId })
        })

        if (!response.ok) {
          throw new Error("Failed to start processing")
        }
      } catch (error) {
        console.error("Upload error:", error)
        setUploadError(
          error instanceof Error ? error.message : "File upload failed"
        )
      } finally {
        setIsUploading(false)
      }
    },
    [userId, supabase]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    multiple: false,
    disabled: isUploading
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? "border-primary bg-muted" : "border-muted-foreground/50"}
          ${isUploading ? "cursor-wait opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          {isUploading ? (
            <Loader2 className="text-muted-foreground size-12 animate-spin" />
          ) : (
            <UploadCloud className="text-muted-foreground size-12" />
          )}
          <div>
            <p className="font-medium">
              {isDragActive
                ? "Drop receipt here"
                : "Drag & drop receipt or click to browse"}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Supported formats: JPG, PNG (max 10MB)
            </p>
          </div>
          <Button variant="outline" disabled={isUploading} type="button">
            Select File
          </Button>
        </div>
      </div>

      {uploadError && (
        <p className="text-destructive text-center text-sm">{uploadError}</p>
      )}
    </div>
  )
}
