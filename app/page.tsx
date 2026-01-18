"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import MonthlyView from "@/components/monthly-view"
import DailyView from "@/components/daily-view"
import AddHabitDialog from "@/components/add-habit-dialog"
import AddWeeklyHabitDialog from "@/components/add-weekly-habit-dialog"
import AddOneTimeHabitDialog from "@/components/add-one-time-habit-dialog"
import BottomNav from "@/components/bottom-nav"
import SettingsDialog from "@/components/settings-dialog"
import { ThemeProvider } from "@/components/theme-provider"
import { requestNotificationPermission, checkAndTriggerNotifications } from "@/lib/notification-service"
import { initializeDailyBackup } from "@/lib/backup-service"

type ViewType = "dashboard" | "monthly" | "daily" | "add-daily" | "add-weekly" | "add-one-time" | "settings"

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    requestNotificationPermission()
    initializeDailyBackup()
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark
    setIsDarkMode(shouldBeDark)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const checkNotifications = () => {
      const monthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`
      const saved = localStorage.getItem("monthlyData")
      if (saved) {
        try {
          const data = JSON.parse(saved)
          const monthData = data[monthKey]
          if (monthData && monthData.habits) {
            checkAndTriggerNotifications(monthData.habits)
          }
        } catch (e) {
          console.error("Failed to check notifications:", e)
        }
      }
    }

    // Check immediately on load
    checkNotifications()

    // Check every minute
    const interval = setInterval(checkNotifications, 60000)

    return () => clearInterval(interval)
  }, [isHydrated])

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  // Prevent hydration mismatch
  if (!isHydrated) {
    return null
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  return (
    <ThemeProvider isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
      <div className="pb-20 sm:pb-24 min-h-screen">
        {currentView === "dashboard" && <Dashboard onDailyClick={() => setCurrentView("daily")} />}
        {currentView === "monthly" && <MonthlyView />}
        {currentView === "daily" && <DailyView onClose={() => setCurrentView("dashboard")} />}
        {currentView === "add-daily" && <AddHabitDialog onClose={() => setCurrentView("dashboard")} />}
        {currentView === "add-weekly" && <AddWeeklyHabitDialog onClose={() => setCurrentView("dashboard")} />}
        {currentView === "add-one-time" && <AddOneTimeHabitDialog onClose={() => setCurrentView("dashboard")} />}
        {currentView === "settings" && <SettingsDialog onClose={() => setCurrentView("dashboard")} />}
      </div>
      <BottomNav currentView={currentView} onViewChange={handleViewChange} />
    </ThemeProvider>
  )
}
