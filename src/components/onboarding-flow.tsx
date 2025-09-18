
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateNewPlan } from '@/app/actions/user-data';
import { Loader2, User, HeartPulse, Target as TargetIcon } from 'lucide-react';
import { ExercisePlan, OnboardingData } from '@/lib/types';

interface OnboardingFlowProps {
  onPlanGenerated: (plan: ExercisePlan, data: OnboardingData) => void;
}

const step1Schema = z.object({
  age: z.coerce.number().min(16, "You must be at least 16 years old.").max(100),
  sex: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(100, "Height must be in cm.").max(250),
  weight: z.coerce.number().min(30, "Weight must be in kg.").max(300),
  medicalHistory: z.string().optional(),
});

const step2Schema = z.object({
  fitnessGoals: z.string().min(10, "Please describe your goals in more detail."),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export function OnboardingFlow({ onPlanGenerated }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { medicalHistory: '' },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const onNextStep = () => setStep(2);

  const onFinalSubmit = async (values: Step2Data) => {
    setIsSubmitting(true);
    const step1Values = step1Form.getValues();
    const finalData = { ...step1Values, ...values };

    try {
      const result = await generateNewPlan(finalData);
      if (result.success && result.data) {
        toast({
          title: 'Your Plan is Ready!',
          description: "We've generated a personalized fitness plan for you.",
        });
        onPlanGenerated(result.data, finalData);
      } else {
        throw new Error(result.error || 'Failed to generate plan.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Create Your Personalized Plan
        </CardTitle>
        <CardDescription>
          Tell us a bit about yourself so our AI can create the perfect plan for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <FormProvider {...step1Form}>
                <Form {...step1Form}>
                  <form onSubmit={step1Form.handleSubmit(onNextStep)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={step1Form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 25" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={step1Form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        control={step1Form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 175" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={step1Form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={step1Form.control}
                        name="medicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical History (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please list any relevant medical conditions, injuries, or allergies. e.g., 'Knee injury from 2 years ago, allergic to peanuts.'"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <CardFooter className="px-0 justify-end">
                      <Button type="submit">Next</Button>
                    </CardFooter>
                  </form>
                </Form>
              </FormProvider>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <FormProvider {...step2Form}>
                <Form {...step2Form}>
                  <form onSubmit={step2Form.handleSubmit(onFinalSubmit)} className="space-y-6">
                    <FormField
                      control={step2Form.control}
                      name="fitnessGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Fitness Goals</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Describe what you want to achieve. e.g., 'I want to lose 5kg in the next 3 months and build muscle tone. I can only work out 3 times a week.'"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <CardFooter className="px-0 justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Plan...
                          </>
                        ) : (
                          'Generate My Plan'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </FormProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
