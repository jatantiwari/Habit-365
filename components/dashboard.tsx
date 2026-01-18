"use client"

import { useState, useEffect } from "react"
import ProgressRing from "./progress-ring"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface HabitData {
  id: string
  name: string
  time?: string // added optional time field
  dailyCompletions: Record<number, boolean[]>
  weeklyCompletions: Record<number, boolean[]>
}

interface DashboardProps {
  onDailyClick?: () => void
}

export default function Dashboard({ onDailyClick }: DashboardProps) {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [monthlyProgress, setMonthlyProgress] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState(0)
  const [topHabits, setTopHabits] = useState<any[]>([])
  const [yearlyTrend, setYearlyTrend] = useState<any[]>([])

  useEffect(() => {
    // Load habits from localStorage
    const saved = localStorage.getItem("monthlyData")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert to habits format
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthKey = `${currentYear}-${currentMonth}`
        const monthData = parsed[monthKey]

        if (monthData && monthData.habits) {
          const formattedHabits = monthData.habits.map((habit: any) => ({
            id: habit.id,
            name: habit.name,
            time: habit.time, // include time from habit data
            dailyCompletions: { [currentMonth]: monthData.completions[habit.id] || Array(31).fill(false) },
            weeklyCompletions: { [currentMonth]: Array(4).fill(false) },
          }))
          setHabits(formattedHabits)
          calculateStats(formattedHabits, monthData.completions)
        } else {
          initializeDemoData()
        }
      } catch (e) {
        console.error("Failed to load habits:", e)
        initializeDemoData()
      }
    } else {
      initializeDemoData()
    }
  }, [])

  const initializeDemoData = () => {
    const demoHabits: HabitData[] = [
      {
        id: "1",
        name: "Morning Exercise",
        dailyCompletions: { 0: Array(31).fill(false) },
        weeklyCompletions: { 0: Array(52).fill(false) },
      },
      {
        id: "2",
        name: "Read 30 mins",
        dailyCompletions: { 0: Array(31).fill(false) },
        weeklyCompletions: { 0: Array(52).fill(false) },
      },
      {
        id: "3",
        name: "Meditation",
        dailyCompletions: { 0: Array(31).fill(false) },
        weeklyCompletions: { 0: Array(52).fill(false) },
      },
      {
        id: "4",
        name: "Drink Water",
        dailyCompletions: { 0: Array(31).fill(false) },
        weeklyCompletions: { 0: Array(52).fill(false) },
      },
    ]
    setHabits(demoHabits)
  }

  const calculateStats = (habitsList: HabitData[], completions?: Record<string, boolean[]>) => {
    const currentMonth = new Date().getMonth()

    // Calculate monthly progress
    let totalDays = 0
    let completedDays = 0
    habitsList.forEach((habit) => {
      const monthData = habit.dailyCompletions[currentMonth] || Array(31).fill(false)
      totalDays += monthData.length
      completedDays += monthData.filter(Boolean).length
    })
    const monthlyPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    setMonthlyProgress(monthlyPct)

    // Calculate weekly progress (last 7 days)
    const today = new Date()
    let weekCompleted = 0
    let weekTotal = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayOfMonth = date.getDate() - 1
      habitsList.forEach((habit) => {
        const monthData = habit.dailyCompletions[date.getMonth()] || Array(31).fill(false)
        if (monthData[dayOfMonth] !== undefined) {
          weekTotal++
          if (monthData[dayOfMonth]) weekCompleted++
        }
      })
    }
    const weeklyPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0
    setWeeklyProgress(weeklyPct)

    // Top habits
    const habitStats = habitsList.map((habit) => {
      const monthData = habit.dailyCompletions[currentMonth] || Array(31).fill(false)
      const completed = monthData.filter(Boolean).length
      return {
        name: habit.name,
        completed,
        percentage: Math.round((completed / monthData.length) * 100),
      }
    })
    setTopHabits(habitStats.sort((a, b) => b.completed - a.completed).slice(0, 5))

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const trend = monthLabels.map((month, index) => {
      // Calculate actual completion percentage for each month
      let monthCompleted = 0
      let monthTotal = 0
      habitsList.forEach((habit) => {
        const monthData = habit.dailyCompletions[index] || Array(31).fill(false)
        monthTotal += monthData.length
        monthCompleted += monthData.filter(Boolean).length
      })
      const completion = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0
      return {
        month,
        completion,
      }
    })
    setYearlyTrend(trend)
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Productive 365</h1>
          <p className="text-muted-foreground text-balance">
            Track your daily and weekly habits with detailed analytics
          </p>
        </div>

        {/* Quick Action - Today's Habits */}
        {onDailyClick && (
          <button
            onClick={onDailyClick}
            className="w-full mb-8 p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border-2 border-primary/30 hover:border-primary/60 transition-smooth flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                View Today's Habits
              </p>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <svg
              className="w-6 h-6 text-primary group-hover:translate-x-1 transition-smooth"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center justify-center">
            <ProgressRing percentage={monthlyProgress} size={140} label="Monthly Progress" />
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center justify-center">
            <ProgressRing percentage={weeklyProgress} size={140} label="Weekly Progress" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Bar Chart */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Habit Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topHabits}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                />
                <Bar dataKey="percentage" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Trend */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yearly Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-accent)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Habits */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top Habits This Month</h2>
          <div className="space-y-3">
            {topHabits.map((habit, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{habit.name}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="bg-accent rounded-full h-2 transition-all duration-500"
                      style={{ width: `${habit.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-primary ml-2">{habit.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
