
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generatePlan } from '@/app/actions/user-data';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RiskAssessment } from '@/lib/types';
import type { OnboardingData } from '@/lib/types';

const formSchema = z.object({
  fitnessGoals: z.string().min(10, "Please describe your fitness goals in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingProgress {
  userData: OnboardingData;
  riskAssessment: RiskAssessment;
}

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    const storedProgress = sessionStorage.getItem('onboardingProgress');
    if (storedProgress) {
      try {
        setOnboardingProgress(JSON.parse(storedProgress));
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error loading data',
          description: 'Could not load previous step. Please start over.',
        });
        router.push('/onboarding/start');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please complete the first step of the onboarding process.',
      });
      router.push('/onboarding/start');
    }
  }, [router, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessGoals: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!onboardingProgress) {
      toast({ variant: 'destructive', title: 'Something went wrong', description: 'Onboarding data is missing.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await generatePlan({
        ...onboardingProgress.userData,
        fitnessGoals: values.fitnessGoals,
        riskAssessment: onboardingProgress.riskAssessment.riskAssessment,
      });

      if (result.success && result.data) {
        toast({
          title: 'Plan Generated!',
          description: 'Redirecting you to your new plan...',
        });
        
        const finalData = {
            exercisePlan: result.data.exercisePlan,
            safetyAdvice: result.data.safetyAdvice,
            riskAssessment: onboardingProgress.riskAssessment
        }
        
        const combinedData = {
          ...onboardingProgress.userData,
          fitnessGoals: values.fitnessGoals,
        };

        sessionStorage.setItem('generatedPlan', JSON.stringify(finalData));
        sessionStorage.setItem('onboardingData', JSON.stringify(combinedData));

        // Clean up progress
        sessionStorage.removeItem('onboardingProgress');

        router.push('/plan');
      } else {
        throw new Error(result.error || 'There was a problem generating your plan.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!onboardingProgress) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Step 2: Fitness Goals</CardTitle>
          <CardDescription>What do you want to achieve? Be as specific as you can.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="fitnessGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I want to lose 10kg in 3 months and build muscle definition.'"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  'Generate My Plan'
                )}
              </Button>
            </motion.form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
