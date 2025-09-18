
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  adjustWorkoutPlan,
  AdjustWorkoutPlanInput,
} from "@/ai/flows/dynamic-workout-adjustment";
import {
  createExercisePlan,
  CreateExercisePlanInput,
} from "@/ai/flows/create-exercise-plan";

const PlanCreationSchema = z.object({
  age: z.number(),
  sex: z.enum(["male", "female", "other"]),
  height: z.number(),
  weight: z.number(),
  medicalHistory: z.string().optional(),
  fitnessGoals: z.string().min(10, "Please provide more detailed goals."),
});

const AdjustmentSchema = z.object({
  workoutPlan: z.string(),
  userFeedback: z.string().min(10, "Please provide more detailed feedback."),
  performanceData: z.string(),
  fitnessGoals: z.string(),
});

type AdjustmentData = z.infer<typeof AdjustmentSchema>;
type PlanCreationData = z.infer<typeof PlanCreationSchema>;

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

export async function generateNewPlan(data: PlanCreationData) {
    try {
        const validatedData = PlanCreationSchema.parse(data);
        const result = await createExercisePlan(validatedData as CreateExercisePlanInput);

        revalidatePath("/plan");

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Error generating new plan:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return {
            success: false,
            error: errorMessage,
        };
    }
}
