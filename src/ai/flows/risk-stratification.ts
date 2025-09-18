
'use server';

/**
 * @fileOverview Analyzes user's medical history to assess risk factors.
 *
 * - riskStratification - A function that handles the risk stratification process.
 * - RiskStratificationInput - The input type for the riskStratification function.
 * - RiskStratificationOutput - The return type for the riskStratification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskStratificationInputSchema = z.object({
  medicalHistory: z
    .string()
    .describe("User's self-reported medical history."),
  age: z.number().describe('The age of the user.'),
  sex: z.string().describe('The sex of the user.'),
  height: z.number().describe('The height of the user in cm.'),
  weight: z.number().describe('The weight of the user in kg.'),
});
export type RiskStratificationInput = z.infer<typeof RiskStratificationInputSchema>;

const RiskStratificationOutputSchema = z.object({
  riskAssessment: z.string().describe('A detailed risk assessment based on the medical history.'),
  contraindications: z.string().describe('Any contraindications for exercise based on the medical history.'),
});
export type RiskStratificationOutput = z.infer<typeof RiskStratificationOutputSchema>;

export async function riskStratification(input: RiskStratificationInput): Promise<RiskStratificationOutput> {
  return riskStratificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskStratificationPrompt',
  input: {schema: RiskStratificationInputSchema},
  output: {schema: RiskStratificationOutputSchema},
  prompt: `You are a medical expert specializing in risk stratification for exercise plans.

  Analyze the user's self-reported medical history and other data to assess their risk factors and identify any contraindications for exercise.

  User's Medical History: {{{medicalHistory}}}

  Consider the following information:
  - Age: {{{age}}}
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg

  Provide a detailed risk assessment and list any contraindications for exercise. If the medical history is empty or not provided, state that the assessment is based only on the user-provided data and that a medical consultation is recommended.`,
});

const riskStratificationFlow = ai.defineFlow(
  {
    name: 'riskStratificationFlow',
    inputSchema: RiskStratificationInputSchema,
    outputSchema: RiskStratificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
