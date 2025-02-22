"use client"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useAuth } from "@clerk/nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2, UploadCloud } from "lucide-react"
import { validateFile } from "@/lib/file-validation"
import type { ActionState } from "@/types"

export function UploadDropzone() {
  const { userId } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!userId) {
        setUploadError("Please sign in to upload receipts")
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      const validation = validateFile(file)
      if (!validation.isValid) {
        setUploadError(validation.error || "Invalid file")
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const timestamp = Date.now()
        const fileExtension = file.name.split(".").pop()
        const fileName = `${timestamp}.${fileExtension}`
        const filePath = `pending/${userId}/${fileName}`

        const { error } = await supabase.storage
          .from("receipts")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          })

        if (error) throw error

        const response = await fetch("/api/process-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath, userId })
        })

        if (!response.ok) throw new Error("Processing failed")

        const { receiptId } = await response.json()
        window.location.href = `/receipts/${receiptId}`
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"}
          ${isUploading ? "cursor-wait opacity-50" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-4">
          {isUploading ? (
            <Loader2 className="text-primary size-12 animate-spin" />
          ) : (
            <div className="bg-primary/10 rounded-full p-4">
              <UploadCloud className="text-primary size-12" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {isUploading ? "Processing Receipt..." : "Upload Receipt"}
            </h2>
            <p className="text-muted-foreground">
              {isDragActive
                ? "Drop your receipt here"
                : "Drag & drop or click to browse"}
            </p>
          </div>

          <Button size="lg" className="gap-2" disabled={isUploading}>
            <UploadCloud className="size-4" />
            Choose File
          </Button>

          <p className="text-muted-foreground text-sm">
            Supported formats: JPG, PNG (max 10MB)
          </p>
        </div>
      </div>

      {uploadError && (
        <p className="text-destructive text-center">{uploadError}</p>
      )}
    </div>
  )
}
