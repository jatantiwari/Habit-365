"use client"

import type React from "react"
import { useState } from "react"

interface EditHabitDialogProps {
  habitId: string
  habitName: string
  habitTime?: string
  monthKey: string
  onClose: () => void
  onSave: (updates: { name: string; time?: string }) => void
  onDelete: () => void
}

export default function EditHabitDialog({
  habitId,
  habitName,
  habitTime,
  monthKey,
  onClose,
  onSave,
  onDelete,
}: EditHabitDialogProps) {
  const [name, setName] = useState(habitName)
  const [time, setTime] = useState(habitTime || "")
  const [showTime, setShowTime] = useState(!!habitTime)
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Habit name cannot be empty")
      return
    }

    if (name.trim().length < 3) {
      setError("Habit name must be at least 3 characters")
      return
    }

    if (name.trim().length > 50) {
      setError("Habit name must be less than 50 characters")
      return
    }

    if (showTime && time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      setError("Time must be in HH:MM format (24-hour)")
      return
    }

    onSave({
      name: name.trim(),
      time: showTime ? time : undefined,
    })
  }

  const handleDelete = () => {
    onDelete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Edit Habit</h2>

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Exercise"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
              />
              {name && <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTime}
                  onChange={() => setShowTime(!showTime)}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground">Add time reminder (optional)</span>
              </label>

              {showTime && (
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium"
              >
                Save Changes
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-smooth text-sm font-medium"
            >
              Delete Habit
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-foreground">Are you sure you want to delete "{name}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-smooth font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
