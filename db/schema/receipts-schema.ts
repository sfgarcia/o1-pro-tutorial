/**
 * @description
 * Schema definition for the 'receipts' table.
 * Stores processed receipt data with AI-extracted fields and verification status.
 *
 * Columns:
 * - id: UUID primary key
 * - userId: Clerk user ID (text)
 * - originalFile: Supabase storage path (text)
 * - merchant: Extracted merchant name
 * - amount: Total amount (decimal with 10,2 precision)
 * - date: Transaction date
 * - category: Expense category enum
 * - isVerified: User verification status
 * - createdAt/updatedAt: Timestamps with auto-update
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  numeric
} from "drizzle-orm/pg-core"

export const receiptsTable = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  originalFile: text("original_file").notNull(),
  merchant: text("merchant").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertReceipt = typeof receiptsTable.$inferInsert
export type SelectReceipt = typeof receiptsTable.$inferSelect
