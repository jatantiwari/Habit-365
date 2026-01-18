"use client"

import { useState, useEffect } from "react"
import { getBackups, restoreBackup, deleteBackup, exportBackupAsCSV, createBackup } from "@/lib/backup-service"

interface BackupManagerProps {
  onClose: () => void
}

interface Backup {
  date: string
  timestamp: number
}

export default function BackupManager({ onClose }: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = () => {
    const allBackups = getBackups()
    setBackups(allBackups.sort((a, b) => b.timestamp - a.timestamp))
  }

  const handleRestore = (date: string) => {
    if (confirm("Restore this backup? Current data will be replaced.")) {
      if (restoreBackup(date)) {
        setMessage("Backup restored successfully! Page will reload...")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage("Failed to restore backup")
      }
    }
  }

  const handleDelete = (date: string) => {
    if (confirm("Delete this backup? This action cannot be undone.")) {
      if (deleteBackup(date)) {
        setMessage("Backup deleted")
        setTimeout(() => loadBackups(), 1000)
      } else {
        setMessage("Failed to delete backup")
      }
    }
  }

  const handleExport = (date: string) => {
    setIsLoading(true)
    if (exportBackupAsCSV(date)) {
      setMessage("Backup exported successfully!")
    } else {
      setMessage("Failed to export backup")
    }
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleCreateBackup = () => {
    createBackup()
    setMessage("Manual backup created successfully!")
    setTimeout(() => loadBackups(), 500)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">Backup Management</h2>

        {message && (
          <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={handleCreateBackup}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Create Manual Backup Now
          </button>
          <p className="text-xs text-muted-foreground mt-2">Automatic backups are created daily at app startup</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground mb-3">Available Backups ({backups.length})</h3>

          {backups.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No backups available yet. Create one to get started.
            </div>
          ) : (
            backups.map((backup) => (
              <div
                key={backup.date}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">{formatDate(backup.timestamp)}</div>
                  <div className="text-xs text-muted-foreground">{backup.date}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport(backup.date)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleRestore(backup.date)}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(backup.date)}
                    className="px-3 py-1 text-sm bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
