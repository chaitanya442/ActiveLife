
'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting key highlights and structured data from a medical PDF.
 *
 * The flow takes a PDF document as input, uses an LLM to identify and summarize important medical information,
 * and extracts specific data points (age, sex, height, weight) to return them in a structured format.
 *
 * @exports {
 *   extractHighlights,
 *   ExtractHighlightsInput,
 *   ExtractHighlightsOutput
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the extractHighlights function
const ExtractHighlightsInputSchema = z.object({
  medicalPdf: z.string().describe("A medical document in PDF format, as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type ExtractHighlightsInput = z.infer<typeof ExtractHighlightsInputSchema>;

// Define the output schema for the extractHighlights function
const ExtractHighlightsOutputSchema = z.object({
  highlights: z.string().describe("A summary of the key highlights from the medical document, focusing on risks, conditions, and important medical data."),
  age: z.number().optional().describe('The age of the person if found in the document.'),
  sex: z.enum(['male', 'female', 'other']).optional().describe('The sex of the person if found in the document.'),
  height: z.number().optional().describe('The height of the person in centimeters if found in the document.'),
  weight: z.number().optional().describe('The weight of the person in kilograms if found in the document.'),
});
export type ExtractHighlightsOutput = z.infer<typeof ExtractHighlightsOutputSchema>;


// Define the exported function that calls the Genkit flow
export async function extractHighlights(input: ExtractHighlightsInput): Promise<ExtractHighlightsOutput> {
  return extractHighlightsFlow(input);
}


// Define the prompt for the highlight extraction
const extractHighlightsPrompt = ai.definePrompt({
  name: 'extractHighlightsPrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: { schema: ExtractHighlightsInputSchema },
  output: { schema: ExtractHighlightsOutputSchema },
  prompt: `You are a medical assistant. Your task is to analyze the provided medical document and extract the most critical highlights and specific patient data.

  Attached Medical Document: {{media url=medicalPdf}}

  Instructions:
  1.  **Extract Specific Data**: Carefully read the document and identify the following patient data points: age, sex, height (in cm), and weight (in kg). If a value is present, populate the corresponding field in the output. If not, leave it empty.
  2.  **Summarize Highlights**: Identify key information such as diagnosed conditions, reported allergies, recent lab results, prescribed medications, and any specific warnings or advice from medical professionals. Summarize these points into a concise list of highlights for the 'highlights' field.
  3.  **Return Output**: Respond with both the extracted data and the summary. If the document is empty or contains no relevant medical information, state that in the 'highlights' field and leave data fields empty.
  `,
});


// Define the Genkit flow for extracting highlights
const extractHighlightsFlow = ai.defineFlow(
  {
    name: 'extractHighlightsFlow',
    inputSchema: ExtractHighlightsInputSchema,
    outputSchema: ExtractHighlightsOutputSchema,
  },
  async (input) => {
    const { output } = await extractHighlightsPrompt(input);
    return output!;
  }
);

