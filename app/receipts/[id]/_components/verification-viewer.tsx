"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { EditableCell } from "@/components/receipts/editable-cell"
import { Skeleton } from "@/components/ui/skeleton"
import { updateReceiptAction } from "@/db/actions/receipts-actions"
import { SelectReceipt } from "@/db/schema/receipts-schema"
import { Loader2 } from "lucide-react"

interface VerificationViewerProps {
  receipt: SelectReceipt
  imageUrl: string
}

export function VerificationViewer({
  receipt,
  imageUrl
}: VerificationViewerProps) {
  const [formData, setFormData] = useState({
    merchant: receipt.merchant || "",
    amount: receipt.amount || 0,
    date: receipt.date || new Date(),
    category: receipt.category || "other"
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleVerify = async () => {
    try {
      setIsSaving(true)
      await updateReceiptAction(receipt.id, {
        ...formData,
        amount: formData.amount.toString(),
        isVerified: true
      })
      // Add success toast here
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-8 p-6 md:grid-cols-2">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden rounded-lg border">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Uploaded receipt"
            fill
            className="object-contain"
          />
        ) : (
          <Skeleton className="size-full" />
        )}
      </div>

      {/* Data Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verify Receipt Details</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Merchant</label>
            <EditableCell
              value={formData.merchant}
              onSave={async value =>
                setFormData(prev => ({ ...prev, merchant: value }))
              }
              validation={val =>
                val?.length >= 2 ? null : "Minimum 2 characters"
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <EditableCell
              value={formData.amount}
              onSave={async value =>
                setFormData(prev => ({ ...prev, amount: Number(value) }))
              }
              type="number"
              validation={val => {
                if (val <= 0) return "Must be positive"
                return null
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <EditableCell
              value={formData.date}
              onSave={async value =>
                setFormData(prev => ({ ...prev, date: new Date(value) }))
              }
              type="date"
              validation={val => {
                if (val > new Date()) return "Date cannot be in future"
                return null
              }}
            />
          </div>
        </div>

        <Button onClick={handleVerify} disabled={isSaving} className="w-full">
          {isSaving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            "Verify and Save"
          )}
        </Button>
      </div>
    </div>
  )
}
