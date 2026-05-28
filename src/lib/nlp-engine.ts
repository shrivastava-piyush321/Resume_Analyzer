
export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  score: number;
}

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'from', 'with', 'have', 'been', 'which', 'when', 'where'
]);

/**
 * Smarter keyword extraction that preserves common technical symbols like +, #, and .
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Preserve common tech patterns (C++, Node.js, .NET, C#)
  const tokens = text.toLowerCase()
    .replace(/[^a-zA-Z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(token => {
      const clean = token.replace(/[.]$/, ''); // remove trailing dots
      return clean.length >= 2 && !COMMON_STOP_WORDS.has(clean);
    });

  // Frequency map
  const freqMap: Record<string, number> = {};
  tokens.forEach(token => {
    freqMap[token] = (freqMap[token] || 0) + 1;
  });

  // Sort by frequency and take top keywords
  return Object.entries(freqMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([word]) => word);
}

export function analyzeKeywords(resumeText: string, jobDescription: string): KeywordAnalysis {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeTextLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  jdKeywords.forEach(keyword => {
    // Exact match or word boundary check for better accuracy
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    if (regex.test(resumeTextLower) || resumeTextLower.includes(keyword)) {
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
  
  let score = analysis.score * 0.6; // 60% weight to keywords

  // Bonus for section headers (Formatting check)
  const sections = ['experience', 'education', 'skills', 'projects', 'summary', 'contact', 'profile', 'work history'];
  let sectionPoints = 0;
  sections.forEach(s => {
    if (resumeText.toLowerCase().includes(s)) sectionPoints += 5;
  });
  
  score += Math.min(sectionPoints, 25); // Max 25 points for formatting/sections

  // Impact words (Action verbs)
  const actionVerbs = ['developed', 'managed', 'led', 'achieved', 'implemented', 'created', 'designed', 'increased', 'reduced', 'spearheaded'];
  let impactPoints = 0;
  actionVerbs.forEach(v => {
    if (resumeText.toLowerCase().includes(v)) impactPoints += 2;
  });
  score += Math.min(impactPoints, 15);

  return Math.min(Math.round(score), 100);
}
