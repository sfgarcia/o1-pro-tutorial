/*
Contains type definitions related to receipt operations.
Extends base Drizzle types with additional UI-specific properties
and validation states for the frontend components.

Types:
- ReceiptWithStatus: Combines receipt data with verification status
- ReceiptTableColumn: Type definition for table column configuration
- ReceiptValidationError: Structure for validation error messages

Dependencies:
- SelectReceipt from @/db/schema/receipts-schema
*/

import { SelectReceipt } from "@/db/schema/receipts-schema"

export interface ReceiptWithStatus extends SelectReceipt {
  validationStatus: "valid" | "needs_review" | "error"
  validationErrors?: string[]
}

export type ReceiptTableColumn = {
  header: string
  accessor: keyof SelectReceipt
  isEditable?: boolean
  validation?: (value: any) => string | null
}

export type ReceiptValidationError = {
  field: keyof SelectReceipt
  message: string
}

export type ReceiptUploadResponse = {
  success: boolean
  receipt?: SelectReceipt
  errors?: ReceiptValidationError[]
  message?: string
}
