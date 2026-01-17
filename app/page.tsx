"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import MonthlyView from "@/components/monthly-view"
import DailyView from "@/components/daily-view"
import AddHabitDialog from "@/components/add-habit-dialog"
import BottomNav from "@/components/bottom-nav"
import SettingsDialog from "@/components/settings-dialog"
import { ThemeProvider } from "@/components/theme-provider"
import { requestNotificationPermission, checkAndTriggerNotifications } from "@/lib/notification-service"

type ViewType = "dashboard" | "monthly" | "daily" | "add" | "settings"

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    requestNotificationPermission()
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
    if (view === "settings") {
      setCurrentView("settings")
    } else if (view === "add") {
      setCurrentView("add")
    } else if (view === "monthly") {
      setCurrentView("monthly")
    } else if (view === "daily") {
      setCurrentView("daily")
    } else {
      setCurrentView("dashboard")
    }
  }

  return (
    <ThemeProvider isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
      <div className="pb-20 sm:pb-24 min-h-screen">
        {currentView === "dashboard" && <Dashboard onDailyClick={() => setCurrentView("daily")} />}
        {currentView === "monthly" && <MonthlyView />}
        {currentView === "daily" && <DailyView onClose={() => setCurrentView("dashboard")} />}
        {currentView === "add" && <AddHabitDialog onClose={() => setCurrentView("dashboard")} />}
        {currentView === "settings" && <SettingsDialog onClose={() => setCurrentView("dashboard")} />}
      </div>
      <BottomNav currentView={currentView} onViewChange={handleViewChange} />
    </ThemeProvider>
  )
}
