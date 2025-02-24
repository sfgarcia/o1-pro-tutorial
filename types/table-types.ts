/**
 * @description
 * Type definitions for the receipt table component configuration.
 * Defines column structure, validation rules, and editing capabilities.
 *
 * Types:
 * - ReceiptTableColumn: Configuration for each table column
 * - ReceiptValidationFn: Type signature for validation functions
 *
 * @dependencies
 * - SelectReceipt from @/db/schema/receipts-schema
 */

import { SelectReceipt } from "@/db/schema/receipts-schema"

export type ReceiptValidationFn = (value: any) => string | null

export interface ReceiptTableColumn {
  /**
   * Display header for the column
   */
  header: string

  /**
   * Key of the receipt data to access
   */
  accessor: keyof SelectReceipt

  /**
   * Whether the column is editable
   * @default false
   */
  isEditable?: boolean

  /**
   * Validation function that returns error message or null
   */
  validation?: ReceiptValidationFn

  /**
   * Custom cell rendering function
   */
  render?: (value: any, row: SelectReceipt) => React.ReactNode
}

export const amountValidator: ReceiptValidationFn = value => {
  if (typeof value !== "number") return "Must be a number"
  if (value <= 0) return "Must be positive"
  return null
}

export const dateValidator: ReceiptValidationFn = value => {
  if (!(value instanceof Date)) return "Invalid date"
  const now = new Date()
  if (value > now) return "Date cannot be in future"
  if (value < new Date(2000, 0, 1)) return "Date too old"
  return null
}
