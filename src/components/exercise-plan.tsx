
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { StoredPlan } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAdjustedPlan } from "@/app/actions/user-data";
import { Loader2, ShieldAlert, Wand2, Apple, Dumbbell, Trash2, AlertTriangle } from "lucide-react";
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


interface ExercisePlanProps {
  storedPlan: StoredPlan;
  onDelete: () => void;
}

const parseSection = (planText: string | undefined) => {
  if (!planText) return [];
  const sections = planText.split(/Week \d+:|Warm-up:|Cool-down:|Monday:|Tuesday:|Wednesday:|Thursday:|Friday:|Saturday:|Sunday:|Breakfast:|Lunch:|Dinner:|Snacks:/i).filter(s => s.trim() !== "");
  const titles = planText.match(/Week \d+:|Warm-up:|Cool-down:|Monday:|Tuesday:|Wednesday:|Thursday:|Friday:|Saturday:|Sunday:|Breakfast:|Lunch:|Dinner:|Snacks:/gi) || [];

  if (titles.length === 0 && sections.length > 0) {
    // If no specific titles are found, treat the whole text as one section.
    return [{
      title: "General",
      content: sections[0].trim().split('\n').map(line => line.trim()).filter(Boolean)
    }];
  }
  
  return titles.map((title, index) => ({
    title: title.replace(":", "").trim(),
    content: sections[index]
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }));
};

const adjustmentFormSchema = z.object({
  userFeedback: z.string().min(10, "Please provide detailed feedback so we can make a better plan for you."),
});

export function ExercisePlan({ storedPlan, onDelete }: ExercisePlanProps) {
  const [currentPlan, setCurrentPlan] = useState(storedPlan);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { toast } = useToast();
  
  const parsedExercisePlan = parseSection(currentPlan.plan.exercisePlan);
  const parsedDietPlan = parseSection(currentPlan.plan.dietPlan);

  const form = useForm<{ userFeedback: string }>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: { userFeedback: "" },
  });

  const onAdjustSubmit = async (values: { userFeedback: string }) => {
    setIsAdjusting(true);
    try {
        const result = await getAdjustedPlan({
          ...values,
          workoutPlan: currentPlan.plan.exercisePlan,
          dietPlan: currentPlan.plan.dietPlan,
          performanceData: "User is reporting feedback.",
          fitnessGoals: currentPlan.onboarding.fitnessGoals || "",
        });

        if (result.success && result.data) {
          toast({
            title: "Plan Adjusted!",
            description: "Your workout and diet plan has been updated based on your feedback.",
          });
          setCurrentPlan(prev => ({...prev, plan: result.data!}));
          
          // Also update session storage
          const storedPlans = JSON.parse(sessionStorage.getItem('userPlans') || '[]');
          const updatedPlans = storedPlans.map((p: StoredPlan) => 
            p.id === currentPlan.id ? { ...p, plan: result.data } : p
          );
          sessionStorage.setItem('userPlans', JSON.stringify(updatedPlans));
          form.reset();

        } else {
          throw new Error(result.error || "Could not adjust the plan.");
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Dumbbell className="text-primary" />
                Exercise Plan
            </CardTitle>
            </CardHeader>
            <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {parsedExercisePlan.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={`ex-${index}`}>
                    <AccordionTrigger className="font-semibold font-headline text-lg">
                    {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {section.content.map((line, lineIndex) => (
                        <li key={lineIndex}>{line}</li>
                        ))}
                    </ul>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Apple className="text-accent" />
                Diet Plan
            </CardTitle>
            </CardHeader>
            <CardContent>
             <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {parsedDietPlan.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={`diet-${index}`}>
                    <AccordionTrigger className="font-semibold font-headline text-lg">
                    {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {section.content.map((line, lineIndex) => (
                        <li key={lineIndex}>{line}</li>
                        ))}
                    </ul>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
            </CardContent>
        </Card>
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
