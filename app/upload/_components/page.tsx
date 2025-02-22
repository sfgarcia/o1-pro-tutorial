"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UploadDropzone } from "./upload-dropzone"

/**
 * @description
 * Server component for the receipt upload page. Handles:
 * - User authentication check
 * - Page layout and structure
 * - Integration of upload dropzone component
 *
 * Security:
 * - Automatically redirects unauthenticated users to sign-in
 * - Only renders upload interface for authenticated users
 */
export default async function UploadPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Upload Receipt</h1>
        <p className="text-muted-foreground">
          Upload an image of your receipt to process it with AI
        </p>
      </div>
      <UploadDropzone />
    </div>
  )
}
