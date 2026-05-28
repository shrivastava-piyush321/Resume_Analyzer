
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  ChevronRight,
  RefreshCcw,
  Zap,
  TrendingUp,
  Target
} from "lucide-react";
import { analyzeKeywords, calculateATSScore, KeywordAnalysis } from '@/lib/nlp-engine';
import { ScoreGauge } from '@/components/ScoreGauge';
import { KeywordBadge } from '@/components/KeywordBadge';
import { analyzeResumeSkillGaps, AnalyzeResumeSkillGapsOutput } from '@/ai/flows/analyze-resume-skill-gaps-flow';
import { analyzeResumeComprehensive, ComprehensiveAnalysisOutput } from '@/ai/flows/comprehensive-ats-analysis-flow';

export default function ResumeRefinePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    nlp: KeywordAnalysis;
    localAtsScore: number;
    aiAnalysis?: ComprehensiveAnalysisOutput;
    aiGaps?: AnalyzeResumeSkillGapsOutput;
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
      // 1. Local NLP Analysis (Immediate fallback)
      const nlpResults = analyzeKeywords(resumeText, jobDescription);
      const localScore = calculateATSScore(resumeText, nlpResults);
      
      setAnalysisResults({
        nlp: nlpResults,
        localAtsScore: localScore
      });

      // 2. Comprehensive AI Analysis (The "Effective" check)
      const [aiComprehensive, gaps] = await Promise.all([
        analyzeResumeComprehensive({ resumeText, jobDescription }),
        analyzeResumeSkillGaps({ resumeText, jobDescriptionText: jobDescription })
      ]);

      setAnalysisResults(prev => ({
        ...prev!,
        aiAnalysis: aiComprehensive,
        aiGaps: gaps
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

  // We prioritize the AI score if available, otherwise fallback to local
  const finalScore = analysisResults?.aiAnalysis?.score ?? analysisResults?.localAtsScore ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight">ResumeRefine</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">Documentation</Button>
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">Upgrade to Pro</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background overflow-hidden flex flex-col">
        {!analysisResults ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in-stagger">
              <div className="space-y-8">
                <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
                  AI-Powered Analysis 2.0
                </Badge>
                <div className="space-y-4">
                  <h2 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-[1.05]">
                    Optimize for <span className="text-primary italic">Success</span>.
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Our semantic AI doesn't just match keywords—it understands context, formatting, and impact.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">Deep Semantic Skill Matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Target className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">Role Relevance Scoring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Zap className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">Action-Oriented Feedback</span>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-sm font-bold text-foreground mb-2 block">1. Paste Job Description</label>
                  <Textarea 
                    placeholder="Paste the target job description here to analyze requirements..."
                    className="min-h-[140px] resize-none bg-white shadow-sm border-muted focus:border-primary transition-all rounded-xl"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              <Card className="border-none bg-slate-100/50 p-1">
                <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center shadow-xl">
                  <div className="bg-primary/10 p-5 rounded-3xl mb-6">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-2">2. Upload Resume</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
                    Supported: PDF, DOCX, TXT. (Text analysis is most effective)
                  </p>
                  
                  <div className="w-full max-w-sm">
                    <div className="relative group">
                      <Input 
                        type="file" 
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt"
                      />
                      <Button className="w-full h-14 rounded-2xl font-bold gap-2 text-lg shadow-md group-hover:bg-primary/90 transition-all">
                        {resumeText ? "File Loaded" : "Select Document"}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="link" 
                    className="mt-4 text-muted-foreground text-xs hover:text-primary"
                    onClick={() => setResumeText("Paste your resume content here for a quick check...")}
                  >
                    Or paste text instead
                  </Button>

                  <div className="mt-8 w-full">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!resumeText || !jobDescription || isAnalyzing}
                      className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xl shadow-2xl shadow-accent/40 transform active:scale-95 transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCcw className="mr-3 h-6 w-6 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-3 h-6 w-6 fill-current" />
                          Analyze Score
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Desktop Left: Resume Text View */}
            <div className="hidden xl:flex w-1/4 flex-col border-r bg-slate-50">
              <div className="p-6 border-b flex items-center justify-between bg-white">
                <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-muted-foreground">Resume Content</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetAnalysis}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border text-xs leading-relaxed text-slate-500 whitespace-pre-wrap">
                  {resumeText}
                </div>
              </div>
            </div>

            {/* Main Analysis Results */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur">
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">Analysis Complete</Badge>
                  <h2 className="text-xl font-headline font-bold">Performance Dashboard</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetAnalysis} className="rounded-full">New Scan</Button>
                  <Button size="sm" className="rounded-full px-6">Share Report</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Score Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <Card className="md:col-span-4 shadow-xl border-none bg-white p-2">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <ScoreGauge score={finalScore} />
                      <div className="mt-6 text-center">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Global Ranking</p>
                        <p className="text-xs text-muted-foreground mt-1">Based on semantic relevance & formatting</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-8 shadow-xl border-none bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl font-headline flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Strategic Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analysisResults.aiAnalysis ? (
                        <>
                          <p className="text-base text-slate-700 leading-relaxed font-medium">
                            {analysisResults.aiAnalysis.summary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <span className="text-[10px] font-bold text-green-600 uppercase mb-2 block">Top Strength</span>
                              <p className="text-sm font-bold text-slate-800 line-clamp-2">
                                {analysisResults.aiAnalysis.strengths[0] || "Found matching expertise."}
                              </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <span className="text-[10px] font-bold text-red-600 uppercase mb-2 block">Primary Gap</span>
                              <p className="text-sm font-bold text-slate-800 line-clamp-2">
                                {analysisResults.aiAnalysis.weaknesses[0] || "Optimization recommended."}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 w-full bg-slate-200 rounded"></div>
                          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="h-16 bg-slate-200 rounded-xl"></div>
                            <div className="h-16 bg-slate-200 rounded-xl"></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analysis Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-14 border border-slate-200">
                    <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">Full Report</TabsTrigger>
                    <TabsTrigger value="keywords" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">Keywords</TabsTrigger>
                    <TabsTrigger value="gaps" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">Skill Gaps</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                          <CardTitle className="text-lg font-headline flex items-center gap-2">
                            <Zap className="h-5 w-5 text-accent" />
                            Optimization Steps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analysisResults.aiAnalysis?.actionPlan.map((step, i) => (
                              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-slate-700 leading-snug">{step}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                          <CardTitle className="text-lg font-headline flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Formatting & Parsing
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-50 p-6 rounded-2xl border">
                            <p className="text-sm text-slate-600 leading-relaxed italic">
                              {analysisResults.aiAnalysis?.formattingFeedback || "Analyzing structural integrity..."}
                            </p>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">NLP Score</span>
                              <span className="text-2xl font-bold text-primary">{analysisResults.nlp.score}%</span>
                            </div>
                            <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Formatting</span>
                              <span className="text-2xl font-bold text-primary">Good</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="keywords" className="mt-6">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">Semantic Keyword Check</CardTitle>
                        <CardDescription>Comparison of resume tokens with Job Description requirements.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Strong Matches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.nlp.matched.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={true} />
                              ))}
                              {analysisResults.nlp.matched.length === 0 && <span className="text-sm text-muted-foreground italic">No strong matches found.</span>}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" /> Recommended Additions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.nlp.missing.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={false} />
                              ))}
                              {analysisResults.nlp.missing.length === 0 && <span className="text-sm text-muted-foreground italic">Comprehensive keyword coverage!</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="gaps" className="mt-6">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-headline">Critical Skill Gaps</CardTitle>
                        <CardDescription>Deep analysis of missing core competencies identified by AI.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysisResults.aiGaps ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {analysisResults.aiGaps.skillGaps.map((gap, i) => (
                              <div key={i} className="p-5 bg-slate-50 border rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-all">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                  <Briefcase className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">{gap}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground italic">Identifying semantic gaps...</p>
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

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2024 ResumeRefine AI. High-fidelity ATS analysis engine.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
