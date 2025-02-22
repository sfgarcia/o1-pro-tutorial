/**
 * @description
 * Utilities for processing receipt data into chart-compatible formats.
 * Includes category aggregation and color generation functions.
 */

import { SelectReceipt } from "@/db/schema/receipts-schema"

export interface ChartData {
  name: string
  value: number
  color: string
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#22c55e",
  transport: "#3b82f6",
  lodging: "#f59e0b",
  other: "#94a3b8"
}

export function processReceiptsForChart(
  receipts: SelectReceipt[]
): ChartData[] {
  const categoryMap = receipts.reduce(
    (acc, receipt) => {
      if (!receipt.isVerified || !receipt.amount) return acc
      const key = receipt.category || "other"
      acc[key] = (acc[key] || 0) + Number(receipt.amount)
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(categoryMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other
  }))
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other
}
