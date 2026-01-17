"use client"

interface WeeklyChecklistProps {
  habits: Array<{ id: string; name: string }>
  weeklyCompletions: Record<string, boolean[]>
  onToggle: (habitId: string, week: number) => void
}

export default function WeeklyChecklist({ habits, weeklyCompletions, onToggle }: WeeklyChecklistProps) {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Weekly Habits</h3>

      {habits.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
          <p className="text-muted-foreground">No weekly habits added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-card rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-3">{habit.name}</h4>
              <div className="grid grid-cols-4 gap-2">
                {weeks.map((week, index) => {
                  const isCompleted = weeklyCompletions[habit.id]?.[index] ?? false
                  return (
                    <button
                      key={index}
                      onClick={() => onToggle(habit.id, index)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-smooth ${
                        isCompleted
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted hover:bg-muted/70 text-muted-foreground"
                      }`}
                    >
                      {week}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round(((weeklyCompletions[habit.id] || []).filter(Boolean).length / 4) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary">
                  {Math.round(((weeklyCompletions[habit.id] || []).filter(Boolean).length / 4) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
