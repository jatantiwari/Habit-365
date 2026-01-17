export function importCSVData(csvContent: string): Record<string, any> {
  const lines = csvContent.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("Invalid CSV format")
  }

  // Skip header line
  const dataLines = lines.slice(1)
  const monthDataMap: Record<string, any> = {}

  // Month name to number mapping
  const monthMap: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  }

  // Group data by month, then by habit
  const dataByMonth: Record<string, Record<string, Record<number, boolean>>> = {}

  dataLines.forEach((line) => {
    const parts = line.split(",").map((s) => s.trim())

    if (parts.length < 5) return

    const [yearStr, monthStr, dayStr, habitName, completedStr] = parts

    const year = Number.parseInt(yearStr)
    const monthLower = monthStr.toLowerCase()
    const monthNum = monthMap[monthLower]
    const day = Number.parseInt(dayStr) - 1 // Convert to 0-indexed
    const isCompleted = completedStr.toLowerCase() === "yes"

    if (isNaN(year) || monthNum === undefined || isNaN(day) || !habitName) {
      return
    }

    const monthKey = `${year}-${monthNum}`

    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = {}
    }

    if (!dataByMonth[monthKey][habitName]) {
      dataByMonth[monthKey][habitName] = {}
    }

    dataByMonth[monthKey][habitName][day] = isCompleted
  })

  // Create MonthData objects with exact completion data
  Object.entries(dataByMonth).forEach(([monthKey, habits]) => {
    const [year, month] = monthKey.split("-").map(Number)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const habitArray: any[] = []
    const completions: Record<string, boolean[]> = {}

    Object.entries(habits).forEach(([habitName, dayCompletions]) => {
      const habitId = `habit-${Date.now()}-${Math.random()}`
      habitArray.push({
        id: habitId,
        name: habitName,
        type: "daily",
        createdAt: new Date().toISOString(),
      })

      const completionArray = Array(daysInMonth).fill(false)
      Object.entries(dayCompletions).forEach(([dayIndex, completed]) => {
        const idx = Number.parseInt(dayIndex)
        if (idx >= 0 && idx < daysInMonth) {
          completionArray[idx] = completed
        }
      })

      completions[habitId] = completionArray
    })

    monthDataMap[monthKey] = {
      month,
      year,
      habits: habitArray,
      completions,
    }
  })

  return monthDataMap
}

export function parseCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }
    reader.readAsText(file)
  })
}
