'use server';

/**
 * @fileOverview Analyzes user's medical history PDF to assess risk factors.
 *
 * - riskStratification - A function that handles the risk stratification process.
 * - RiskStratificationInput - The input type for the riskStratification function.
 * - RiskStratificationOutput - The return type for the riskStratification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs/promises';

const RiskStratificationInputSchema = z.object({
  medicalHistoryPdfDataUri: z
    .string()
    .describe(
      "User's medical history as a PDF data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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

const extractMedicalDataTool = ai.defineTool({
  name: 'extractMedicalData',
  description: 'Extracts medical history data from a PDF file.',
  inputSchema: z.object({
    pdfDataUri: z.string().describe("PDF data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // Simulate extracting text from PDF.
  const base64String = input.pdfDataUri.split(',')[1];
  const pdfBuffer = Buffer.from(base64String, 'base64');

  // In a real implementation, use a library like PDF.js to extract text.
  const text = pdfBuffer.toString('utf-8');
  return `Extracted medical data from PDF: ${text}`;
});

const prompt = ai.definePrompt({
  name: 'riskStratificationPrompt',
  input: {schema: RiskStratificationInputSchema},
  output: {schema: RiskStratificationOutputSchema},
  tools: [extractMedicalDataTool],
  prompt: `You are a medical expert specializing in risk stratification for exercise plans.

  Analyze the user's medical history and other provided data to assess their risk factors and identify any contraindications for exercise.

  First, use the extractMedicalData tool to extract the medical history from the PDF.

  Then, consider the following information:
  - Age: {{{age}}}
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg

  Provide a detailed risk assessment and list any contraindications for exercise.

  Medical History: {{#tool_use 'extractMedicalData' pdfDataUri=medicalHistoryPdfDataUri}}{{result}}{{/tool_use}}`,
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
