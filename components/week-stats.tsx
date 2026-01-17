"use client"

interface WeekStatsProps {
  weeks: number[]
  habitName: string
}

export default function WeekStats({ weeks, habitName }: WeekStatsProps) {
  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"]

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h4 className="font-semibold text-foreground mb-3">{habitName}</h4>
      <div className="grid grid-cols-4 gap-2">
        {weeks.map((percentage, idx) => (
          <div
            key={idx}
            className="bg-muted/50 rounded-lg p-3 text-center border border-border/50 hover:border-primary/30 transition-smooth"
          >
            <p className="text-xs text-muted-foreground mb-1">{weekLabels[idx]}</p>
            <p className="text-lg font-bold text-primary">{percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
