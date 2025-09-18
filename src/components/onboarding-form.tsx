
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { performRiskAssessment } from "@/app/actions/user-data";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old."),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select your sex.",
  }),
  height: z.coerce.number().min(50, "Please enter a valid height in cm."),
  weight: z.coerce.number().min(20, "Please enter a valid weight in kg."),
  medicalHistory: z.string().optional(),
});

export type OnboardingStep1Data = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingStep1Data>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 18,
      sex: undefined,
      height: 170,
      weight: 70,
      medicalHistory: "",
    },
  });
  
  const onSubmit = async (values: OnboardingStep1Data) => {
    setIsSubmitting(true);
    try {
      const result = await performRiskAssessment(values);

      if (result.success && result.data) {
        toast({
            title: "Step 1 Complete!",
            description: "Now, let's set your goals.",
        });
        
        const onboardingProgress = {
            userData: values,
            riskAssessment: result.data.riskAssessment,
        }
        sessionStorage.setItem("onboardingProgress", JSON.stringify(onboardingProgress));
        router.push("/onboarding/goals");
      } else {
        throw new Error(result.error || "There was a problem performing the risk assessment.");
      }
    } catch (error) {
      toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Step 1: Health Information
        </CardTitle>
        <CardDescription>
          Tell us about yourself so we can assess your baseline health profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-secondary">
          <AlertTitle>Privacy First</AlertTitle>
          <AlertDescription>
            Your health data is sensitive. We use it only to generate your personalized plan and do not store it long-term.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </Item>
                )}
              />
            </div>

             <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please list any relevant medical conditions, allergies, or injuries."
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    This information is crucial for creating a safe and effective plan.
                  </FormDescription>
                  <FormMessage />
                </Item>
              )}
            />

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Next: Set Your Goals"
              )}
            </Button>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
