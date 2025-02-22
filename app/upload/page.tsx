// app/upload/page.tsx
"use server"

import { UploadDropzone } from "./_components/upload-dropzone"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function UploadPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

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
