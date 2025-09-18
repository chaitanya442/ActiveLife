'use server';

/**
 * @fileOverview Extracts user data from a medical history PDF.
 *
 * - extractUserDataFromPdf - A function that handles the data extraction process.
 * - ExtractUserDataInput - The input type for the extractUserDataFromPdf function.
 * - ExtractUserDataOutput - The return type for the extractUserDataFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractUserDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "User's medical history as a PDF data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractUserDataInput = z.infer<typeof ExtractUserDataInputSchema>;

const ExtractUserDataOutputSchema = z.object({
    age: z.number().optional().describe('The age of the user.'),
    sex: z.enum(['male', 'female', 'other']).optional().describe('The sex of the user.'),
    height: z.number().optional().describe('The height of the user in cm.'),
    weight: z.number().optional().describe('The weight of the user in kg.'),
}).describe("Extracted user data. Fields should be omitted if not found in the document.");
export type ExtractUserDataOutput = z.infer<typeof ExtractUserDataOutputSchema>;


export async function extractUserDataFromPdf(input: ExtractUserDataInput): Promise<ExtractUserDataOutput> {
  return extractUserDataFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractUserDataPrompt',
  input: {schema: ExtractUserDataInputSchema},
  output: {schema: ExtractUserDataOutputSchema},
  prompt: `You are an expert at extracting structured information from documents.

  Analyze the user's medical history from the provided PDF document and extract the following fields if they are present: age, sex, height, and weight.

  Medical History PDF: {{media url=pdfDataUri}}
  
  If a value for a field cannot be found, omit the field entirely from the output. Do not guess or make up values.`,
});

const extractUserDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractUserDataFromPdfFlow',
    inputSchema: ExtractUserDataInputSchema,
    outputSchema: ExtractUserDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
