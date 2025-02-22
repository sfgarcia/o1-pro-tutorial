/*
Contains server actions for CRUD operations on receipts.
Handles database interactions with proper error handling,
user validation, and optimistic locking for data consistency.

Key Actions:
- createReceiptAction: Creates a new receipt entry
- getReceiptsAction: Retrieves receipts for a user
- getReceiptByIdAction: Gets single receipt by ID with user validation
- updateReceiptAction: Updates receipt with optimistic locking
- deleteReceiptAction: Deletes receipt with ownership validation

Dependencies:
- Drizzle ORM for database operations
- Clerk auth for user validation
- Custom ActionState type for standardized responses
*/

"use server"

import { db } from "@/db/db"
import {
  InsertReceipt,
  SelectReceipt,
  receiptsTable
} from "@/db/schema/receipts-schema"
import { ActionState } from "@/types"
import { and, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function createReceiptAction(
  receiptData: InsertReceipt
): Promise<ActionState<SelectReceipt>> {
  try {
    // Validate user exists
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    // Create new receipt with user ID from auth
    const [newReceipt] = await db
      .insert(receiptsTable)
      .values({ ...receiptData, userId })
      .returning()

    return {
      isSuccess: true,
      message: "Receipt created successfully",
      data: newReceipt
    }
  } catch (error) {
    console.error("Error creating receipt:", error)
    return { isSuccess: false, message: "Failed to create receipt" }
  }
}

export async function getReceiptsAction(
  userId: string
): Promise<ActionState<SelectReceipt[]>> {
  try {
    const receipts = await db.query.receipts.findMany({
      where: eq(receiptsTable.userId, userId),
      orderBy: (receipts, { desc }) => [desc(receipts.date)]
    })

    return {
      isSuccess: true,
      message: "Receipts retrieved successfully",
      data: receipts
    }
  } catch (error) {
    console.error("Error getting receipts:", error)
    return { isSuccess: false, message: "Failed to retrieve receipts" }
  }
}

export async function getReceiptByIdAction(
  receiptId: string
): Promise<ActionState<SelectReceipt>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    const receipt = await db.query.receipts.findFirst({
      where: and(
        eq(receiptsTable.id, receiptId),
        eq(receiptsTable.userId, userId)
      )
    })

    if (!receipt) {
      return { isSuccess: false, message: "Receipt not found" }
    }

    return {
      isSuccess: true,
      message: "Receipt retrieved successfully",
      data: receipt
    }
  } catch (error) {
    console.error("Error getting receipt:", error)
    return { isSuccess: false, message: "Failed to retrieve receipt" }
  }
}

export async function updateReceiptAction(
  receiptId: string,
  updateData: Partial<InsertReceipt>
): Promise<ActionState<SelectReceipt>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    // Optimistic locking using updatedAt
    const existingReceipt = await db.query.receipts.findFirst({
      where: and(
        eq(receiptsTable.id, receiptId),
        eq(receiptsTable.userId, userId)
      )
    })

    if (!existingReceipt) {
      return { isSuccess: false, message: "Receipt not found" }
    }

    const [updatedReceipt] = await db
      .update(receiptsTable)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(receiptsTable.id, receiptId),
          eq(receiptsTable.updatedAt, existingReceipt.updatedAt)
        )
      )
      .returning()

    return {
      isSuccess: true,
      message: "Receipt updated successfully",
      data: updatedReceipt
    }
  } catch (error) {
    console.error("Error updating receipt:", error)
    return {
      isSuccess: false,
      message:
        "Failed to update receipt. It may have been modified by another process."
    }
  }
}

export async function deleteReceiptAction(
  receiptId: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    await db
      .delete(receiptsTable)
      .where(
        and(eq(receiptsTable.id, receiptId), eq(receiptsTable.userId, userId))
      )

    return {
      isSuccess: true,
      message: "Receipt deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting receipt:", error)
    return { isSuccess: false, message: "Failed to delete receipt" }
  }
}
