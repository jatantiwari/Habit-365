"use client"

import { useState, useEffect } from "react"
import EditHabitDialog from "./edit-habit-dialog"

interface DailyHabit {
  id: string
  name: string
  time?: string
  completed: boolean
}

interface DailyViewProps {
  onClose: () => void
}

export default function DailyView({ onClose }: DailyViewProps) {
  const [habits, setHabits] = useState<DailyHabit[]>([])
  const [today, setToday] = useState(new Date())
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null) // Added editing state

  useEffect(() => {
    loadTodayHabits()
  }, [today])

  const isHabitTodayValid = (habit: any, day: number): boolean => {
    if (!habit.type || habit.type === "daily") {
      return true // Daily habits always apply
    }

    if (habit.type === "specific-days" && habit.weekDays) {
      // Check if today's day of week matches
      const dayOfWeek = today.getDay()
      return habit.weekDays.includes(dayOfWeek)
    }

    if (habit.type === "one-time" && habit.specificDate) {
      // Check if today matches the specific date
      const habitDate = new Date(habit.specificDate)
      return (
        habitDate.getDate() === today.getDate() &&
        habitDate.getMonth() === today.getMonth() &&
        habitDate.getFullYear() === today.getFullYear()
      )
    }

    return false
  }

  const loadTodayHabits = () => {
    const monthKey = `${today.getFullYear()}-${today.getMonth()}`
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const monthData = data[monthKey]
        if (monthData && monthData.habits) {
          const day = today.getDate() - 1
          const filteredHabits = monthData.habits.filter((habit: any) => isHabitTodayValid(habit, day))

          const dailyHabits = filteredHabits.map((habit: any) => ({
            id: habit.id,
            name: habit.name,
            time: habit.time,
            type: habit.type || "daily",
            completed: monthData.completions[habit.id]?.[day] ?? false,
          }))
          setHabits(dailyHabits)

          const completed = dailyHabits.filter((h) => h.completed).length
          setCompletionPercentage(dailyHabits.length > 0 ? Math.round((completed / dailyHabits.length) * 100) : 0)
        }
      } catch (e) {
        console.error("Failed to load today's habits:", e)
      }
    }
  }

  const toggleHabit = (habitId: string) => {
    const monthKey = `${today.getFullYear()}-${today.getMonth()}`
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const monthData = data[monthKey]
        if (monthData) {
          const day = today.getDate() - 1
          if (!monthData.completions[habitId]) {
            monthData.completions[habitId] = Array(31).fill(false)
          }
          monthData.completions[habitId][day] = !monthData.completions[habitId][day]

          localStorage.setItem("monthlyData", JSON.stringify(data))
          loadTodayHabits()
        }
      } catch (e) {
        console.error("Failed to update habit:", e)
      }
    }
  }

  const handleEditHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    if (habit) {
      setEditingHabitId(habitId)
    }
  }

  const handleSaveHabit = (updates: { name: string; time?: string }) => {
    const monthKey = `${today.getFullYear()}-${today.getMonth()}`
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const monthData = data[monthKey]
        if (monthData) {
          const habitIndex = monthData.habits.findIndex((h: any) => h.id === editingHabitId)
          if (habitIndex !== -1) {
            monthData.habits[habitIndex] = {
              ...monthData.habits[habitIndex],
              name: updates.name,
              time: updates.time,
            }
            localStorage.setItem("monthlyData", JSON.stringify(data))
            loadTodayHabits()
            setEditingHabitId(null)
          }
        }
      } catch (e) {
        console.error("Failed to update habit:", e)
      }
    }
  }

  const handleDeleteHabit = () => {
    const monthKey = `${today.getFullYear()}-${today.getMonth()}`
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const monthData = data[monthKey]
        if (monthData) {
          monthData.habits = monthData.habits.filter((h: any) => h.id !== editingHabitId)
          delete monthData.completions[editingHabitId]
          localStorage.setItem("monthlyData", JSON.stringify(data))
          loadTodayHabits()
          setEditingHabitId(null)
        }
      } catch (e) {
        console.error("Failed to delete habit:", e)
      }
    }
  }

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const editingHabit = habits.find((h) => h.id === editingHabitId)

  return (
    <>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onClose}
              className="mb-4 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-3xl font-bold text-foreground mb-2">Today</h1>
            <p className="text-sm text-muted-foreground">{dateStr}</p>
          </div>

          {/* Progress Circle */}
          <div className="bg-card rounded-xl p-6 border border-border mb-6 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{completionPercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1">Complete</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {habits.filter((h) => h.completed).length} of {habits.length} habits completed
            </p>
          </div>

          {/* Daily Habits */}
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">No habits for today</p>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`rounded-lg border-2 transition-smooth ${
                    habit.completed ? "bg-accent/10 border-accent" : "bg-card border-border"
                  }`}
                >
                  <div className="p-4 flex items-center justify-between group hover:bg-black/5 rounded-lg transition-smooth cursor-pointer">
                    <button onClick={() => toggleHabit(habit.id)} className="flex-1 text-left flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          habit.completed ? "bg-accent" : "bg-muted"
                        }`}
                      >
                        {habit.completed && (
                          <svg className="w-4 h-4 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${habit.completed ? "text-accent" : "text-foreground"}`}>
                            {habit.name}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                            {habit.type === "specific-days"
                              ? "Weekly"
                              : habit.type === "one-time"
                                ? "Once"
                                : "Daily"}
                          </span>
                        </div>
                        {habit.time && <p className="text-xs text-muted-foreground mt-1">{habit.time}</p>}
                      </div>
                    </button>
                    <button
                      onClick={() => handleEditHabit(habit.id)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-smooth opacity-0 group-hover:opacity-100"
                      title="Edit habit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editingHabit && (
        <EditHabitDialog
          habitId={editingHabit.id}
          habitName={editingHabit.name}
          habitTime={editingHabit.time}
          monthKey={`${today.getFullYear()}-${today.getMonth()}`}
          onClose={() => setEditingHabitId(null)}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
        />
      )}
    </>
  )
}
