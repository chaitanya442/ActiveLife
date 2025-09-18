
"use server";

import {
  riskStratification,
  RiskStratificationInput,
  RiskStratificationOutput,
} from "@/ai/flows/risk-stratification";
import {
  generatePersonalizedExercisePlan,
  PersonalizedExercisePlanInput,
  PersonalizedExercisePlanOutput,
} from "@/ai/flows/personalized-exercise-plan";
import {
  adjustWorkoutPlan,
  AdjustWorkoutPlanInput,
} from "@/ai/flows/dynamic-workout-adjustment";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const OnboardingDataSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old."),
  sex: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(1, "Height is required."),
  weight: z.coerce.number().min(1, "Weight is required."),
  medicalHistory: z.string().optional(),
});

type OnboardingData = z.infer<typeof OnboardingDataSchema>;

export async function performRiskAssessment(data: OnboardingData): Promise<{
  success: boolean;
  data?: { riskAssessment: RiskStratificationOutput };
  error?: string;
}> {
  try {
    const validatedData = OnboardingDataSchema.parse(data);

    const riskInput: RiskStratificationInput = {
      ...validatedData,
      medicalHistory: validatedData.medicalHistory || "No medical history provided.",
    };

    const riskResult = await riskStratification(riskInput);
    
    return {
      success: true,
      data: {
        riskAssessment: riskResult,
      },
    };
  } catch (error) {
    console.error("Error in risk assessment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

const PlanGenerationSchema = OnboardingDataSchema.extend({
  fitnessGoals: z.string().min(10, "Please describe your fitness goals."),
  riskAssessment: z.string(),
});

type PlanGenerationData = z.infer<typeof PlanGenerationSchema>;

export async function generatePlan(data: PlanGenerationData): Promise<{
  success: boolean;
  data?: PersonalizedExercisePlanOutput;
  error?: string;
}> {
  try {
    const validatedData = PlanGenerationSchema.parse(data);

    const planInput: PersonalizedExercisePlanInput = {
      ...validatedData,
      medicalHistory: validatedData.medicalHistory || "",
    };

    const planResult = await generatePersonalizedExercisePlan(planInput);

    revalidatePath("/dashboard");
    revalidatePath("/plan");
    
    return {
      success: true,
      data: planResult,
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
    const result = await adjustWorkoutPlan(validatedData as AdjustWorkoutPlanInput);

    revalidatePath("/plan");

    return {
      success: true,
      data: {
        exercisePlan: result.adjustedWorkoutPlan,
        safetyAdvice: result.explanation,
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
