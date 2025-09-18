'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized exercise plans.
 *
 * The flow takes user's health data, risk assessment, and fitness goals as input
 * and outputs a personalized exercise plan.
 *
 * @param {PersonalizedExercisePlanInput} input - The input data for the flow.
 * @returns {Promise<PersonalizedExercisePlanOutput>} - A promise that resolves to the generated exercise plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PersonalizedExercisePlanInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  sex: z.string().describe('The sex of the user.'),
  height: z.number().describe('The height of the user in cm.'),
  weight: z.number().describe('The weight of the user in kg.'),
  medicalHistory: z.string().describe('The medical history of the user.'),
  riskAssessment: z.string().describe('The risk assessment of the user.'),
  fitnessGoals: z.string().describe('The fitness goals of the user.'),
});

export type PersonalizedExercisePlanInput = z.infer<
  typeof PersonalizedExercisePlanInputSchema
>;

// Define the output schema
const PersonalizedExercisePlanOutputSchema = z.object({
  exercisePlan: z.string().describe('The personalized exercise plan.'),
  safetyAdvice: z.string().describe('Personalized safety advice for the user.'),
});

export type PersonalizedExercisePlanOutput = z.infer<
  typeof PersonalizedExercisePlanOutputSchema
>;

// Define the flow
export async function generatePersonalizedExercisePlan(
  input: PersonalizedExercisePlanInput
): Promise<PersonalizedExercisePlanOutput> {
  return personalizedExercisePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedExercisePlanPrompt',
  input: {schema: PersonalizedExercisePlanInputSchema},
  output: {schema: PersonalizedExercisePlanOutputSchema},
  prompt: `You are an expert personal trainer.

  Based on the following information, generate a personalized exercise plan and provide safety advice.

  Age: {{{age}}}
  Sex: {{{sex}}}
  Height: {{{height}}} cm
  Weight: {{{weight}}} kg
  Medical History: {{{medicalHistory}}}
  Risk Assessment: {{{riskAssessment}}}
  Fitness Goals: {{{fitnessGoals}}}

  Exercise Plan:
  Safety Advice: `,
});

const personalizedExercisePlanFlow = ai.defineFlow(
  {
    name: 'personalizedExercisePlanFlow',
    inputSchema: PersonalizedExercisePlanInputSchema,
    outputSchema: PersonalizedExercisePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
