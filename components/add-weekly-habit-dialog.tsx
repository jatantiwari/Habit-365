"use client"

import type React from "react"
import { useState } from "react"

interface AddWeeklyHabitDialogProps {
  onClose: () => void
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AddWeeklyHabitDialog({ onClose }: AddWeeklyHabitDialogProps) {
  const [habitName, setHabitName] = useState("")
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [habitTime, setHabitTime] = useState("")
  const [showTime, setShowTime] = useState(false)
  const [error, setError] = useState("")

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    )
  }

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

    if (selectedDays.length === 0) {
      setError("Please select at least one day")
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

    const specificDayHabits = monthData.habits.filter((h: any) => h.type === "specific-days").length
    if (specificDayHabits >= 15) {
      setError("Maximum 15 weekly habits per month")
      return
    }

    const newHabit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: habitName.trim(),
      type: "specific-days",
      time: showTime ? habitTime : undefined,
      weekDays: selectedDays,
      createdAt: new Date().toISOString(),
    }

    monthData.habits.push(newHabit)
    monthData.completions[newHabit.id] = Array(31).fill(false)

    allData[monthKey] = monthData
    localStorage.setItem("monthlyData", JSON.stringify(allData))

    setHabitName("")
    setSelectedDays([])
    setHabitTime("")
    setShowTime(false)
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">Add Weekly Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Habit Name</label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Gym Session"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Select Days</label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDays.includes(index)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
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
