"use server"

/**
 * @description
 * Dashboard page showing key financial metrics and recent receipts.
 * Combines server-side data fetching with client-side visualizations.
 */

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { ReceiptTable } from "@/components/receipts/receipt-table"
import { PieChart } from "@/components/charts/pie-chart"
import {
  getReceiptsAction,
  updateReceiptAction
} from "@/db/actions/receipts-actions"
import { processReceiptsForChart } from "@/lib/chart-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { UpdateReceiptFn } from "@/types/receipt-types"
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Spending Overview</h1>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <ChartSection userId={userId} />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Receipts</h2>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ReceiptTableSection userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}

async function ChartSection({ userId }: { userId: string }) {
  const { data: receipts } = await getReceiptsAction(userId)
  const chartData = processReceiptsForChart(receipts || [])
  return <PieChart data={chartData} />
}

async function ReceiptTableSection({ userId }: { userId: string }) {
  const { data: receipts } = await getReceiptsAction(userId)

  return <ReceiptTable data={receipts || []} />
}
