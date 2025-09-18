
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
import { generatePlan } from "@/app/actions/user-data";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old."),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select your sex.",
  }),
  height: z.coerce.number().min(50, "Please enter a valid height in cm."),
  weight: z.coerce.number().min(20, "Please enter a valid weight in kg."),
  medicalHistory: z.string().optional(),
  fitnessGoals: z
    .string()
    .min(10, "Please describe your fitness goals in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 18,
      sex: undefined,
      height: 170,
      weight: 70,
      fitnessGoals: "",
      medicalHistory: "",
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const result = await generatePlan(values);

      if (result.success && result.data) {
        toast({
            title: "Plan Generated!",
            description: "Redirecting you to your new plan...",
        });
        sessionStorage.setItem("generatedPlan", JSON.stringify(result.data));
        sessionStorage.setItem("onboardingData", JSON.stringify(values));
        router.push("/plan");
      } else {
        throw new Error(result.error || "There was a problem generating your plan.");
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
          Tell Us About Yourself
        </CardTitle>
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

            <FormField
              control={form.control}
              name="fitnessGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'I want to lose 10kg in 3 months and build muscle definition.'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as specific as you can. What do you want to achieve?
                  </FormDescription>
                  <FormMessage />
                </Item>
              )}
            />
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                "Generate My Plan"
              )}
            </Button>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
