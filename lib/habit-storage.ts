// Utility functions for habit data management

export interface Habit {
  id: string
  name: string
  type: "daily" | "weekly" | "specific-days" | "one-time"
  createdAt: string
  category?: string
  time?: string // Optional time in HH:MM format
  weekDays?: number[] // 0-6 for specific days (Mon-Sun)
  specificDate?: string // ISO date string for one-time habits
}

export interface MonthData {
  month: number
  year: number
  habits: Habit[]
  completions: Record<string, boolean[]>
}

const STORAGE_KEY = "habit_tracker_data"

export function saveHabitData(data: Record<string, MonthData>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save habit data:", e)
  }
}

export function loadHabitData(): Record<string, MonthData> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch (e) {
    console.error("Failed to load habit data:", e)
    return {}
  }
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function calculateCompletion(completions: boolean[]): number {
  if (completions.length === 0) return 0
  const completed = completions.filter(Boolean).length
  return Math.round((completed / completions.length) * 100)
}

export function getWeekData(habits: Habit[], completions: Record<string, boolean[]>, weeksInMonth = 4) {
  const weekData = Array(weeksInMonth)
    .fill(null)
    .map(() => ({ completed: 0, total: 0 }))

  habits.forEach((habit) => {
    const habitCompletions = completions[habit.id] || Array(31).fill(false)
    habitCompletions.forEach((completed, day) => {
      const week = Math.floor(day / 7)
      if (week < weeksInMonth) {
        weekData[week].total++
        if (completed) weekData[week].completed++
      }
    })
  })

  return weekData.map((week) => (week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0))
}

export function copyHabitsToMonth(
  sourceKey: string,
  targetKey: string,
  data: Record<string, MonthData>,
): Record<string, MonthData> {
  const sourceData = data[sourceKey]
  if (!sourceData) return data

  const [targetYear, targetMonth] = targetKey.split("-").map(Number)

  const copiedHabits: Habit[] = sourceData.habits.map((habit) => ({
    ...habit,
    id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    time: habit.time, // Preserve the time field
  }))

  const daysInTargetMonth = getDaysInMonth(targetYear, targetMonth)
  const copiedCompletions: Record<string, boolean[]> = {}

  copiedHabits.forEach((habit) => {
    copiedCompletions[habit.id] = Array(daysInTargetMonth).fill(false)
  })

  const updated = { ...data }
  updated[targetKey] = {
    month: targetMonth,
    year: targetYear,
    habits: copiedHabits,
    completions: copiedCompletions,
  }

  return updated
}

export function updateHabit(
  habitId: string,
  monthKey: string,
  updates: Partial<Habit>,
  data: Record<string, MonthData>,
): Record<string, MonthData> {
  const updated = { ...data }
  if (updated[monthKey]) {
    const habitIndex = updated[monthKey].habits.findIndex((h) => h.id === habitId)
    if (habitIndex !== -1) {
      updated[monthKey].habits[habitIndex] = {
        ...updated[monthKey].habits[habitIndex],
        ...updates,
      }
    }
  }
  return updated
}
