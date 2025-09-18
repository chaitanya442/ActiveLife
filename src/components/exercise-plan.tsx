
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DietPieChart } from "@/components/diet-pie-chart";
import { StoredPlan, ExercisePlan, DailyExercise } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAdjustedPlan } from "@/app/actions/user-data";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Trash2, AlertTriangle, Dumbbell, WandSparkles } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


interface ExercisePlanProps {
  storedPlan: StoredPlan;
  onDelete: () => void;
}

const adjustmentSchema = z.object({
  userFeedback: z.string().min(10, "Please provide more detailed feedback."),
  performanceData: z.string().optional(),
});
type AdjustmentFormData = z.infer<typeof adjustmentSchema>;


export function ExercisePlan({ storedPlan, onDelete }: ExercisePlanProps) {
  const [currentPlan, setCurrentPlan] = useState(storedPlan);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { userFeedback: "", performanceData: "Not specified" },
  });

  const onAdjustSubmit = async (data: AdjustmentFormData) => {
    setIsAdjusting(true);

    if (!Array.isArray(currentPlan.plan.exercisePlan)) {
        toast({
            variant: "destructive",
            title: "Adjustment Failed",
            description: "Cannot adjust a plan with an outdated format. Please create a new plan.",
        });
        setIsAdjusting(false);
        return;
    }

    try {
        const input = {
            ...data,
            exercisePlan: currentPlan.plan.exercisePlan,
            dietPlan: currentPlan.plan.dietPlan,
            macros: currentPlan.plan.macros!,
            fitnessGoals: currentPlan.onboarding.fitnessGoals || "Not specified",
        }
        
        const result = await getAdjustedPlan(input);
        if (result.success && result.data) {
            const newPlanData: ExercisePlan = {
                exercisePlan: result.data.exercisePlan,
                dietPlan: result.data.dietPlan,
                macros: result.data.macros,
                safetyAdvice: result.data.safetyAdvice,
            };

            const updatedStoredPlan: StoredPlan = {
                ...currentPlan,
                plan: newPlanData,
            };

            setCurrentPlan(updatedStoredPlan);

            // Update session storage
            const storedPlans = sessionStorage.getItem("userPlans");
            if (storedPlans) {
                const plans: StoredPlan[] = JSON.parse(storedPlans);
                const planIndex = plans.findIndex(p => p.id === currentPlan.id);
                if (planIndex !== -1) {
                    plans[planIndex] = updatedStoredPlan;
                    sessionStorage.setItem("userPlans", JSON.stringify(plans));
                }
            }
            
            toast({
                title: "Plan Adjusted!",
                description: "Your workout and diet plan have been updated.",
            });
            form.reset();
        } else {
            throw new Error(result.error || "Failed to get adjusted plan.");
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Adjustment Failed",
            description: error instanceof Error ? error.message : "An unexpected error occurred."
        });
    } finally {
        setIsAdjusting(false);
    }
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
      
       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <WandSparkles className="text-accent" />
                Adjust Your Plan with AI
            </CardTitle>
            <CardDescription>
                Provide feedback on your current plan and let our AI tailor it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                                        placeholder="e.g., 'The leg day was too intense, I need something lighter. I'm also getting bored of chicken for dinner.'"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="performanceData"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Performance Data (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'I could only do 5 reps of squats. I was able to increase my bench press weight.'"
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
                           "Adjust Plan"
                        )}
                    </Button>
                </form>
             </Form>
          </CardContent>
       </Card>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle />
                Danger Zone
            </CardTitle>
            <CardDescription>
                If you want to start over, you can delete this plan. This action cannot be undone.
            </CardDescription>
            </CardHeader>
            <CardContent>
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
