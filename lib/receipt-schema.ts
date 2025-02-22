/**
 * @description
 * Zod validation schema for receipt data extracted by AI.
 * Ensures all extracted fields meet quality standards before saving to database.
 *
 * Validation Rules:
 * - Merchant: 2-100 characters
 * - Amount: Positive number <= 100,000
 * - Date: Valid date between 2000-01-01 and today
 * - Category: Must be one of predefined enum values
 *
 * @dependencies
 * - zod: Schema validation library
 * - @/db/schema: For category enum reference
 */

import { z } from "zod"
import { categoryEnum } from "@/db/schema"

export const ReceiptSchema = z.object({
  merchant: z
    .string()
    .min(2, "Merchant name must be at least 2 characters")
    .max(100, "Merchant name cannot exceed 100 characters")
    .transform(str => str.trim()),

  amount: z
    .number()
    .positive("Amount must be positive")
    .lte(100_000, "Amount cannot exceed 100,000")
    .transform(num => parseFloat(num.toFixed(2))),

  date: z
    .date()
    .min(new Date("2000-01-01"), "Date cannot be before 2000")
    .max(new Date(), "Date cannot be in the future"),

  category: z.enum(categoryEnum.enumValues, {
    required_error: "Category is required",
    invalid_type_error: "Invalid category provided"
  }),

  items: z
    .array(
      z.object({
        name: z.string().min(2, "Item name too short"),
        price: z.number().positive("Item price must be positive")
      })
    )
    .optional()
})

export type ReceiptData = z.infer<typeof ReceiptSchema>
