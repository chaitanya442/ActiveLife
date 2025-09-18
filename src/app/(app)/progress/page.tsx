
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ProgressChart } from '@/components/progress-chart';
import { ProgressPieChart } from '@/components/progress-pie-chart';

const workoutTypeData: { name: string, value: number, fill: string }[] = [
    // Example data:
    // { name: 'Cardio', value: 40, fill: 'hsl(var(--chart-1))' },
    // { name: 'Strength', value: 50, fill: 'hsl(var(--chart-2))' },
    // { name: 'Flexibility', value: 10, fill: 'hsl(var(--chart-3))' },
];

const muscleGroupData: { name: string, value: number, fill: string }[] = [
    // Example data:
    // { name: 'Legs', value: 30, fill: 'hsl(var(--chart-1))' },
    // { name: 'Chest', value: 25, fill: 'hsl(var(--chart-2))' },
    // { name: 'Back', value: 20, fill: 'hsl(var(--chart-3))' },
    // { name: 'Arms', value: 15, fill: 'hsl(var(--chart-4))' },
    // { name: 'Core', value: 10, fill: 'hsl(var(--chart-5))' },
];


export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Your Progress</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Workout
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Workout Frequency</CardTitle>
            <CardDescription>A summary of your workout consistency over the last few months.</CardDescription>
        </CardHeader>
        <CardContent>
            <ProgressChart />
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressPieChart
          data={workoutTypeData}
          title="Workout Type Distribution"
          description="A breakdown of your workout types."
        />
        <ProgressPieChart
          data={muscleGroupData}
          title="Muscle Group Focus"
          description="A breakdown of the muscle groups you've trained."
        />
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
          <CardDescription>
            A log of your completed workouts and activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No workout history yet.
                    </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
