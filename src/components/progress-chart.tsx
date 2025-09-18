
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useEffect, useState } from "react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const initialChartData = [
  { month: "January", workouts: null },
  { month: "February", workouts: null },
  { month: "March", workouts: null },
  { month: "April", workouts: null },
  { month: "May", workouts: null },
  { month: "June", workouts: null },
]

const chartConfig = {
  workouts: {
    label: "Workouts",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ProgressChart() {
  const [chartData, setChartData] = useState(initialChartData);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data.
    // For now, we'll check if there's any non-null data.
    const dataExists = chartData.some(d => d.workouts !== null);
    setHasData(dataExists);
  }, [chartData]);


  if (!hasData) {
    return (
        <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            No workout data available yet.
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="workouts" fill="var(--color-workouts)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
