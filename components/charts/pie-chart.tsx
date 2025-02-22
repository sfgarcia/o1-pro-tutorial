"use client"

/**
 * @description
 * Pie chart component for visualizing spending by category.
 * Features responsive container, hover effects, and custom tooltip.
 *
 * @dependencies
 * - Recharts for chart rendering
 * - Tailwind CSS for styling
 */

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { processReceiptsForChart } from "@/lib/chart-utils"

interface PieChartProps {
  data: ReturnType<typeof processReceiptsForChart>
}

export function PieChart({ data }: PieChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            content={({ payload }) => (
              <div className="bg-background rounded-lg border p-3 shadow-sm">
                <p className="font-medium">{payload?.[0]?.name}</p>
                <p className="text-muted-foreground">
                  ${(payload?.[0]?.value as number)?.toFixed(2)}
                </p>
              </div>
            )}
          />
        </RePieChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map(entry => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
