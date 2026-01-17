"use client"

import { useState } from "react"

interface CopyHabitsDialogProps {
  currentMonth: number
  currentYear: number
  allMonths: Array<{ key: string; label: string }>
  onCopy: (targetMonthKey: string) => void
  onClose: () => void
}

export default function CopyHabitsDialog({
  currentMonth,
  currentYear,
  allMonths,
  onCopy,
  onClose,
}: CopyHabitsDialogProps) {
  const [selectedTargetMonth, setSelectedTargetMonth] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleCopy = () => {
    if (!selectedTargetMonth) {
      setError("Please select a destination month")
      return
    }

    const currentMonthKey = `${currentYear}-${currentMonth}`
    if (selectedTargetMonth === currentMonthKey) {
      setError("Cannot copy to the same month")
      return
    }

    onCopy(selectedTargetMonth)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Copy Habits</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Copy all habits from this month to another month. Completion data will reset for the target month.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Select destination month:</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allMonths.map((month) => {
                const currentMonthKey = `${currentYear}-${currentMonth}`
                const isCurrent = month.key === currentMonthKey
                return (
                  <button
                    key={month.key}
                    onClick={() => {
                      setSelectedTargetMonth(month.key)
                      setError("")
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-smooth text-left ${
                      selectedTargetMonth === month.key
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    } ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isCurrent}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{month.label}</span>
                      {isCurrent && <span className="text-xs text-muted-foreground">(Current)</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium"
            >
              Copy Habits
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
