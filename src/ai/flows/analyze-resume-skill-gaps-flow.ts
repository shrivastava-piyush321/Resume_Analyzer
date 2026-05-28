'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing resume skill gaps.
 *
 * - analyzeResumeSkillGaps - A function that analyzes a resume against a job description to identify missing keywords and skill gaps.
 * - AnalyzeResumeSkillGapsInput - The input type for the analyzeResumeSkillGaps function.
 * - AnalyzeResumeSkillGapsOutput - The return type for the analyzeResumeSkillGaps function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeResumeSkillGapsInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the user\'s resume.'),
  jobDescriptionText: z.string().describe('The full text content of the job description.'),
});
export type AnalyzeResumeSkillGapsInput = z.infer<typeof AnalyzeResumeSkillGapsInputSchema>;

const AnalyzeResumeSkillGapsOutputSchema = z.object({
  missingKeywords: z.array(z.string()).describe('A list of important keywords from the job description that are missing from the resume.'),
  skillGaps: z.array(z.string()).describe('A list of specific skill gaps identified by comparing the resume to the job description.'),
  matchedKeywords: z.array(z.string()).describe('A list of keywords from the job description that were found in the resume.'),
});
export type AnalyzeResumeSkillGapsOutput = z.infer<typeof AnalyzeResumeSkillGapsOutputSchema>;

export async function analyzeResumeSkillGaps(input: AnalyzeResumeSkillGapsInput): Promise<AnalyzeResumeSkillGapsOutput> {
  return analyzeResumeSkillGapsFlow(input);
}

const analyzeResumeSkillGapsPrompt = ai.definePrompt({
  name: 'analyzeResumeSkillGapsPrompt',
  input: { schema: AnalyzeResumeSkillGapsInputSchema },
  output: { schema: AnalyzeResumeSkillGapsOutputSchema },
  prompt: `You are an expert resume analyst. Your task is to compare a candidate's resume against a specific job description and identify key areas of alignment and discrepancy.

First, extract important keywords from the provided job description that a strong candidate should possess. Then, compare these keywords and the overall skill requirements with the provided resume.

Identify:
1.  Keywords from the job description that are present in the resume.
2.  Keywords from the job description that are missing from the resume.
3.  Specific skill gaps based on the overall requirements in the job description that are not adequately covered in the resume.

Resume:
{{resumeText}}

Job Description:
{{jobDescriptionText}}`,
});

const analyzeResumeSkillGapsFlow = ai.defineFlow(
  {
    name: 'analyzeResumeSkillGapsFlow',
    inputSchema: AnalyzeResumeSkillGapsInputSchema,
    outputSchema: AnalyzeResumeSkillGapsOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeResumeSkillGapsPrompt(input);
    return output!;
  }
);
