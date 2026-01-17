"use client"

interface HabitGridProps {
  habits: Array<{ id: string; name: string; time?: string }>
  completions: Record<string, boolean[]>
  onToggle: (habitId: string, day: number) => void
  onEditHabit?: (habitId: string) => void
  daysInMonth: number
}

export default function HabitGrid({
  habits,
  completions,
  onToggle,
  onEditHabit,
  daysInMonth,
}: HabitGridProps) {
  return (
    <div className="w-full overflow-x-auto touch-pan-x">
      <table className="min-w-max border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">

            {/* FIXED COLUMN — IMPORTANT FIXES: 
                max-w, z-index lowered, pointer-events-none */}
            <th
              className="
                sticky left-0 bg-muted/50
                px-3 py-3 font-semibold text-left w-[140px]
                max-w-[140px] truncate
                z-[1]
              "
            >
              Habit
            </th>

            {/* Days */}
            {Array.from({ length: daysInMonth }, (_, i) => (
              <th
                key={i}
                className="px-2 py-2 text-center font-medium text-muted-foreground min-w-8"
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {habits.map((habit) => (
            <tr
              key={habit.id}
              className="border-b border-border hover:bg-muted/20 transition"
            >
              {/* FIXED HABIT COLUMN — REAL FIX */}
              <td
                className="
                  sticky left-0 bg-card px-3 py-3 w-[140px] max-w-[140px]
                  truncate z-[1]
                  border-r border-border
                "
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 truncate">
                    <p className="truncate">{habit.name}</p>
                    {habit.time && (
                      <p className="text-xs text-muted-foreground truncate">
                        {habit.time}
                      </p>
                    )}
                  </div>

                  {onEditHabit && (
                    <button
                      onClick={() => onEditHabit(habit.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition"
                    >
                      ✎
                    </button>
                  )}
                </div>
              </td>

              {/* DAYS */}
              {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                const isCompleted =
                  completions[habit.id]?.[dayIndex] ?? false

                return (
                  <td key={dayIndex} className="px-2 py-3 text-center">

                    {/* IMPORTANT FIX:
                        pointer-events-auto 
                        touch-manipulation */}
                    <button
                      onClick={() => onToggle(habit.id, dayIndex)}
                      className={`
                        w-8 h-8 rounded-md flex items-center justify-center 
                        transition pointer-events-auto touch-manipulation
                        ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : ""}
                    </button>

                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
