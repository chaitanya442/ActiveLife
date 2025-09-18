
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
import { Loader2, ShieldAlert, Wand2, Trash2, AlertTriangle, Dumbbell, Info } from "lucide-react";
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
    // This functionality is temporarily disabled until the AI flow is updated
    // for structured plan adjustments.
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

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <DietPieChart macros={currentPlan.plan.macros} />
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="text-primary" />
                    Weekly Exercise Plan
                </CardTitle>
                </CardHeader>
                <CardContent>
                    {Array.isArray(currentPlan.plan.exercisePlan) ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentPlan.plan.exercisePlan.map((day) => (
                                <Card key={day.day} className="flex flex-col">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">{day.day}</CardTitle>
                                        <CardDescription>{day.focus}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="list-disc pl-4 space-y-2 text-sm">
                                            {day.exercises.map(ex => (
                                                <li key={ex.name}>
                                                    <span className="font-semibold">{ex.name}</span>: {ex.sets} sets of {ex.reps} reps
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Plan Data Corrupted</AlertTitle>
                            <AlertDescription>
                                This exercise plan is in an outdated format. Please delete it and create a new one.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      
      <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Adjust Plan Feature Update</AlertTitle>
          <AlertDescription>
            The ability to adjust your plan with AI is temporarily disabled. We're working on an improved version that handles your structured plan data correctly. Thank you for your patience!
          </AlertDescription>
      </Alert>

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
