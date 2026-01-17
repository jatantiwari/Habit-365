"use client"

interface HabitStatsProps {
  name: string
  completedDays: number
  totalDays: number
  streak?: number
}

export default function HabitStats({ name, completedDays, totalDays, streak = 0 }: HabitStatsProps) {
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  return (
    <div className="bg-card rounded-lg p-4 border border-border space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <span className="text-lg font-bold text-primary">{percentage}%</span>
      </div>

      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-muted/30 rounded p-2">
          <p className="text-muted-foreground text-xs">Completed</p>
          <p className="font-bold text-foreground">
            {completedDays}/{totalDays}
          </p>
        </div>
        {streak > 0 && (
          <div className="bg-primary/10 rounded p-2">
            <p className="text-muted-foreground text-xs">Current Streak</p>
            <p className="font-bold text-primary">{streak} days</p>
          </div>
        )}
      </div>
    </div>
  )
}
