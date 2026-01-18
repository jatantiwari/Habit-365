"use client"

import type React from "react"
import { useState } from "react"

interface AddOneTimeHabitDialogProps {
  onClose: () => void
}

export default function AddOneTimeHabitDialog({ onClose }: AddOneTimeHabitDialogProps) {
  const [habitName, setHabitName] = useState("")
  const [specificDate, setSpecificDate] = useState("")
  const [habitTime, setHabitTime] = useState("")
  const [showTime, setShowTime] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!habitName.trim()) {
      setError("Please enter a habit name")
      return
    }

    if (habitName.trim().length < 3) {
      setError("Habit name must be at least 3 characters")
      return
    }

    if (!specificDate) {
      setError("Please select a date")
      return
    }

    if (showTime && habitTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(habitTime)) {
      setError("Time must be in HH:MM format (24-hour)")
      return
    }

    const dateObj = new Date(specificDate)
    const month = dateObj.getMonth()
    const year = dateObj.getFullYear()
    const day = dateObj.getDate()
    const monthKey = `${year}-${month}`

    const saved = localStorage.getItem("monthlyData")
    const allData = saved ? JSON.parse(saved) : {}
    const monthData = allData[monthKey] || {
      month: month,
      year: year,
      habits: [],
      completions: {},
    }

    const oneTimeHabits = monthData.habits.filter((h: any) => h.type === "one-time").length
    if (oneTimeHabits >= 20) {
      setError("Maximum 20 one-time habits per month")
      return
    }

    const newHabit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: habitName.trim(),
      type: "one-time",
      time: showTime ? habitTime : undefined,
      specificDate: specificDate,
      createdAt: new Date().toISOString(),
    }

    monthData.habits.push(newHabit)
    monthData.completions[newHabit.id] = Array(31).fill(false)
    monthData.completions[newHabit.id][day - 1] = false // Initialize the specific day

    allData[monthKey] = monthData
    localStorage.setItem("monthlyData", JSON.stringify(allData))

    setHabitName("")
    setSpecificDate("")
    setHabitTime("")
    setShowTime(false)
    setError("")
    onClose()
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Add One-Time Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Habit Name</label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Doctor Appointment"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              min={today}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="timeCheckbox"
              checked={showTime}
              onChange={(e) => setShowTime(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="timeCheckbox" className="text-sm font-medium text-foreground cursor-pointer">
              Add time reminder (optional)
            </label>
          </div>

          {showTime && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Time (24-hour)</label>
              <input
                type="time"
                value={habitTime}
                onChange={(e) => setHabitTime(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
