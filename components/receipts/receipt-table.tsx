"use client"

/**
 * @description
 * Main receipt table component using TanStack Table for advanced features.
 * Handles:
 * - Sorting by columns
 * - Pagination
 * - Inline editing with validation
 * - Verification status display
 *
 * @features
 * - Responsive design
 * - Loading states
 * - Error handling
 * - Type-safe column configuration
 */

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState
} from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ReceiptTableColumn,
  amountValidator,
  dateValidator
} from "@/types/table-types"
import { SelectReceipt } from "@/db/schema/receipts-schema"
import { EditableCell } from "./editable-cell"
import { UpdateReceiptFn } from "@/types/receipt-types"
import { ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"

const columnHelper = createColumnHelper<SelectReceipt>()

const defaultColumns: ReceiptTableColumn[] = [
  {
    header: "Merchant",
    accessor: "merchant",
    isEditable: true,
    validation: value => (value?.length >= 2 ? null : "Minimum 2 characters")
  },
  {
    header: "Amount",
    accessor: "amount",
    isEditable: true,
    validation: amountValidator,
    render: value => `$${value?.toFixed(2)}`
  },
  {
    header: "Date",
    accessor: "date",
    isEditable: true,
    validation: dateValidator,
    render: value => value?.toLocaleDateString()
  },
  {
    header: "Category",
    accessor: "category",
    render: value => (
      <Badge variant="outline" className="capitalize">
        {value}
      </Badge>
    )
  },
  {
    header: "Status",
    accessor: "isVerified",
    render: value => (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Verified" : "Pending"}
      </Badge>
    )
  }
]

interface ReceiptTableProps {
  data: SelectReceipt[]
  onUpdate: UpdateReceiptFn
  isLoading?: boolean
}

export function ReceiptTable({ data, onUpdate, isLoading }: ReceiptTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())

  const handleUpdate = async (
    id: string,
    accessor: keyof SelectReceipt,
    value: any
  ) => {
    setUpdatedIds(prev => new Set(prev.add(id)))
    await onUpdate(id, { [accessor]: value })
    setUpdatedIds(prev => {
      prev.delete(id)
      return new Set(prev)
    })
  }

  const columns = defaultColumns.map(col =>
    columnHelper.accessor(col.accessor, {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {col.header}
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row, getValue }) => {
        const isUpdating = updatedIds.has(row.original.id)
        const value = getValue()

        if (isLoading) return <Skeleton className="h-4 w-[50px]" />
        if (isUpdating) return <Loader2 className="size-4 animate-spin" />

        if (col.isEditable) {
          return (
            <EditableCell
              value={value}
              onSave={newValue =>
                handleUpdate(row.original.id, col.accessor, newValue)
              }
              validation={col.validation}
              type={
                col.accessor === "amount"
                  ? "number"
                  : col.accessor === "date"
                    ? "date"
                    : "text"
              }
            />
          )
        }

        return col.render?.(value, row.original) ?? value
      }
    })
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-2 text-left">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
