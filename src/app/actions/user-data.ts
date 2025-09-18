
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
import {
  extractHighlights,
  ExtractHighlightsInput,
} from "@/ai/flows/extract-highlights-from-pdf";

const PlanCreationSchema = z.object({
  age: z.coerce.number().min(16, "You must be at least 16 years old.").max(100),
  sex: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(100, "Height must be in cm.").max(250),
  weight: z.coerce.number().min(30, "Weight must be in kg.").max(300),
  medicalHistory: z.string().optional(),
  medicalPdf: z.string().optional(),
  fitnessGoals: z.string().min(10, "Please provide more detailed goals."),
});

const DailyExerciseSchema = z.object({
  day: z.string(),
  focus: z.string(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.string(),
    reps: z.string(),
  })),
});

const DietPlanSchema = z.object({
    summary: z.string(),
    breakfast: z.array(z.string()),
    lunch: z.array(z.string()),
    dinner: z.array(z.string()),
    snacks: z.array(z.string()),
});

const AdjustmentSchema = z.object({
  exercisePlan: z.array(DailyExerciseSchema),
  dietPlan: DietPlanSchema,
  macros: z.object({
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
  }),
  userFeedback: z.string().min(10, "Please provide more detailed feedback."),
  performanceData: z.string().optional(),
  fitnessGoals: z.string(),
});


const HighlightsSchema = z.object({
  medicalPdf: z.string(),
});


type AdjustmentData = z.infer<typeof AdjustmentSchema>;
type PlanCreationData = z.infer<typeof PlanCreationSchema>;
type HighlightsData = z.infer<typeof HighlightsSchema>;

export async function getAdjustedPlan(data: AdjustmentData) {
  try {
    const validatedData = AdjustmentSchema.parse(data);
    const result = await adjustWorkoutPlan(validatedData as AdjustWorkoutPlanInput);

    revalidatePath("/plan");

    return {
      success: true,
      data: {
        exercisePlan: result.adjustedExercisePlan,
        dietPlan: result.adjustedDietPlan,
        macros: result.adjustedMacros,
        safetyAdvice: result.explanation,
      },
    };
  } catch (error) {
    console.error("Error adjusting plan:", error);
    if (error instanceof Error && error.message.includes("The model is not configured to output medias of type")) {
        return {
            success: false,
            error: "The AI model could not generate the plan in the required format. Please try modifying your feedback or try again.",
        };
    }
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
        // This is a temporary workaround for a known issue in the AI model.
        if (error instanceof Error && error.message.includes("The model is not configured to output medias of type")) {
             return {
                success: false,
                error: "The AI model could not generate the plan in the required format. This can sometimes happen with complex requests. Please try modifying your goals or try again in a moment.",
            };
        }
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function getHighlightsFromPdf(data: HighlightsData) {
    try {
        const validatedData = HighlightsSchema.parse(data);
        const result = await extractHighlights(validatedData as ExtractHighlightsInput);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Error extracting highlights:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return {
            success: false,
            error: errorMessage,
        };
    }
}
