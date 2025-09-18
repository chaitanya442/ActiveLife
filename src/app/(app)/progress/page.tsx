
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

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
                <TableCell className="font-medium">2024-07-20</TableCell>
                <TableCell>Full Body Strength</TableCell>
                <TableCell>45 mins</TableCell>
                <TableCell>
                  <Badge>Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">2024-07-18</TableCell>
                <TableCell>Cardio - Running</TableCell>
                <TableCell>30 mins</TableCell>
                <TableCell>
                  <Badge>Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">2024-07-16</TableCell>
                <TableCell>Rest Day</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Badge variant="secondary">Rest</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
