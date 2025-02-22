"use client"

/**
 * @description
 * Editable table cell component with validation and error handling.
 * Supports click-to-edit behavior with automatic saving on blur or enter key.
 *
 * Features:
 * - Validation feedback with error messages
 * - Loading states during saving
 * - Type-specific input handling (date/number/text)
 *
 * @dependencies
 * - react-hook-form for input management
 * - Lucide icons for visual feedback
 */

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableCellProps {
  value: any
  onSave: (value: any) => Promise<void>
  validation?: (value: any) => string | null
  type?: "text" | "number" | "date"
}

export function EditableCell({
  value: initialValue,
  onSave,
  validation,
  type = "text"
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const parseValue = (val: string) => {
    if (type === "number") return Number(val)
    if (type === "date") return new Date(val)
    return val
  }

  const handleSave = async () => {
    const validationError = validation?.(inputValue) || null
    setError(validationError)

    if (validationError) return

    try {
      setIsSaving(true)
      await onSave(inputValue)
      setIsEditing(false)
    } catch (err) {
      setError("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isEditing) {
      setInputValue(initialValue)
      setError(null)
    }
  }, [isEditing, initialValue])

  if (!isEditing) {
    return (
      <div
        className="hover:bg-muted/50 flex min-h-[40px] cursor-pointer items-center p-2"
        onClick={() => setIsEditing(true)}
      >
        {type === "date" && initialValue?.toLocaleDateString()}
        {type !== "date" && initialValue}
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        value={
          type === "date" ? inputValue?.toISOString().split("T")[0] : inputValue
        }
        onChange={e => setInputValue(parseValue(e.target.value))}
        onBlur={handleSave}
        onKeyDown={e => e.key === "Enter" && handleSave()}
        type={type}
        autoFocus
        className={cn(
          "pr-10",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />

      <div className="absolute right-2 top-2 flex gap-1">
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : error ? (
          <X className="text-destructive size-4" />
        ) : (
          <Check className="size-4 text-green-600" />
        )}
      </div>

      {error && (
        <div className="text-destructive absolute -bottom-5 left-0 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
