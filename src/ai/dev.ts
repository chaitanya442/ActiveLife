
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/dynamic-workout-adjustment.ts';
import '@/ai/flows/create-exercise-plan.ts';
import '@/ai/flows/extract-highlights-from-pdf.ts';

