"use server";

import {
  riskStratification,
  RiskStratificationInput,
} from "@/ai/flows/risk-stratification";
import {
  generatePersonalizedExercisePlan,
  PersonalizedExercisePlanInput,
} from "@/ai/flows/personalized-exercise-plan";
import {
  adjustWorkoutPlan,
  AdjustWorkoutPlanInput,
} from "@/ai/flows/dynamic-workout-adjustment";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const OnboardingSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old."),
  sex: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(1, "Height is required."),
  weight: z.coerce.number().min(1, "Weight is required."),
  medicalHistory: z.string().optional(),
  fitnessGoals: z.string().min(10, "Please describe your fitness goals."),
  pdfDataUri: z.string().optional(),
});

type OnboardingData = z.infer<typeof OnboardingSchema>;

export async function generatePlan(data: OnboardingData) {
  try {
    const validatedData = OnboardingSchema.parse(data);

    const riskInput: RiskStratificationInput = {
      age: validatedData.age,
      sex: validatedData.sex,
      height: validatedData.height,
      weight: validatedData.weight,
      medicalHistoryPdfDataUri:
        validatedData.pdfDataUri || "data:text/plain;base64,",
    };

    const riskResult = await riskStratification(riskInput);

    const planInput: PersonalizedExercisePlanInput = {
      ...validatedData,
      riskAssessment: riskResult.riskAssessment,
    };

    const planResult = await generatePersonalizedExercisePlan(planInput);

    revalidatePath("/dashboard");
    revalidatePath("/plan");
    
    return {
      success: true,
      data: {
        riskAssessment: riskResult,
        exercisePlan: planResult,
      },
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

const AdjustmentSchema = z.object({
  workoutPlan: z.string(),
  userFeedback: z.string().min(10, "Please provide more detailed feedback."),
  performanceData: z.string(),
  fitnessGoals: z.string(),
});

type AdjustmentData = z.infer<typeof AdjustmentSchema>;

export async function getAdjustedPlan(data: AdjustmentData) {
  try {
    const validatedData = AdjustmentSchema.parse(data);
    const result = await adjustWorkoutPlan(validatedData);

    revalidatePath("/plan");

    return {
      success: true,
      data: {
        exercisePlan: {
          exercisePlan: result.adjustedWorkoutPlan,
          safetyAdvice: result.explanation,
        },
      },
    };
  } catch (error) {
    console.error("Error adjusting plan:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
