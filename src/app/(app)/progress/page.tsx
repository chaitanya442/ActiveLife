
'use client';

import { useEffect, useState } from 'react';
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
import type { StoredPlan, WorkoutLog } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { LogWorkoutDialog } from '@/components/log-workout-dialog';
import { format } from 'date-fns';

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
  const [plans, setPlans] = useState<StoredPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);


  useEffect(() => {
    try {
      const storedPlans = sessionStorage.getItem("userPlans");
      if (storedPlans) {
        const parsedPlans: StoredPlan[] = JSON.parse(storedPlans);
        const sortedPlans = parsedPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPlans(sortedPlans);
        if (sortedPlans.length > 0) {
          setSelectedPlanId(sortedPlans[0].id);
        }
      }

      const storedLogs = sessionStorage.getItem('workoutLogs');
      if (storedLogs) {
        setWorkoutLogs(JSON.parse(storedLogs));
      }

    } catch (error) {
      console.error("Failed to parse data from session storage", error);
    }
  }, []);

  const handleLogSaved = (newLog: WorkoutLog) => {
    const updatedLogs = [...workoutLogs, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setWorkoutLogs(updatedLogs);
    sessionStorage.setItem('workoutLogs', JSON.stringify(updatedLogs));
  }

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const filteredLogs = workoutLogs.filter(log => log.planId === selectedPlanId);


  if (plans.length === 0) {
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>No Plans to Track</CardTitle>
                <CardDescription>You need to create a fitness plan before you can track your progress.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/plan">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create a Plan
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">
                {selectedPlan ? `Progress for "${selectedPlan.name}"` : 'Your Progress'}
            </h1>
            <p className="text-muted-foreground">Select a plan to view your progress and log workouts.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
             <Select
                value={selectedPlanId ?? ""}
                onValueChange={setSelectedPlanId}
                disabled={plans.length === 0}
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                    {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <LogWorkoutDialog 
                plan={selectedPlan} 
                onLogSaved={handleLogSaved}
                open={isLogDialogOpen}
                onOpenChange={setIsLogDialogOpen}
            >
                <Button disabled={!selectedPlan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log Workout
                </Button>
            </LogWorkoutDialog>
        </div>
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
            A log of your completed workouts and activities for this plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.date), 'PP')}</TableCell>
                            <TableCell>{log.workoutFocus}</TableCell>
                            <TableCell>{log.duration} min</TableCell>
                            <TableCell className="max-w-[200px] truncate">{log.notes}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No workout history yet for this plan.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
