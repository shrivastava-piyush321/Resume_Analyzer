'use server';
/**
 * @fileOverview A Genkit flow for generating specific, reasoned suggestions to improve a resume based on a job description.
 *
 * - generateResumeImprovementSuggestions - A function that handles the resume improvement suggestion generation process.
 * - GenerateResumeImprovementSuggestionsInput - The input type for the generateResumeImprovementSuggestions function.
 * - GenerateResumeImprovementSuggestionsOutput - The return type for the generateResumeImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeImprovementSuggestionsInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  jobDescription: z.string().describe('The full text content of the job description.'),
});
export type GenerateResumeImprovementSuggestionsInput = z.infer<typeof GenerateResumeImprovementSuggestionsInputSchema>;

const GenerateResumeImprovementSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of specific, actionable suggestions to improve the resume.'),
  reasoning: z.string().describe('A brief explanation of the overall reasoning behind the suggestions.'),
});
export type GenerateResumeImprovementSuggestionsOutput = z.infer<typeof GenerateResumeImprovementSuggestionsOutputSchema>;

export async function generateResumeImprovementSuggestions(
  input: GenerateResumeImprovementSuggestionsInput
): Promise<GenerateResumeImprovementSuggestionsOutput> {
  return generateResumeImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeImprovementSuggestionsPrompt',
  input: {schema: GenerateResumeImprovementSuggestionsInputSchema},
  output: {schema: GenerateResumeImprovementSuggestionsOutputSchema},
  prompt: `You are an expert career coach and resume optimization specialist.

Your task is to provide specific, reasoned suggestions for improving a resume based on a given job description. Focus on optimizing the resume content to better align with the job requirements.

Consider areas such as:
- Revising bullet points to be more action-oriented and quantifiable.
- Adding or rephrasing experience highlights that directly match keywords or responsibilities in the job description.
- Identifying skill gaps and suggesting how to incorporate relevant skills if applicable.
- Ensuring the language used in the resume resonates with the job description's tone.

Provide an array of distinct suggestions and a concise reasoning for your overall approach.

Resume Text:
{{resumeText}}

Job Description:
{{jobDescription}}
`,
});

const generateResumeImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateResumeImprovementSuggestionsFlow',
    inputSchema: GenerateResumeImprovementSuggestionsInputSchema,
    outputSchema: GenerateResumeImprovementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
