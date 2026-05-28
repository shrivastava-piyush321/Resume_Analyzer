
'use server';
/**
 * @fileOverview A Genkit flow for comprehensive ATS analysis including semantic scoring.
 *
 * - analyzeResumeComprehensive - Analyzes resume against JD for a deep, semantic ATS score.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComprehensiveAnalysisInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  jobDescription: z.string().describe('The full text content of the job description.'),
});
export type ComprehensiveAnalysisInput = z.infer<typeof ComprehensiveAnalysisInputSchema>;

const ComprehensiveAnalysisOutputSchema = z.object({
  score: z.number().describe('A score from 0-100 representing overall compatibility.'),
  summary: z.string().describe('A high-level summary of the candidate\'s fit.'),
  strengths: z.array(z.string()).describe('Key strengths found in the resume relative to the JD.'),
  weaknesses: z.array(z.string()).describe('Critical gaps or weaknesses found.'),
  formattingFeedback: z.string().describe('Feedback on resume formatting and ATS readability.'),
  actionPlan: z.array(z.string()).describe('Immediate steps the user should take to improve the score.'),
});
export type ComprehensiveAnalysisOutput = z.infer<typeof ComprehensiveAnalysisOutputSchema>;

export async function analyzeResumeComprehensive(input: ComprehensiveAnalysisInput): Promise<ComprehensiveAnalysisOutput> {
  return analyzeResumeComprehensiveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeComprehensivePrompt',
  input: { schema: ComprehensiveAnalysisInputSchema },
  output: { schema: ComprehensiveAnalysisOutputSchema },
  prompt: `You are a sophisticated Applicant Tracking System (ATS) and Senior Technical Recruiter.
Your goal is to perform a deep semantic analysis of the provided resume against the job description.

Do not just count keywords. Evaluate:
1. Role Relevance: How well does the experience level and past roles align with the JD?
2. Skill Density: Are core requirements mentioned with enough context/impact?
3. Formatting: Is the resume structured logically for an ATS to parse (e.g., standard section headers)?
4. Impact: Does the candidate use quantifiable metrics or action-oriented language?

Provide a realistic "ATS Compatibility Score" (0-100). 
- 80-100: Excellent fit, likely to get an interview.
- 60-79: Good fit, but missing key elements or poorly presented.
- 40-59: Fair fit, needs significant optimization.
- 0-39: Poor fit or completely wrong role.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}`,
});

const analyzeResumeComprehensiveFlow = ai.defineFlow(
  {
    name: 'analyzeResumeComprehensiveFlow',
    inputSchema: ComprehensiveAnalysisInputSchema,
    outputSchema: ComprehensiveAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
