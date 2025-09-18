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
import { Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old."),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select your sex.",
  }),
  height: z.coerce.number().min(50, "Please enter a valid height in cm."),
  weight: z.coerce.number().min(20, "Please enter a valid weight in kg."),
  medicalHistory: z.instanceof(File).optional(),
  fitnessGoals: z
    .string()
    .min(10, "Please describe your fitness goals in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 18,
      height: 170,
      weight: 70,
      fitnessGoals: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const file = values.medicalHistory;
    let pdfDataUri: string | undefined;

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a PDF smaller than 5MB.",
        });
        setIsSubmitting(false);
        return;
      }
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file.",
        });
        setIsSubmitting(false);
        return;
      }
      
      pdfDataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (e) => reject(new Error("File reading error."));
        reader.readAsDataURL(file);
      });
    }
    
    // Create a plain object for session storage without the file
    const onboardingDataForStorage = {
        age: values.age,
        sex: values.sex,
        height: values.height,
        weight: values.weight,
        fitnessGoals: values.fitnessGoals,
    };

    const result = await generatePlan({
      ...values,
      medicalHistory: undefined, // Don't send the file object to the server action
      pdfDataUri,
    });
    
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Plan Generated!",
        description: "Redirecting you to your new plan...",
      });
      sessionStorage.setItem("generatedPlan", JSON.stringify(result.data));
      sessionStorage.setItem("onboardingData", JSON.stringify(onboardingDataForStorage));
      router.push("/plan");
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error || "There was a problem generating your plan.",
      });
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
                      defaultValue={field.value}
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
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
      name="medicalHistory"
      render={({ field: { onChange, ...rest } }) => (
                <FormItem>
                  <FormLabel>Medical History (Optional PDF)</FormLabel>
                  <FormControl>
                    <Button asChild variant="outline" className="w-full">
                      <label className="cursor-pointer flex items-center justify-center">
                        <Upload className="mr-2 h-4 w-4" />
                        {fileName || "Upload PDF"}
                        <Input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                            setFileName(file?.name || "");
                          }}
                          {...rest}
                        />
                      </label>
                    </Button>
                  </FormControl>
                  <FormDescription>
                    For the most accurate risk assessment, upload a PDF of your
                    medical history.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
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
                "Generate My Plan"
              )}
            </Button>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
