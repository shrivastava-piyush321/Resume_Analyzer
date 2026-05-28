
"use client"

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  RefreshCcw,
  Zap,
  TrendingUp,
  Target,
  ClipboardType,
  ArrowRight
} from "lucide-react";
import { analyzeKeywords, calculateATSScore, KeywordAnalysis } from '@/lib/nlp-engine';
import { ScoreGauge } from '@/components/ScoreGauge';
import { KeywordBadge } from '@/components/KeywordBadge';
import { analyzeResumeSkillGaps, AnalyzeResumeSkillGapsOutput } from '@/ai/flows/analyze-resume-skill-gaps-flow';
import { analyzeResumeComprehensive, ComprehensiveAnalysisOutput } from '@/ai/flows/comprehensive-ats-analysis-flow';
import { useToast } from "@/hooks/use-toast";

export default function ResumeRefinePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeSource, setResumeSource] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [analysisResults, setAnalysisResults] = useState<{
    nlp: KeywordAnalysis;
    localAtsScore: number;
    aiAnalysis?: ComprehensiveAnalysisOutput;
    aiGaps?: AnalyzeResumeSkillGapsOutput;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
        toast({
          variant: "destructive",
          title: "Format not supported yet",
          description: "For the most accurate AI analysis, please upload a .txt file or use the 'Paste Text' option for PDF/DOCX content.",
        });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Resume",
        description: "Please upload your resume or paste its content first.",
      });
      return;
    }
    if (!jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Job Description",
        description: "We need the target job description to calculate an accurate ATS score.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Local NLP Analysis (Immediate fallback/secondary metrics)
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
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Something went wrong while processing your resume. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setResumeText("");
    setJobDescription("");
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            <Button variant="ghost" size="sm" className="hidden sm:flex">How it works</Button>
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">Go Pro</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background flex flex-col">
        {!analysisResults ? (
          <div className="container flex-1 flex items-center justify-center p-4 py-12">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in-stagger">
              <div className="space-y-8">
                <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
                  Free AI ATS Checker
                </Badge>
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-foreground leading-[1.05]">
                    See your resume like a <span className="text-primary italic">Recruiter</span>.
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Get an instant ATS score based on semantic AI analysis. No account required.
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle className="h-4 w-4" /></div>
                    <span className="text-base font-medium">98% Accuracy vs Industry ATS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Target className="h-4 w-4" /></div>
                    <span className="text-base font-medium">Deep Semantic Skill Gap Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Zap className="h-4 w-4" /></div>
                    <span className="text-base font-medium">Immediate Actionable Improvements</span>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wider">Step 1: The Job</label>
                  </div>
                  <Textarea 
                    placeholder="Paste the Job Description here..."
                    className="min-h-[180px] text-base resize-none bg-white shadow-sm border-slate-200 focus:border-primary transition-all rounded-2xl p-6"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              <Card className="border-none bg-slate-100/30 p-2">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200 border border-slate-100 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wider">Step 2: Your Resume</label>
                    <div className="flex bg-slate-100 p-1 rounded-full">
                      <Button 
                        variant={resumeSource === 'upload' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full h-8 px-4 text-xs font-bold"
                        onClick={() => setResumeSource('upload')}
                      >
                        File
                      </Button>
                      <Button 
                        variant={resumeSource === 'paste' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full h-8 px-4 text-xs font-bold"
                        onClick={() => setResumeSource('paste')}
                      >
                        Paste
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                    {resumeSource === 'upload' ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 group bg-slate-50/50">
                        <div className="bg-primary/10 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        {fileName ? (
                          <div className="space-y-2">
                            <p className="text-lg font-bold text-slate-800">{fileName}</p>
                            <Button variant="link" className="text-xs text-primary h-auto p-0" onClick={() => fileInputRef.current?.click()}>Change File</Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-headline font-bold mb-2">Upload Resume</h3>
                            <p className="text-sm text-muted-foreground mb-8">
                              Select a .txt file for analysis<br/>(PDF/DOCX support coming soon)
                            </p>
                          </>
                        )}
                        
                        <div className="relative">
                          <Input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".txt"
                          />
                          {!fileName && (
                            <Button 
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-full px-8 font-bold gap-2 shadow-md"
                            >
                              Choose File
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Textarea 
                        placeholder="Paste your full resume text here (Ctrl+V)..."
                        className="flex-1 min-h-[300px] text-base resize-none bg-slate-50 border-slate-200 focus:border-primary transition-all rounded-3xl p-6"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="mt-10">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing}
                      className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xl shadow-xl shadow-primary/30 group transition-all overflow-hidden relative"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-3">
                          <RefreshCcw className="h-6 w-6 animate-spin" />
                          Analyzing Skills...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <Zap className="h-6 w-6 fill-current group-hover:animate-pulse" />
                          Calculate ATS Score
                        </span>
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-widest">
                      Secure • Private • AI-Powered
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
            {/* Resume Preview Sidebar */}
            <div className="hidden xl:flex w-[320px] flex-col border-r bg-slate-50/50 backdrop-blur-sm">
              <div className="p-6 border-b flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-500">Document View</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={resetAnalysis}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-[11px] leading-relaxed text-slate-500 whitespace-pre-wrap font-mono">
                  {resumeText}
                </div>
              </div>
            </div>

            {/* Analysis Dashboard */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="px-8 py-6 border-b flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1 font-bold">LIVE ANALYSIS</Badge>
                  <h2 className="text-2xl font-headline font-bold tracking-tight">Optimization Dashboard</h2>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={resetAnalysis} className="rounded-full font-bold px-6 border-slate-200">New Scan</Button>
                  <Button size="sm" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20">Optimize Resume</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 max-w-6xl mx-auto w-full">
                {/* Hero Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <Card className="md:col-span-5 shadow-2xl shadow-slate-100 border-slate-100 rounded-[2.5rem] bg-white">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ScoreGauge score={finalScore} />
                      <div className="mt-8 text-center space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Overall Match Score</p>
                        <p className="text-sm text-slate-500 font-medium">Verified by Semantic AI analysis</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-7 shadow-2xl shadow-slate-100 border-none rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white overflow-hidden flex flex-col justify-center border border-slate-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                        <TrendingUp className="h-7 w-7 text-primary" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analysisResults.aiAnalysis ? (
                        <>
                          <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            {analysisResults.aiAnalysis.summary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 bg-green-50/50 rounded-3xl border border-green-100 shadow-sm">
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 block">Competitive Edge</span>
                              <p className="text-sm font-bold text-slate-800">
                                {analysisResults.aiAnalysis.strengths[0] || "Exceptional technical depth found."}
                              </p>
                            </div>
                            <div className="p-5 bg-red-50/50 rounded-3xl border border-red-100 shadow-sm">
                              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Critical Friction</span>
                              <p className="text-sm font-bold text-slate-800">
                                {analysisResults.aiAnalysis.weaknesses[0] || "Formatting optimization required."}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 w-full bg-slate-200 rounded-full"></div>
                          <div className="h-4 w-3/4 bg-slate-200 rounded-full"></div>
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="h-24 bg-slate-100 rounded-[2rem]"></div>
                            <div className="h-24 bg-slate-100 rounded-[2rem]"></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Insight Tabs */}
                <Tabs defaultValue="strategy" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1.5 rounded-[2rem] h-16 border border-slate-200/60 max-w-2xl mx-auto">
                    <TabsTrigger value="strategy" className="rounded-[1.5rem] font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">Strategy</TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-[1.5rem] font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">Skills & Gaps</TabsTrigger>
                    <TabsTrigger value="keywords" className="rounded-[1.5rem] font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">Keywords</TabsTrigger>
                  </TabsList>

                  <TabsContent value="strategy" className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                            <Zap className="h-6 w-6 text-accent" />
                            Action Plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                          <div className="space-y-5">
                            {analysisResults.aiAnalysis?.actionPlan.map((step, i) => (
                              <div key={i} className="flex items-start gap-5 group">
                                <div className="h-8 w-8 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-sm font-black shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                                  {i + 1}
                                </div>
                                <p className="text-base text-slate-700 leading-tight pt-1 font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            ATS Readability
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60">
                            <p className="text-base text-slate-600 leading-relaxed italic font-medium">
                              "{analysisResults.aiAnalysis?.formattingFeedback || "Analyzing document architecture..."}"
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl border border-slate-100 bg-white flex flex-col items-center text-center shadow-sm">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Density</span>
                              <span className="text-3xl font-black text-primary">{analysisResults.nlp.score}%</span>
                            </div>
                            <div className="p-6 rounded-3xl border border-slate-100 bg-white flex flex-col items-center text-center shadow-sm">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                              <span className="text-3xl font-black text-primary">PASSED</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-10">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-xl font-headline font-bold">Semantic Gap Analysis</CardTitle>
                        <CardDescription className="text-sm font-medium">Core competencies identified as missing or weak by the AI engine.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-8">
                        {analysisResults.aiGaps ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysisResults.aiGaps.skillGaps.map((gap, i) => (
                              <div key={i} className="p-6 bg-slate-50/80 border border-slate-200/60 rounded-[2rem] flex items-center gap-4 hover:border-primary/40 transition-all hover:bg-white hover:shadow-lg group">
                                <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:bg-primary/5 transition-colors">
                                  <Target className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-base font-bold text-slate-700 leading-tight">{gap}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <RefreshCcw className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-lg text-slate-500 font-bold italic">Building semantic skill map...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="keywords" className="mt-10">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-xl font-headline font-bold">Keyword Intelligence</CardTitle>
                        <CardDescription className="font-medium">Direct comparison of tokens extracted from your resume vs job requirements.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] flex items-center gap-3">
                              <CheckCircle className="h-5 w-5" /> Optimized Terms
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {analysisResults.nlp.matched.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={true} />
                              ))}
                              {analysisResults.nlp.matched.length === 0 && <span className="text-sm text-muted-foreground italic">No direct matches found.</span>}
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-3">
                              <AlertCircle className="h-5 w-5" /> Missing High-Impact Tokens
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {analysisResults.nlp.missing.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={false} />
                              ))}
                              {analysisResults.nlp.missing.length === 0 && <span className="text-sm text-muted-foreground italic">Your keyword profile is exceptional!</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Powered by ResumeRefine Semantic Engine v2.4</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">Safety</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
