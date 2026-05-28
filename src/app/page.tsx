
"use client"

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Search, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Download,
  LayoutDashboard,
  Settings,
  ChevronRight,
  RefreshCcw,
  Zap
} from "lucide-react";
import { analyzeKeywords, calculateATSScore, KeywordAnalysis } from '@/lib/nlp-engine';
import { ScoreGauge } from '@/components/ScoreGauge';
import { KeywordBadge } from '@/components/KeywordBadge';
import { analyzeResumeSkillGaps, AnalyzeResumeSkillGapsOutput } from '@/ai/flows/analyze-resume-skill-gaps-flow';
import { generateResumeImprovementSuggestions, GenerateResumeImprovementSuggestionsOutput } from '@/ai/flows/generate-resume-improvement-suggestions-flow';

export default function ResumeRefinePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    nlp: KeywordAnalysis;
    atsScore: number;
    aiGaps?: AnalyzeResumeSkillGapsOutput;
    aiSuggestions?: GenerateResumeImprovementSuggestionsOutput;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;

    setIsAnalyzing(true);
    try {
      // 1. Local NLP Analysis (Immediate)
      const nlpResults = analyzeKeywords(resumeText, jobDescription);
      const score = calculateATSScore(resumeText, nlpResults);
      
      setAnalysisResults({
        nlp: nlpResults,
        atsScore: score
      });

      // 2. AI Analysis (Parallel)
      const [gaps, suggestions] = await Promise.all([
        analyzeResumeSkillGaps({ resumeText, jobDescriptionText: jobDescription }),
        generateResumeImprovementSuggestions({ resumeText, jobDescription })
      ]);

      setAnalysisResults(prev => ({
        ...prev!,
        aiGaps: gaps,
        aiSuggestions: suggestions
      }));
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setResumeText("");
    setJobDescription("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight">ResumeRefine</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">How it works</Button>
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">Upgrade to Pro</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background overflow-hidden flex flex-col">
        {!analysisResults ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in-stagger">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
                  Powered by Gemini 2.5
                </Badge>
                <h2 className="text-5xl font-headline font-bold tracking-tight text-foreground leading-[1.1]">
                  Land your dream job with <span className="text-primary">AI-driven</span> resume insights.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Upload your resume and the job description to get an instant ATS compatibility score, identify skill gaps, and receive actionable improvements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Paste Job Description</label>
                    <Textarea 
                      placeholder="Paste the job description here..."
                      className="min-h-[160px] resize-none bg-white shadow-sm border-muted focus:border-primary transition-all"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Card className="border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardContent className="pt-8 pb-10 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-4 rounded-full shadow-md mb-6">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-headline font-semibold mb-2">Upload your resume</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
                    Drag and drop your file here, or click to browse (supports PDF, DOCX, TXT)
                  </p>
                  
                  <div className="w-full max-w-sm px-6">
                    <div className="relative group">
                      <Input 
                        type="file" 
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt"
                      />
                      <Button className="w-full h-14 rounded-xl font-semibold gap-2">
                        {resumeText ? (
                          <>
                            <FileText className="h-5 w-5" />
                            Resume Uploaded
                          </>
                        ) : (
                          <>
                            <Search className="h-5 w-5" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                    {resumeText && (
                      <p className="mt-4 text-xs font-medium text-green-600 animate-pulse">
                        Successfully imported text from file!
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="link" 
                    className="mt-6 text-primary font-medium"
                    onClick={() => {
                      // Mock text for demo
                      setResumeText("Experienced software engineer with skills in React, TypeScript, and Node.js. 5 years of experience building web applications. Education: BS Computer Science.");
                    }}
                  >
                    Don't have a file? Paste text instead.
                  </Button>

                  <div className="mt-10 w-full px-6">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!resumeText || !jobDescription || isAnalyzing}
                      className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-lg shadow-xl shadow-accent/20"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5 fill-current" />
                          Check ATS Score
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Dashboard Layout */
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Resume Preview */}
            <div className="hidden lg:flex w-1/3 flex-col border-r bg-white">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-headline font-bold">Resume Text Preview</h3>
                </div>
                <Button variant="outline" size="icon" onClick={resetAnalysis}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 min-h-full font-body text-sm leading-relaxed whitespace-pre-wrap">
                  {resumeText}
                </div>
              </div>
            </div>

            {/* Right Panel - Analysis Results */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="p-6 border-b flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Analysis Complete</Badge>
                  <h2 className="text-xl font-headline font-bold">Optimization Dashboard</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export PDF
                  </Button>
                  <Button size="sm" onClick={resetAnalysis}>New Analysis</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1 shadow-sm border-none bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-headline">Compatibility</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-0">
                      <ScoreGauge score={analysisResults.atsScore} />
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 shadow-sm border-none bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Zap className="h-24 w-24 text-accent" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Executive Summary
                      </CardTitle>
                      <CardDescription>
                        Analysis of your resume against the target role requirements.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysisResults.aiSuggestions ? (
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4 py-1">
                          "{analysisResults.aiSuggestions.reasoning}"
                        </p>
                      ) : (
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="h-4 w-48 bg-slate-200 rounded"></div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <span className="text-xs text-green-600 font-bold block mb-1">MATCHED KEYWORDS</span>
                          <span className="text-2xl font-bold text-green-700">{analysisResults.nlp.matched.length}</span>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <span className="text-xs text-red-600 font-bold block mb-1">MISSING SKILLS</span>
                          <span className="text-2xl font-bold text-red-700">{analysisResults.nlp.missing.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs for Details */}
                <Tabs defaultValue="keywords" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white border h-12 p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="keywords" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Keywords</TabsTrigger>
                    <TabsTrigger value="gaps" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Skill Gaps</TabsTrigger>
                    <TabsTrigger value="suggestions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="keywords" className="mt-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">Keyword Matching</CardTitle>
                        <CardDescription>We've compared your resume text with the job description keywords.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Found in Resume
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.nlp.matched.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={true} />
                              ))}
                              {analysisResults.nlp.matched.length === 0 && <span className="text-xs text-muted-foreground italic">No matches found yet.</span>}
                            </div>
                          </div>
                          
                          <Separator />

                          <div>
                            <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" /> Missing from Resume
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.nlp.missing.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={false} />
                              ))}
                              {analysisResults.nlp.missing.length === 0 && <span className="text-xs text-muted-foreground italic">Amazing! All keywords match.</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="gaps" className="mt-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">AI Identified Skill Gaps</CardTitle>
                        <CardDescription>Deep semantic analysis of the job requirements vs your experience.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysisResults.aiGaps ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl border">
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" /> Core Skill Discrepancies
                                </h4>
                                <ul className="space-y-2">
                                  {analysisResults.aiGaps.skillGaps.map((gap, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                      {gap}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                  <Search className="h-4 w-4" /> Strategic Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {analysisResults.aiGaps.missingKeywords.slice(0, 10).map((kw, i) => (
                                    <Badge key={i} variant="outline" className="bg-white border-primary/20 text-primary">{kw}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Generating deep insights with AI...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="suggestions" className="mt-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">Resume Improvement Plan</CardTitle>
                        <CardDescription>Specific, actionable suggestions to boost your candidate ranking.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysisResults.aiSuggestions ? (
                          <div className="space-y-3">
                            {analysisResults.aiSuggestions.suggestions.map((suggestion, i) => (
                              <div key={i} className="group p-4 bg-white border rounded-xl hover:border-primary transition-colors relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 bg-primary/10 p-1.5 rounded-full text-primary">
                                    <Sparkles className="h-4 w-4" />
                                  </div>
                                  <p className="text-sm font-medium leading-relaxed text-slate-700">{suggestion}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Crafting recommendations...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2024 ResumeRefine AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Terms of Service</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
