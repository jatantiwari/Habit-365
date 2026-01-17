"use client"

import { useState, useEffect } from "react"
import HabitGrid from "./habit-grid"
import EditHabitDialog from "./edit-habit-dialog"

interface Habit {
  id: string
  name: string
  time?: string
}

interface MonthlyData {
  month: number
  habits: Habit[]
  completions: Record<string, boolean[]>
}

export default function MonthlyView() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    month: currentMonth,
    habits: [],
    completions: {},
  })
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]

  useEffect(() => {
    loadMonthData()
  }, [currentMonth, currentYear])

  const getDaysInMonth = () =>
    new Date(currentYear, currentMonth + 1, 0).getDate()

  const daysInMonth = getDaysInMonth()

  const loadMonthData = () => {
    const monthKey = `${currentYear}-${currentMonth}`
    const saved = localStorage.getItem("monthlyData")

    if (!saved) {
      setMonthlyData({ month: currentMonth, habits: [], completions: {} })
      return
    }

    try {
      const allData = JSON.parse(saved)
      setMonthlyData(
        allData[monthKey] || { month: currentMonth, habits: [], completions: {} }
      )
    } catch (error) {
      console.error("Failed to load monthly data:", error)
    }
  }

  const saveMonthData = (data: MonthlyData) => {
    const monthKey = `${currentYear}-${currentMonth}`
    const saved = localStorage.getItem("monthlyData")
    const allData = saved ? JSON.parse(saved) : {}

    allData[monthKey] = data
    localStorage.setItem("monthlyData", JSON.stringify(allData))
  }

  const handleToggle = (habitId: string, day: number) => {
    const updated = { ...monthlyData }

    if (!updated.completions[habitId]) {
      updated.completions[habitId] = Array(daysInMonth).fill(false)
    }

    updated.completions[habitId][day] =
      !updated.completions[habitId][day]

    setMonthlyData(updated)
    saveMonthData(updated)
  }

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId)
  }

  const handleSaveHabit = (updates: { name: string; time?: string }) => {
    const updated = { ...monthlyData }

    const habitIndex = updated.habits.findIndex(
      (h) => h.id === editingHabitId
    )

    if (habitIndex !== -1) {
      updated.habits[habitIndex] = {
        ...updated.habits[habitIndex],
        name: updates.name,
        time: updates.time,
      }
    }

    setMonthlyData(updated)
    saveMonthData(updated)
    setEditingHabitId(null)
  }

  const handleDeleteHabit = () => {
    const updated = { ...monthlyData }

    updated.habits = updated.habits.filter(
      (h) => h.id !== editingHabitId
    )

    delete updated.completions[editingHabitId!]

    setMonthlyData(updated)
    saveMonthData(updated)
    setEditingHabitId(null)
  }

  const monthCompletion =
    monthlyData.habits.length === 0
      ? 0
      : Math.round(
          (Object.values(monthlyData.completions)
            .flat()
            .filter(Boolean).length /
            (monthlyData.habits.length * daysInMonth)) *
            100
        )

  const editingHabit = monthlyData.habits.find(
    (h) => h.id === editingHabitId
  )

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button onClick={goPrevMonth} className="p-2 hover:bg-muted rounded-lg">
                ←
              </button>

              <h1 className="text-2xl md:text-3xl font-bold text-center">
                {monthNames[currentMonth]} {currentYear}
              </h1>

              <button onClick={goNextMonth} className="p-2 hover:bg-muted rounded-lg">
                →
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  style={{ width: `${monthCompletion}%` }}
                  className="h-full bg-primary transition-all duration-500"
                />
              </div>
              <span className="text-lg font-bold text-primary">
                {monthCompletion}%
              </span>
            </div>
          </div>

          {/* Habit Tracker Grid */}
          {monthlyData.habits.length > 0 ? (
            <HabitGrid
              habits={monthlyData.habits}
              completions={monthlyData.completions}
              onToggle={handleToggle}
              onEditHabit={handleEditHabit}
              daysInMonth={daysInMonth}
            />
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground mb-2">No habits yet</p>
              <p className="text-sm text-muted-foreground">
                Add habits from the Dashboard to get started
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Popup */}
      {editingHabit && (
        <EditHabitDialog
          habitId={editingHabit.id}
          habitName={editingHabit.name}
          habitTime={editingHabit.time}
          monthKey={`${currentYear}-${currentMonth}`}
          onClose={() => setEditingHabitId(null)}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
        />
      )}
    </>
  )
}
