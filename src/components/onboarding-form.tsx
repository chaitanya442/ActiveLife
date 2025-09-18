
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
import { generatePlan, extractDataFromPdf } from "@/app/actions/user-data";
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
  medicalHistory: z.any(),
  fitnessGoals: z
    .string()
    .min(10, "Please describe your fitness goals in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 18,
      sex: undefined,
      height: 170,
      weight: 70,
      fitnessGoals: "",
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);

    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file.",
      });
      return;
    }
     if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a PDF smaller than 5MB.",
      });
      return;
    }

    setIsExtracting(true);
    toast({ title: "Reading PDF...", description: "Extracting data from your document. Please wait." });

    try {
      const pdfDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error("File reading error."));
        reader.readAsDataURL(file);
      });
      
      const result = await extractDataFromPdf(pdfDataUri);
      
      if (result.success && result.data) {
        const { age, sex, height, weight } = result.data;
        if (age) form.setValue("age", age);
        if (sex) form.setValue("sex", sex);
        if (height) form.setValue("height", height);
        if (weight) form.setValue("weight", weight);
        toast({
          title: "Success!",
          description: "We've pre-filled the form with the data found in your PDF.",
        });
      } else {
        throw new Error(result.error || "Failed to extract data.");
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not read PDF",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const file = values.medicalHistory?.[0];
    let pdfDataUri: string | undefined;

    if (file) {
        try {
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
        } catch (error) {
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: error instanceof Error ? error.message : "Could not process the uploaded file."
            });
            setIsSubmitting(false);
            return;
        }
    }
    
    const onboardingDataForStorage = {
        age: values.age,
        sex: values.sex,
        height: values.height,
        weight: values.weight,
        fitnessGoals: values.fitnessGoals,
    };

    const result = await generatePlan({
      ...values,
      medicalHistory: undefined, 
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

  const medicalHistoryRef = form.register('medicalHistory');

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

            <FormItem>
              <FormLabel>Medical History (Optional PDF)</FormLabel>
              <FormControl>
                <Button asChild variant="outline" className="w-full" disabled={isExtracting}>
                  <label className="cursor-pointer flex items-center justify-center">
                    {isExtracting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isExtracting ? "Reading PDF..." : (fileName || "Upload PDF & Pre-fill Form")}
                    <Input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      {...medicalHistoryRef}
                      onChange={handleFileChange}
                      disabled={isExtracting}
                    />
                  </label>
                </Button>
              </FormControl>
              <FormDescription>
                For the most accurate risk assessment, upload a PDF. We can try to pre-fill the form for you.
              </FormDescription>
              <FormMessage />
            </FormItem>

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
            <Button type="submit" size="lg" disabled={isSubmitting || isExtracting} className="w-full">
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
