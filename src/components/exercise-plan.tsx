
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DietPieChart } from "@/components/diet-pie-chart";
import { StoredPlan } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAdjustedPlan } from "@/app/actions/user-data";
import { Loader2, ShieldAlert, Wand2, Trash2, AlertTriangle, Dumbbell } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


interface ExercisePlanProps {
  storedPlan: StoredPlan;
  onDelete: () => void;
}

const adjustmentFormSchema = z.object({
  userFeedback: z.string().min(10, "Please provide detailed feedback so we can make a better plan for you."),
});

export function ExercisePlan({ storedPlan, onDelete }: ExercisePlanProps) {
  const [currentPlan, setCurrentPlan] = useState(storedPlan);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { toast } = useToast();

  const form = useForm<{ userFeedback: string }>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: { userFeedback: "" },
  });

  const onAdjustSubmit = async (values: { userFeedback: string }) => {
    setIsAdjusting(true);
    // Note: getAdjustedPlan expects string plans, which we no longer have in the same format.
    // This part of the functionality would need a new AI flow to adjust the structured plan.
    // For now, we'll show a toast message.
    toast({
        title: "Feature In Development",
        description: "Adjusting structured plans is coming soon!",
    });
    setIsAdjusting(false);
  };

  return (
    <div className="space-y-8 pt-6">
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Important Safety Advice</AlertTitle>
        <AlertDescription>{currentPlan.plan.safetyAdvice}</AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="text-primary" />
                    Weekly Exercise Plan
                </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Day</TableHead>
                                <TableHead>Focus</TableHead>
                                <TableHead>Exercises</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPlan.plan.exercisePlan.map((day) => (
                                <TableRow key={day.day}>
                                    <TableCell className="font-medium">{day.day}</TableCell>
                                    <TableCell>{day.focus}</TableCell>
                                    <TableCell>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {day.exercises.map(ex => (
                                                <li key={ex.name}>
                                                    {ex.name}: {ex.sets} sets of {ex.reps} reps
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <DietPieChart macros={currentPlan.plan.macros} />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Wand2 className="text-primary" />
            Adjust Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Is the plan too hard, too easy, or not fitting your schedule? Let our AI know.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAdjustSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'The running sessions are too long, and I don't like broccoli. Can you suggest an alternative?'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isAdjusting}>
                {isAdjusting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  "Adjust Plan with AI"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle />
                Danger Zone
            </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">
                    If you want to start over with a completely new set of goals or personal data, you can delete your current plan. This action cannot be undone.
                </CardDescription>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete This Plan
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete your current exercise and diet plan. This cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
      </Card>
    </div>
  );
}
