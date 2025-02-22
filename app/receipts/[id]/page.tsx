"use server"

import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { getReceiptByIdAction } from "@/db/actions/receipts-actions"
import { generateSignedUrlStorage } from "@/actions/storage/signed-url"
import { VerificationViewer } from "./_components/verification-viewer"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ReceiptVerificationPage({
  params
}: {
  params: { id: string }
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { data: receipt } = await getReceiptByIdAction(params.id)
  if (!receipt || receipt.userId !== userId) notFound()

  const { data: signedUrl } = await generateSignedUrlStorage(
    receipt.originalFile
  )

  return (
    <div className="mx-auto max-w-6xl py-8">
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <VerificationViewer receipt={receipt} imageUrl={signedUrl?.url || ""} />
      </Suspense>
    </div>
  )
}
