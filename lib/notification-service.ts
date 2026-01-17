// Notification and alarm service for habit reminders

export interface NotificationState {
  lastNotificationTime: Record<string, string> // habitId -> HH:MM to prevent duplicate notifications
}

const NOTIFICATION_STATE_KEY = "habit_notification_state"

export function getNotificationState(): NotificationState {
  try {
    const saved = localStorage.getItem(NOTIFICATION_STATE_KEY)
    return saved ? JSON.parse(saved) : { lastNotificationTime: {} }
  } catch {
    return { lastNotificationTime: {} }
  }
}

export function saveNotificationState(state: NotificationState) {
  try {
    localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save notification state:", e)
  }
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

export function playAlarmSound() {
  // Create a simple alarm sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Set frequency for alarm (800 Hz)
    oscillator.frequency.value = 800
    oscillator.type = "sine"

    // Create alarm pattern (beep-beep-beep)
    const startTime = audioContext.currentTime
    gainNode.gain.setValueAtTime(0.3, startTime)

    // Beep 1
    oscillator.start(startTime)
    gainNode.gain.setValueAtTime(0, startTime + 0.2)

    // Beep 2
    gainNode.gain.setValueAtTime(0.3, startTime + 0.3)
    gainNode.gain.setValueAtTime(0, startTime + 0.5)

    // Beep 3
    gainNode.gain.setValueAtTime(0.3, startTime + 0.6)
    gainNode.gain.setValueAtTime(0, startTime + 0.8)

    oscillator.stop(startTime + 0.8)
  } catch (e) {
    console.error("Failed to play alarm:", e)
  }
}

export function showNotification(habitName: string, time: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Habit Reminder", {
      body: `Time to: ${habitName} at ${time}`,
      icon: "/habit-reminder-icon.jpg",
      tag: `habit-${habitName}`,
      requireInteraction: true,
    })
  }
}

export function checkAndTriggerNotifications(habits: Array<{ id: string; name: string; time?: string }>) {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  const state = getNotificationState()

  habits.forEach((habit) => {
    if (!habit.time) return

    // Check if it's time for this habit
    if (habit.time === currentTime) {
      // Check if we already notified for this habit at this time
      if (state.lastNotificationTime[habit.id] !== currentTime) {
        // Trigger notification and alarm
        showNotification(habit.name, habit.time)
        playAlarmSound()

        // Update state to prevent duplicate notifications
        state.lastNotificationTime[habit.id] = currentTime
        saveNotificationState(state)
      }
    }
  })
}
