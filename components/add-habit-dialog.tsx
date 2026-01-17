"use client"

import type React from "react"

import { useState } from "react"

interface AddHabitDialogProps {
  onClose: () => void
}

export default function AddHabitDialog({ onClose }: AddHabitDialogProps) {
  const [habitName, setHabitName] = useState("")
  const [habitType, setHabitType] = useState<"daily" | "weekly">("daily")
  const [habitTime, setHabitTime] = useState("") // Added time state
  const [showTime, setShowTime] = useState(false) // Added toggle for time
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

    if (habitName.trim().length > 50) {
      setError("Habit name must be less than 50 characters")
      return
    }

    if (showTime && habitTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(habitTime)) {
      setError("Time must be in HH:MM format (24-hour)")
      return
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthKey = `${currentYear}-${currentMonth}`

    const saved = localStorage.getItem("monthlyData")
    const allData = saved ? JSON.parse(saved) : {}
    const monthData = allData[monthKey] || {
      month: currentMonth,
      habits: [],
      completions: {},
    }

    const dailyHabits = monthData.habits.filter((h: any) => h.type === "daily").length
    if (habitType === "daily" && dailyHabits >= 25) {
      setError("Maximum 25 daily habits per month")
      return
    }

    const weeklyHabits = monthData.habits.filter((h: any) => h.type === "weekly").length
    if (habitType === "weekly" && weeklyHabits >= 10) {
      setError("Maximum 10 weekly habits")
      return
    }

    const newHabit = {
      id: Date.now().toString(),
      name: habitName.trim(),
      type: habitType,
      time: showTime ? habitTime : undefined,
    }

    monthData.habits.push(newHabit)
    monthData.completions[newHabit.id] = Array(31).fill(false)

    allData[monthKey] = monthData
    localStorage.setItem("monthlyData", JSON.stringify(allData))

    setHabitName("")
    setHabitTime("")
    setShowTime(false)
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Add New Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Habit Name</label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
            {habitName && <p className="text-xs text-muted-foreground mt-1">{habitName.length}/50</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Habit Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={habitType === "daily"}
                  onChange={() => setHabitType("daily")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Daily</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={habitType === "weekly"}
                  onChange={() => setHabitType("weekly")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Weekly</span>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showTime}
                onChange={() => setShowTime(!showTime)}
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <span className="text-sm font-medium text-foreground">Add time reminder (optional)</span>
            </label>

            {showTime && (
              <input
                type="time"
                value={habitTime}
                onChange={(e) => setHabitTime(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
