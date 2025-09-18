
"use client"

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProgressPieChartProps {
  data: { name: string, value: number, fill: string }[];
  title: string;
  description: string;
}


export function ProgressPieChart({ data, title, description }: ProgressPieChartProps) {

  const chartConfig = data.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);


  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                No data available yet.
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
            >
                <PieChart>
                    <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                        {data.map((entry) => (
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
  )
}
