'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamically adjusting workout plans based on user feedback and performance.
 *
 * The flow takes user feedback and performance data as input, uses an LLM to determine necessary adjustments
 * to the workout plan's intensity and duration, and returns the adjusted workout plan.
 *
 * @exports {
 *   adjustWorkoutPlan,
 *   AdjustWorkoutPlanInput,
 *   AdjustWorkoutPlanOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the adjustWorkoutPlan function
const AdjustWorkoutPlanInputSchema = z.object({
  workoutPlan: z.string().describe('The current workout plan in a string format.'),
  userFeedback: z.string().describe('User feedback on the workout plan (e.g., too easy, too hard, time constraints).'),
  performanceData: z.string().describe('Data on user performance (e.g., exercises completed, sets, reps, weight used).'),
  fitnessGoals: z.string().describe('User defined fitness goals.'),
});
export type AdjustWorkoutPlanInput = z.infer<typeof AdjustWorkoutPlanInputSchema>;

// Define the output schema for the adjustWorkoutPlan function
const AdjustWorkoutPlanOutputSchema = z.object({
  adjustedWorkoutPlan: z.string().describe('The adjusted workout plan based on user feedback and performance data.'),
  explanation: z.string().describe('Explanation of the adjustments made to the workout plan.'),
});
export type AdjustWorkoutPlanOutput = z.infer<typeof AdjustWorkoutPlanOutputSchema>;

// Define the adjustWorkoutPlan function
export async function adjustWorkoutPlan(input: AdjustWorkoutPlanInput): Promise<AdjustWorkoutPlanOutput> {
  return adjustWorkoutPlanFlow(input);
}

// Define the prompt for workout plan adjustment
const adjustWorkoutPlanPrompt = ai.definePrompt({
  name: 'adjustWorkoutPlanPrompt',
  input: {schema: AdjustWorkoutPlanInputSchema},
  output: {schema: AdjustWorkoutPlanOutputSchema},
  prompt: `You are a personal trainer who adjusts workout plans based on user feedback and performance.

  Current Workout Plan: {{{workoutPlan}}}
  User Feedback: {{{userFeedback}}}
  Performance Data: {{{performanceData}}}
  Fitness Goals: {{{fitnessGoals}}}

  Based on the user feedback, performance data, and fitness goals, adjust the workout plan. Explain the adjustments made.

  Ensure that the adjusted workout plan is safe and effective for the user.

  Return the adjusted workout plan and a clear explanation of the changes you made to accommodate the user's feedback and performance while still aligning with their fitness goals.
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
