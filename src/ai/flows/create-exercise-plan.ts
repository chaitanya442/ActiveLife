
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a personalized exercise plan.
 *
 * The flow takes user data as input, including an optional PDF document, uses an LLM to perform a risk assessment
 * and generate a personalized workout plan, and returns the plan along with safety advice.
 *
 * @exports {
 *   createExercisePlan,
 *   CreateExercisePlanInput,
 *   CreateExercisePlanOutput
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the createExercisePlan function
const CreateExercisePlanInputSchema = z.object({
  age: z.coerce.number().describe('The age of the user.'),
  sex: z.enum(['male', 'female', 'other']).describe('The sex of the user.'),
  height: z.coerce.number().describe('The height of the user in centimeters.'),
  weight: z.coerce.number().describe('The weight of the user in kilograms.'),
  medicalHistory: z.string().optional().describe('The medical history of the user.'),
  medicalPdf: z.string().optional().describe("An optional medical document in PDF format, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
  fitnessGoals: z.string().describe('The fitness goals of the user.'),
});
export type CreateExercisePlanInput = z.infer<typeof CreateExercisePlanInputSchema>;

// Define the structured output for a single day's exercise
const DailyExerciseSchema = z.object({
  day: z.string().describe('Day of the week (e.g., Monday, Tuesday).'),
  focus: z.string().describe('The main focus for the day (e.g., Chest & Triceps, Legs, Rest).'),
  exercises: z.array(z.object({
    name: z.string().describe('Name of the exercise.'),
    sets: z.string().describe('Number of sets (e.g., 3, 4).'),
    reps: z.string().describe('Number of repetitions per set (e.g., 8-12, 15).'),
  })).describe('A list of exercises for the day.'),
});


const MealNutritionSchema = z.object({
  calories: z.string().describe("Estimated calories for the meal."),
  protein: z.string().describe("Grams of protein for the meal."),
  carbs: z.string().describe("Grams of carbohydrates for the meal."),
  fat: z.string().describe("Grams of fat for the meal."),
});

// Define a more detailed diet plan schema
const DietPlanSchema = z.object({
    summary: z.string().describe("A general overview of the diet plan, including nutritional advice."),
    breakfast: z.object({
        suggestions: z.array(z.string()).describe("A list of healthy breakfast suggestions."),
        nutrition: MealNutritionSchema.describe("Nutritional targets for breakfast.")
    }),
    lunch: z.object({
        suggestions: z.array(z.string()).describe("A list of healthy lunch suggestions."),
        nutrition: MealNutritionSchema.describe("Nutritional targets for lunch.")
    }),
    dinner: z.object({
        suggestions: z.array(z.string()).describe("A list of healthy dinner suggestions."),
        nutrition: MealNutritionSchema.describe("Nutritional targets for dinner.")
    }),
    snacks: z.array(z.string()).describe("A list of healthy snack suggestions."),
});

// Define the structured output schema for the entire plan
const CreateExercisePlanOutputSchema = z.object({
  exercisePlan: z.array(DailyExerciseSchema).describe("A detailed, day-by-day exercise plan for one week, tailored to the user's data and goals. Ensure a full 7-day schedule, including rest days."),
  dietPlan: DietPlanSchema.describe("A structured diet plan with a summary and specific meal suggestions including nutritional breakdown per meal."),
  macros: z.object({
    carbs: z.number().describe("Percentage of daily calories from carbohydrates."),
    protein: z.number().describe("Percentage of daily calories from protein."),
    fat: z.number().describe("Percentage of daily calories from fat."),
  }).describe("The recommended macronutrient breakdown as percentages of total daily calories."),
  safetyAdvice: z.string().describe("A brief and small summary (a few lines) of the most important safety advice, contraindications, and recommendations based on the user's data."),
});
export type CreateExercisePlanOutput = z.infer<typeof CreateExercisePlanOutputSchema>;


// Define the exported function that calls the Genkit flow
export async function createExercisePlan(input: CreateExercisePlanInput): Promise<CreateExercisePlanOutput> {
  return createExercisePlanFlow(input);
}


// Define the prompt for the exercise plan creation
const createPlanPrompt = ai.definePrompt({
  name: 'createPlanPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: CreateExercisePlanInputSchema },
  output: { schema: CreateExercisePlanOutputSchema },
  prompt: `You are an expert fitness coach and medical advisor. Your task is to create a holistic fitness plan based on the user's data.

  User Data:
  - Age: {{{age}}}
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - Medical History: {{{medicalHistory}}}
  - Fitness Goals: {{{fitnessGoals}}}
  {{#if medicalPdf}}
  - Attached Medical Document: {{media url=medicalPdf}}
  {{/if}}

  Instructions:
  1.  **Risk Assessment**: First, analyze all provided data, including the user's medical history, age, other data, and the content of the attached medical document if provided.
  2.  **Generate Safety Advice**: Formulate a **brief and small summary (a few lines)** of the most critical safety advice and warnings based on a comprehensive review of all information. This is the most important step. If the user has significant health risks, the safety advice should be very prominent and clear but concise.
  3.  **Create Structured Exercise Plan**: Based on the user's goals and physical data, create a structured, day-by-day exercise plan for a full 7-day week. For each day, provide the focus (e.g., 'Upper Body', 'Cardio', 'Rest'), and a list of specific exercises with sets and reps. Format this as the 'exercisePlan' array in the output.
  4.  **Create Diet Plan & Macros**: Create a detailed, structured diet plan. Provide a general summary, and then lists of specific, healthy meal suggestions for breakfast, lunch, and dinner, along with snack ideas. For each of the main three meals (breakfast, lunch, dinner), provide a target nutritional breakdown (calories, protein, carbs, fat). Also, provide a recommended daily macronutrient breakdown (carbs, protein, fat) as percentages for the main 'macros' object. Ensure the percentages add up to 100.
  5.  **Return Output**: Respond with the generated structured exercise plan, the structured diet plan, the macronutrient breakdown, and the crucial safety advice in the specified JSON format.
  `,
});


// Define the Genkit flow for creating the exercise plan
const createExercisePlanFlow = ai.defineFlow(
  {
    name: 'createExercisePlanFlow',
    inputSchema: CreateExercisePlanInputSchema,
    outputSchema: CreateExercisePlanOutputSchema,
  },
  async (input) => {
    const { output } = await createPlanPrompt(input);
    return output!;
  }
);
