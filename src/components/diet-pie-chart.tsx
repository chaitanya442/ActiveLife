
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple } from "lucide-react";

interface DietPieChartProps {
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

const chartConfig = {
  carbs: { label: "Carbs", color: "hsl(var(--chart-1))" },
  protein: { label: "Protein", color: "hsl(var(--chart-2))" },
  fat: { label: "Fat", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export function DietPieChart({ macros }: DietPieChartProps) {
  const chartData = Object.entries(macros).map(([name, value]) => ({
    name: chartConfig[name as keyof typeof chartConfig].label,
    value,
    fill: chartConfig[name as keyof typeof chartConfig].color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Apple className="text-accent" />
            Diet Breakdown
        </CardTitle>
        <CardDescription>Recommended daily macronutrient distribution.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `${value}%`} />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              content={({ payload }) => {
                return (
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4 text-sm">
                    {payload?.map((entry) => (
                      <li key={`item-${entry.value}`} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.value}
                      </li>
                    ))}
                  </ul>
                )
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
