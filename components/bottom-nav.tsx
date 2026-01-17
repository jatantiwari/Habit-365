"use client"

import { useTheme } from "./theme-provider"

interface BottomNavProps {
  currentView: string
  onViewChange: (view: "dashboard" | "monthly" | "add" | "settings") => void
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const { isDarkMode, setIsDarkMode } = useTheme()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around h-16 sm:h-20 px-2 sm:px-4 gap-1 sm:gap-2">
        <button
          onClick={() => onViewChange("dashboard")}
          className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-16 sm:min-h-20 py-2 sm:py-3 transition-smooth rounded-lg ${
            currentView === "dashboard"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:block">Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange("monthly")}
          className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-16 sm:min-h-20 py-2 sm:py-3 transition-smooth rounded-lg ${
            currentView === "monthly"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:block">Monthly</span>
        </button>

        <button
          onClick={() => onViewChange("add")}
          className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-16 sm:min-h-20 py-2 sm:py-3 text-primary transition-smooth hover:scale-110"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-medium hidden sm:block">Add</span>
        </button>

        <button
          onClick={() => onViewChange("settings")}
          className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-16 sm:min-h-20 py-2 sm:py-3 transition-smooth rounded-lg ${
            currentView === "settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:block">Settings</span>
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-16 sm:min-h-20 py-2 sm:py-3 text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-muted/50"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 7.464a1 1 0 000 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0zm12.728 0l-.707.707a1 1 0 011.414 1.414l.707-.707a1 1 0 00-1.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-xs sm:text-sm font-medium hidden sm:block">Theme</span>
        </button>
      </div>
    </nav>
  )
}
