// Daily backup service for automatically backing up habit data

const BACKUP_STORAGE_KEY = "habit_tracker_backups"
const LAST_BACKUP_KEY = "last_backup_date"
const MAX_BACKUPS = 30 // Keep last 30 days of backups

export interface Backup {
  date: string
  timestamp: number
  data: any
}

export function initializeDailyBackup() {
  const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY)
  const today = new Date().toISOString().split("T")[0]

  // Check if we need to create a backup today
  if (lastBackupDate !== today) {
    createBackup()
    localStorage.setItem(LAST_BACKUP_KEY, today)
  }
}

export function createBackup() {
  try {
    const monthlyData = localStorage.getItem("monthlyData")
    if (!monthlyData) return

    const backups: Backup[] = getBackups()
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    const timestamp = today.getTime()

    // Remove old backup for today if it exists
    const filteredBackups = backups.filter((b) => b.date !== dateStr)

    // Add new backup
    filteredBackups.push({
      date: dateStr,
      timestamp: timestamp,
      data: JSON.parse(monthlyData),
    })

    // Keep only last MAX_BACKUPS
    const recentBackups = filteredBackups.slice(-MAX_BACKUPS)

    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(recentBackups))
  } catch (error) {
    console.error("Failed to create backup:", error)
  }
}

export function getBackups(): Backup[] {
  try {
    const backups = localStorage.getItem(BACKUP_STORAGE_KEY)
    return backups ? JSON.parse(backups) : []
  } catch (error) {
    console.error("Failed to get backups:", error)
    return []
  }
}

export function restoreBackup(dateStr: string): boolean {
  try {
    const backups = getBackups()
    const backup = backups.find((b) => b.date === dateStr)

    if (!backup) {
      console.error("Backup not found for date:", dateStr)
      return false
    }

    localStorage.setItem("monthlyData", JSON.stringify(backup.data))
    return true
  } catch (error) {
    console.error("Failed to restore backup:", error)
    return false
  }
}

export function deleteBackup(dateStr: string): boolean {
  try {
    const backups = getBackups()
    const filteredBackups = backups.filter((b) => b.date !== dateStr)
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filteredBackups))
    return true
  } catch (error) {
    console.error("Failed to delete backup:", error)
    return false
  }
}

export function exportBackupAsCSV(dateStr: string): boolean {
  try {
    const backups = getBackups()
    const backup = backups.find((b) => b.date === dateStr)

    if (!backup) {
      console.error("Backup not found for date:", dateStr)
      return false
    }

    const data = backup.data
    let csv = "Year,Month,Day,Habit,Type,Completed,Time\n"

    Object.entries(data).forEach(([key, value]: any) => {
      const [year, month] = key.split("-")
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      if (value.habits && value.completions) {
        value.habits.forEach((habit: any) => {
          const completionArray = value.completions[habit.id] || []
          completionArray.forEach((completed: boolean, dayIndex: number) => {
            const day = dayIndex + 1
            const time = habit.time ? habit.time : ""
            csv += `${year},${monthNames[Number.parseInt(month)]},${day},${habit.name},${habit.type},${completed ? "yes" : "no"},${time}\n`
          })
        })
      }
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `habit-tracker-backup-${dateStr}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Failed to export backup:", error)
    return false
  }
}
