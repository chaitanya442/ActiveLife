
"use server";

import {
  adjustWorkoutPlan,
  AdjustWorkoutPlanInput,
} from "@/ai/flows/dynamic-workout-adjustment";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
