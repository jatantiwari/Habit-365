"use client"

import { createContext, useContext, type ReactNode } from "react"

interface ThemeContextType {
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  isDarkMode,
  setIsDarkMode,
  children,
}: {
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  children: ReactNode
}) {
  return <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
