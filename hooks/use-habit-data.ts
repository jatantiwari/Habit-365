"use client"

import { useState, useCallback, useEffect } from "react"

export interface HabitEntry {
  id: string
  name: string
  type: "daily" | "weekly"
  createdAt: string
}

export interface MonthData {
  month: number
  year: number
  habits: HabitEntry[]
  completions: Record<string, boolean[]>
}

export function useHabitData() {
  const [data, setData] = useState<Record<string, MonthData>>({})

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load habit data:", e)
      }
    }
  }, [])

  const saveData = useCallback((newData: Record<string, MonthData>) => {
    setData(newData)
    localStorage.setItem("monthlyData", JSON.stringify(newData))
  }, [])

  const addHabit = useCallback(
    (habit: HabitEntry, monthKey: string) => {
      const updated = { ...data }
      if (!updated[monthKey]) {
        const [year, month] = monthKey.split("-").map(Number)
        updated[monthKey] = {
          month,
          year,
          habits: [],
          completions: {},
        }
      }
      updated[monthKey].habits.push(habit)
      updated[monthKey].completions[habit.id] = Array(31).fill(false)
      saveData(updated)
    },
    [data, saveData],
  )

  const toggleCompletion = useCallback(
    (habitId: string, day: number, monthKey: string) => {
      const updated = { ...data }
      if (updated[monthKey] && updated[monthKey].completions[habitId]) {
        updated[monthKey].completions[habitId][day] = !updated[monthKey].completions[habitId][day]
        saveData(updated)
      }
    },
    [data, saveData],
  )

  const deleteHabit = useCallback(
    (habitId: string, monthKey: string) => {
      const updated = { ...data }
      if (updated[monthKey]) {
        updated[monthKey].habits = updated[monthKey].habits.filter((h) => h.id !== habitId)
        delete updated[monthKey].completions[habitId]
        saveData(updated)
      }
    },
    [data, saveData],
  )

  return {
    data,
    saveData,
    addHabit,
    toggleCompletion,
    deleteHabit,
  }
}
