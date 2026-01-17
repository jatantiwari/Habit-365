"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface YearlyOverviewProps {
  data: Array<{ month: string; completion: number }>
}

export default function YearlyOverview({ data }: YearlyOverviewProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Yearly Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="completion" fill="var(--color-primary)" radius={[8, 8, 0, 0]} name="Completion %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
