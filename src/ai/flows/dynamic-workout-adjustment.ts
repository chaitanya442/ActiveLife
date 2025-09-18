
'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamically adjusting workout and diet plans based on user feedback.
 *
 * The flow takes user feedback and the current plans as input, uses an LLM to determine necessary adjustments,
 * and returns the adjusted plans with an explanation.
 *
 * @exports {
 *   adjustWorkoutPlan,
 *   AdjustWorkoutPlanInput,
 *   AdjustWorkoutPlanOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyExerciseSchema = z.object({
  day: z.string().describe('Day of the week (e.g., Monday, Tuesday).'),
  focus: z.string().describe('The main focus for the day (e.g., Chest & Triceps, Legs, Rest).'),
  exercises: z.array(z.object({
    name: z.string().describe('Name of the exercise.'),
    sets: z.string().describe('Number of sets (e.g., 3, 4).'),
    reps: z.string().describe('Number of repetitions per set (e.g., 8-12, 15).'),
  })).describe('A list of exercises for the day.'),
});

const DietPlanSchema = z.object({
    summary: z.string().describe("A general overview of the diet plan, including nutritional advice."),
    breakfast: z.array(z.string()).describe("A list of healthy breakfast suggestions."),
    lunch: z.array(z.string()).describe("A list of healthy lunch suggestions."),
    dinner: z.array(z.string()).describe("A list of healthy dinner suggestions."),
    snacks: z.array(z.string()).describe("A list of healthy snack suggestions."),
});


// Define the input schema for the adjustWorkoutPlan function
const AdjustWorkoutPlanInputSchema = z.object({
  exercisePlan: z.array(DailyExerciseSchema).describe('The current structured workout plan.'),
  dietPlan: DietPlanSchema.describe('The current diet plan text.'),
  macros: z.object({
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
  }).describe('The current macronutrient breakdown.'),
  userFeedback: z.string().describe('User feedback on the workout and diet plan (e.g., too easy, too hard, time constraints, food preferences).'),
  performanceData: z.string().describe('Data on user performance (e.g., exercises completed, sets, reps, weight used).'),
  fitnessGoals: z.string().describe('User defined fitness goals.'),
});
export type AdjustWorkoutPlanInput = z.infer<typeof AdjustWorkoutPlanInputSchema>;


const AdjustWorkoutPlanOutputSchema = z.object({
    adjustedExercisePlan: z.array(DailyExerciseSchema).describe("The adjusted, day-by-day exercise plan for one week."),
    adjustedDietPlan: DietPlanSchema.describe("The adjusted general overview of the diet plan."),
    adjustedMacros: z.object({
        carbs: z.number().describe("The adjusted percentage of daily calories from carbohydrates."),
        protein: z.number().describe("The adjusted percentage of daily calories from protein."),
        fat: z.number().describe("The adjusted percentage of daily calories from fat."),
    }).describe("The adjusted macronutrient breakdown."),
    explanation: z.string().describe('Explanation of the adjustments made to both the workout and diet plans.'),
});
export type AdjustWorkoutPlanOutput = z.infer<typeof AdjustWorkoutPlanOutputSchema>;


// Define the adjustWorkoutPlan function
export async function adjustWorkoutPlan(input: AdjustWorkoutPlanInput): Promise<AdjustWorkoutPlanOutput> {
  return adjustWorkoutPlanFlow(input);
}


// Define the prompt for workout plan adjustment
const adjustWorkoutPlanPrompt = ai.definePrompt({
  name: 'adjustWorkoutPlanPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: AdjustWorkoutPlanInputSchema},
  output: {schema: AdjustWorkoutPlanOutputSchema},
  prompt: `You are a personal trainer and nutritionist who adjusts workout and diet plans based on user feedback and performance.

  Current Exercise Plan:
  \`\`\`json
  {{{jsonStringify exercisePlan}}}
  \`\`\`
  Current Diet Plan: 
  \`\`\`json
  {{{jsonStringify dietPlan}}}
  \`\`\`
  Current Macros: Carbs: {{{macros.carbs}}}%, Protein: {{{macros.protein}}}%, Fat: {{{macros.fat}}}%
  
  User Feedback: {{{userFeedback}}}
  Performance Data: {{{performanceData}}}
  Fitness Goals: {{{fitnessGoals}}}

  Based on the user feedback, performance data, and fitness goals, adjust the exercise plan, diet plan, and macronutrient breakdown.
  - For the exercise plan, consider intensity, volume, exercise selection, and rest periods. Return a full 7-day structured plan.
  - For the diet plan, consider caloric intake, macronutrient distribution, and food preferences mentioned in the feedback. Return a structured diet plan with a summary and meal suggestions.
  - For the macros, ensure the new percentages add up to 100.

  Ensure that the adjusted plans are safe, effective, and still aligned with the user's primary fitness goals.

  Return the adjusted structured exercise plan, the adjusted structured diet plan, the adjusted macros, and a clear explanation of the changes you made.
  `, 
});

// Define the Genkit flow for adjusting the workout plan
const adjustWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'adjustWorkoutPlanFlow',
    inputSchema: AdjustWorkoutPlanInputSchema,
    outputSchema: AdjustWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await adjustWorkoutPlanPrompt(input);
    return output!;
  }
);
