
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
import { generateNewPlan, getHighlightsFromPdf } from '@/app/actions/user-data';
import { Loader2, Upload, FileText, Lightbulb } from 'lucide-react';
import { ExercisePlan, OnboardingData, StoredPlan, ExtractHighlightsOutput } from '@/lib/types';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface OnboardingFlowProps {
  onPlanGenerated: (plan: StoredPlan) => void;
  onCancel: () => void;
}

const step1Schema = z.object({
  planName: z.string().min(3, "Plan name must be at least 3 characters long."),
  fitnessGoals: z.string().min(10, "Please describe your goals in more detail."),
});

const step2Schema = z.object({
  age: z.coerce.number().min(16, "You must be at least 16 years old.").max(100),
  sex: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(100, "Height must be in cm.").max(250),
  weight: z.coerce.number().min(30, "Weight must be in kg.").max(300),
  medicalHistory: z.string().optional(),
  medicalPdf: z.string().optional(),
});


type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

// Function to create a simple hash from a string
const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return 'pdf-' + hash.toString();
};

export function OnboardingFlow({ onPlanGenerated, onCancel }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<Partial<ExtractHighlightsOutput>>({});

  const { toast } = useToast();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { planName: '', fitnessGoals: '' },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { age: '' as any, height: '' as any, weight: '' as any, medicalHistory: '' },
  });

  const onNextStep = () => setStep(2);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setHighlights(null);
    setFileName(null);
    setPlaceholders({});
    step2Form.setValue('medicalPdf', undefined);
    step2Form.resetField('age');
    step2Form.resetField('sex');
    step2Form.resetField('height');
    step2Form.resetField('weight');


    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
        });
        return;
      }
      setFileName(file.name);
      setIsHighlighting(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        step2Form.setValue('medicalPdf', dataUri);
        
        const pdfHash = simpleHash(dataUri);
        const cachedResult = sessionStorage.getItem(pdfHash);

        const processPdfResult = (resultData: ExtractHighlightsOutput) => {
            if (resultData.highlights) {
                setHighlights(resultData.highlights);
            }
            const newPlaceholders: Partial<ExtractHighlightsOutput> = {};
            if (resultData.age) newPlaceholders.age = resultData.age;
            if (resultData.height) newPlaceholders.height = resultData.height;
            if (resultData.weight) newPlaceholders.weight = resultData.weight;
            setPlaceholders(newPlaceholders);

            if (resultData.sex) {
              step2Form.setValue('sex', resultData.sex);
            }
        };

        if (cachedResult) {
            console.log("Using cached PDF analysis result.");
            processPdfResult(JSON.parse(cachedResult));
            setIsHighlighting(false);
            return;
        }

        try {
          const result = await getHighlightsFromPdf({ medicalPdf: dataUri });
          if (result.success && result.data) {
             processPdfResult(result.data);
             sessionStorage.setItem(pdfHash, JSON.stringify(result.data));
          } else {
            throw new Error(result.error || "Failed to get highlights.");
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: error instanceof Error ? error.message : "Could not analyze the PDF. You may have hit a rate limit. Please try again in a moment."
          });
        } finally {
          setIsHighlighting(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const onFinalSubmit = async (values: Step2Data) => {
    setIsSubmitting(true);
    const step1Values = step1Form.getValues();
    const finalData: OnboardingData = { ...step1Values, ...values };

    try {
      const result = await generateNewPlan(finalData);
      if (result.success && result.data) {
        toast({
          title: 'Your New Plan is Ready!',
          description: `We've generated the "${finalData.planName}" plan for you.`,
        });
        
        const newPlan: StoredPlan = {
            id: crypto.randomUUID(),
            name: finalData.planName!,
            createdAt: new Date().toISOString(),
            onboarding: finalData,
            plan: result.data,
        };
        onPlanGenerated(newPlan);

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
          Create a New Plan
        </CardTitle>
        <CardDescription>
          Follow these steps to generate a new, personalized fitness plan.
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
                    <FormField
                        control={step1Form.control}
                        name="planName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 'Summer Shred', 'Bulking Season'" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <FormField
                      control={step1Form.control}
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
                       <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={step2Form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={placeholders.age ? String(placeholders.age) : "e.g., 25"} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={step2Form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                        control={step2Form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={placeholders.height ? String(placeholders.height) : "e.g., 175"} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={step2Form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={placeholders.weight ? String(placeholders.weight) : "e.g., 70"} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={step2Form.control}
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
                      <div className="space-y-2">
                        <Label>Medical Document (Optional PDF)</Label>
                        <Input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isHighlighting} />
                        <Button asChild variant="outline" className="w-full cursor-pointer" disabled={isHighlighting}>
                           <Label htmlFor="pdf-upload" className="flex items-center gap-2 cursor-pointer">
                                {isHighlighting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing Document...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        {fileName ? `Selected: ${fileName}` : 'Upload PDF & Auto-fill'}
                                    </>
                                )}
                           </Label>
                        </Button>
                      </div>

                      {highlights && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Document Highlights</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">{highlights}</AlertDescription>
                        </Alert>
                      )}


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
