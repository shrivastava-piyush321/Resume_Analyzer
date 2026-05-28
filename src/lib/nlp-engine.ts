
export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  score: number;
}

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
]);

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Basic tokenization
  const tokens = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 3 && !COMMON_STOP_WORDS.has(token));

  // Frequency map
  const freqMap: Record<string, number> = {};
  tokens.forEach(token => {
    freqMap[token] = (freqMap[token] || 0) + 1;
  });

  // Sort by frequency and take top keywords
  return Object.entries(freqMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 25)
    .map(([word]) => word);
}

export function analyzeKeywords(resumeText: string, jobDescription: string): KeywordAnalysis {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeTextLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  jdKeywords.forEach(keyword => {
    if (resumeTextLower.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const score = jdKeywords.length > 0 
    ? Math.round((matched.length / jdKeywords.length) * 100) 
    : 0;

  return { matched, missing, score };
}

export function calculateATSScore(resumeText: string, analysis: KeywordAnalysis): number {
  if (!resumeText) return 0;
  
  let score = analysis.score * 0.7; // 70% weight to keywords

  // Bonus for section headers
  const sections = ['experience', 'education', 'skills', 'projects', 'summary', 'contact'];
  let sectionPoints = 0;
  sections.forEach(s => {
    if (resumeText.toLowerCase().includes(s)) sectionPoints += 5;
  });
  
  score += Math.min(sectionPoints, 30); // Max 30 points for sections

  return Math.min(Math.round(score), 100);
}
