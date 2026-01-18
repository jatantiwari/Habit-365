"use client"

import type React from "react"

import { useState } from "react"
import CopyHabitsDialog from "./copy-habits-dialog"
import BackupManager from "./backup-manager"

interface SettingsDialogProps {
  onClose: () => void
}

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [exportMessage, setExportMessage] = useState("")
  const [importError, setImportError] = useState("")
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showBackupManager, setShowBackupManager] = useState(false)

  const handleExportCSV = () => {
    try {
      const monthlyData = localStorage.getItem("monthlyData")
      if (!monthlyData) {
        setExportMessage("No data to export")
        return
      }

      const data = JSON.parse(monthlyData)
      let csv = "Year,Month,Day,Habit,Completed,Type,Time\n"

      Object.entries(data).forEach(([key, value]: any) => {
        const [year, month] = key.split("-")
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]

        if (value.habits && value.completions) {
          value.habits.forEach((habit: any) => {
            const completionArray = value.completions[habit.id] || []
            completionArray.forEach((completed: boolean, dayIndex: number) => {
              const day = dayIndex + 1
              const habitType = habit.type || "daily"
              const habitTime = habit.time || ""
              csv += `${year},${monthNames[Number.parseInt(month)]},${day},${habit.name},${completed ? "yes" : "no"},${habitType},${habitTime}\n`
            })
          })
        }
      })

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `habit-tracker-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      setExportMessage("Exported successfully!")
      setImportError("")
      setTimeout(() => setExportMessage(""), 3000)
    } catch (error) {
      setExportMessage("Export failed")
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImportError("")
      const { parseCSVFile, importCSVData } = await import("@/lib/csv-import")

      const content = await parseCSVFile(file)
      const importedData = importCSVData(content)

      const existingData = localStorage.getItem("monthlyData")
      const currentData = existingData ? JSON.parse(existingData) : {}

      const mergedData = { ...currentData, ...importedData }
      localStorage.setItem("monthlyData", JSON.stringify(mergedData))

      setExportMessage("Data imported successfully! Reloading...")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setImportError(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Import error:", error)
    }

    event.target.value = ""
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete all habit data? This cannot be undone.")) {
      localStorage.removeItem("monthlyData")
      setExportMessage("All data cleared")
      setTimeout(() => onClose(), 2000)
    }
  }

  const handleCopyHabits = async (targetMonthKey: string) => {
    try {
      const { copyHabitsToMonth } = await import("@/lib/habit-storage")
      const monthlyData = localStorage.getItem("monthlyData")
      if (!monthlyData) {
        setImportError("No data to copy")
        return
      }

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const sourceKey = `${currentYear}-${currentMonth}`

      const data = JSON.parse(monthlyData)
      const updatedData = copyHabitsToMonth(sourceKey, targetMonthKey, data)

      localStorage.setItem("monthlyData", JSON.stringify(updatedData))
      setExportMessage("Habits copied successfully!")
      setShowCopyDialog(false)
      setTimeout(() => setExportMessage(""), 3000)
    } catch (error) {
      setImportError(`Copy failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const getAvailableMonths = () => {
    const monthlyData = localStorage.getItem("monthlyData")
    if (!monthlyData) return []

    const data = JSON.parse(monthlyData)
    const months = []
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // Add future months (next 12 months)
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${month}`
      const label = `${monthNames[month]} ${year}`
      months.push({ key, label })
    }

    return months
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

        <div className="space-y-4">
          <button
            onClick={handleExportCSV}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium text-left flex items-center justify-between"
          >
            <span>Export Data as CSV</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9 2zm0 0v-8" />
            </svg>
          </button>

          <label className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-smooth font-medium text-left flex items-center justify-between cursor-pointer">
            <span>Import Data from CSV</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8m4 4H8"
              />
            </svg>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
              aria-label="Import CSV file"
            />
          </label>

          <button
            onClick={() => setShowCopyDialog(true)}
            className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-smooth font-medium text-left flex items-center justify-between"
          >
            <span>Copy Habits to Month</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            onClick={() => setShowBackupManager(true)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth font-medium text-left flex items-center justify-between"
          >
            <span>Manage Backups</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            onClick={handleClearData}
            className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-smooth font-medium text-left flex items-center justify-between"
          >
            <span>Clear All Data</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {exportMessage && (
            <div className="bg-primary/10 border border-primary text-primary px-4 py-2 rounded-lg text-sm text-center">
              {exportMessage}
            </div>
          )}

          {importError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm text-center">
              {importError}
            </div>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Productive 365 helps you build and maintain consistent habits throughout the year.
            </p>
            <p className="text-xs text-muted-foreground">
              Data is stored locally on your device. No data is sent to any server.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {showCopyDialog && (
        <CopyHabitsDialog
          currentMonth={new Date().getMonth()}
          currentYear={new Date().getFullYear()}
          allMonths={getAvailableMonths()}
          onCopy={handleCopyHabits}
          onClose={() => setShowCopyDialog(false)}
        />
      )}

      {showBackupManager && <BackupManager onClose={() => setShowBackupManager(false)} />}
    </div>
  )
}
