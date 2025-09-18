
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ExercisePlan as ExercisePlanType } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAdjustedPlan } from "@/app/actions/user-data";
import { Loader2, ShieldAlert, Sparkles, Wand2 } from "lucide-react";

interface ExercisePlanProps {
  initialPlan: ExercisePlanType;
  fitnessGoals: string;
}

const parsePlan = (planText: string) => {
  const sections = planText.split(/Week \d+:|Warm-up:|Cool-down:/i).filter(s => s.trim() !== "");
  const titles = planText.match(/Week \d+:|Warm-up:|Cool-down:/gi) || [];

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

export function ExercisePlan({ initialPlan, fitnessGoals }: ExercisePlanProps) {
  const [plan, setPlan] = useState<ExercisePlanType>(initialPlan);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { toast } = useToast();
  
  const parsedPlan = parsePlan(plan.exercisePlan);

  const form = useForm<{ userFeedback: string }>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: { userFeedback: "" },
  });

  const onAdjustSubmit = async (values: { userFeedback: string }) => {
    setIsAdjusting(true);
    try {
        const result = await getAdjustedPlan({
          ...values,
          workoutPlan: plan.exercisePlan,
          performanceData: "User is reporting feedback.",
          fitnessGoals,
        });

        if (result.success && result.data) {
          toast({
            title: "Plan Adjusted!",
            description: "Your workout plan has been updated based on your feedback.",
          });
          setPlan(result.data);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">Your Personalized Plan</h1>
        <p className="text-muted-foreground">
          Here is your AI-generated fitness plan. Follow it closely and provide feedback to adjust.
        </p>
      </div>

      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Important Safety Advice</AlertTitle>
        <AlertDescription>{plan.safetyAdvice}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            Workout Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {parsedPlan.map((section, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
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
                        placeholder="e.g., 'The running sessions are too long for me right now. I'd prefer shorter, more intense workouts.'"
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
    </div>
  );
}
