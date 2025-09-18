
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
  age: z.number().describe('The age of the user.'),
  sex: z.enum(['male', 'female', 'other']).describe('The sex of the user.'),
  height: z.number().describe('The height of the user in centimeters.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  medicalHistory: z.string().optional().describe('The medical history of the user.'),
  medicalPdf: z.string().optional().describe("An optional medical document in PDF format, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
  fitnessGoals: z.string().describe('The fitness goals of the user.'),
});
export type CreateExercisePlanInput = z.infer<typeof CreateExercisePlanInputSchema>;

// Define the output schema for the createExercisePlan function
const CreateExercisePlanOutputSchema = z.object({
  exercisePlan: z.string().describe("A detailed, week-by-week exercise plan tailored to the user's data and goals. Include warm-ups and cool-downs."),
  safetyAdvice: z.string().describe("Important safety advice, contraindications, and recommendations based on the user's data and the generated plan."),
});
export type CreateExercisePlanOutput = z.infer<typeof CreateExercisePlanOutputSchema>;


// Define the exported function that calls the Genkit flow
export async function createExercisePlan(input: CreateExercisePlanInput): Promise<CreateExercisePlanOutput> {
  return createExercisePlanFlow(input);
}


// Define the prompt for the exercise plan creation
const createPlanPrompt = ai.definePrompt({
  name: 'createPlanPrompt',
  input: { schema: CreateExercisePlanInputSchema },
  output: { schema: CreateExercisePlanOutputSchema },
  prompt: `You are an expert fitness coach and medical advisor. Your task is to create a personalized fitness plan based on the user's data.

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
  1.  **Risk Assessment**: First, analyze all provided data, including the user's medical history, age, other data, and the content of the attached medical document if provided. Formulate critical safety advice and warnings based on a comprehensive review of all information. This is the most important step. If the user has significant health risks (identified from any source), the safety advice should be very prominent and clear.
  2.  **Create Exercise Plan**: Based on the user's goals and physical data, create a detailed, week-by-week exercise plan. The plan should be structured, easy to follow, and include specific exercises, sets, reps, and rest periods. Include a warm-up and cool-down routine.
  3.  **Return Output**: Respond with the generated exercise plan and the crucial safety advice in the specified JSON format. The 'safetyAdvice' field should contain all contraindications and safety warnings.
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
