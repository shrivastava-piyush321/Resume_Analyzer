
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
  ArrowRight,
  FileSearch,
  Layers,
  Award
} from "lucide-react";
import { analyzeKeywords, calculateATSScore, KeywordAnalysis } from '@/lib/nlp-engine';
import { ScoreGauge } from '@/components/ScoreGauge';
import { KeywordBadge } from '@/components/KeywordBadge';
import { analyzeResumeSkillGaps, AnalyzeResumeSkillGapsOutput } from '@/ai/flows/analyze-resume-skill-gaps-flow';
import { analyzeResumeComprehensive, ComprehensiveAnalysisOutput } from '@/ai/flows/comprehensive-ats-analysis-flow';
import { useToast } from "@/hooks/use-toast";
import { parseFileAction } from '@/app/actions/parse-file';

export default function ResumeRefinePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsParsing(true);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await parseFileAction(formData);
        if (result.error) {
          toast({
            variant: "destructive",
            title: "File Error",
            description: result.error,
          });
          setFileName(null);
        } else {
          setResumeText(result.text);
          toast({
            title: "File Processed",
            description: `${file.name} successfully analyzed.`,
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Parsing Failed",
          description: "Could not extract text from the document.",
        });
        setFileName(null);
      } finally {
        setIsParsing(false);
      }
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
      const nlpResults = analyzeKeywords(resumeText, jobDescription);
      const localScore = calculateATSScore(resumeText, nlpResults);
      
      setAnalysisResults({
        nlp: nlpResults,
        localAtsScore: localScore
      });

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
    <div className="flex flex-col min-h-screen gradient-bg">
      <header className="sticky top-0 z-50 w-full glass-morphism border-b">
        <div className="container flex h-16 items-center justify-between px-6 mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-headline font-black text-primary tracking-tighter">ResumeRefine</h1>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" className="hidden sm:flex font-bold hover:text-primary">Features</Button>
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 px-6 font-bold">Go Pro</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!analysisResults ? (
          <div className="container flex-1 flex items-center justify-center p-6 py-16 mx-auto">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-in-stagger">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge variant="secondary" className="px-4 py-1.5 font-black text-primary bg-primary/10 border-primary/20 rounded-full animate-pulse">
                    V3.0 AI ENGINE ACTIVE
                  </Badge>
                  <h2 className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-foreground leading-[0.95]">
                    Optimize your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Career Path</span>.
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                    Upload your PDF, Word, or text file to get a deep semantic ATS analysis powered by Gemini 2.5 Flash.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20 shadow-sm">
                    <div className="bg-green-500/10 p-3 rounded-xl text-green-600 shadow-inner"><CheckCircle className="h-6 w-6" /></div>
                    <span className="text-base font-bold text-slate-700 leading-tight">High-Accuracy <br/>Parsing</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20 shadow-sm">
                    <div className="bg-accent/10 p-3 rounded-xl text-accent shadow-inner"><Zap className="h-6 w-6" /></div>
                    <span className="text-base font-bold text-slate-700 leading-tight">Instant AI <br/>Feedback</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-black text-primary uppercase tracking-[0.2em]">01. Target Role Requirement</label>
                  </div>
                  <Textarea 
                    placeholder="Paste the Job Description here to analyze compatibility..."
                    className="min-h-[200px] text-lg resize-none bg-white/80 glass-morphism shadow-2xl shadow-slate-200 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl p-8 transition-all"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              <Card className="border-none bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-[3.5rem] shadow-2xl shadow-primary/5">
                <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200 border border-white h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  
                  <div className="flex items-center justify-between mb-10">
                    <label className="text-xs font-black text-primary uppercase tracking-[0.2em]">02. Your Resume</label>
                    <div className="flex bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                      <Button 
                        variant={resumeSource === 'upload' ? 'default' : 'ghost'} 
                        size="sm" 
                        className={`rounded-full h-9 px-6 text-xs font-black transition-all ${resumeSource === 'upload' ? 'bg-primary shadow-lg shadow-primary/30' : ''}`}
                        onClick={() => setResumeSource('upload')}
                      >
                        DOCUMENT
                      </Button>
                      <Button 
                        variant={resumeSource === 'paste' ? 'default' : 'ghost'} 
                        size="sm" 
                        className={`rounded-full h-9 px-6 text-xs font-black transition-all ${resumeSource === 'paste' ? 'bg-primary shadow-lg shadow-primary/30' : ''}`}
                        onClick={() => setResumeSource('paste')}
                      >
                        PASTE TEXT
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-h-[340px]">
                    {resumeSource === 'upload' ? (
                      <div 
                        className={`border-3 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center transition-all group cursor-pointer relative ${isParsing ? 'border-primary/50 bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50/50 hover:bg-white'}`}
                        onClick={() => !isParsing && fileInputRef.current?.click()}
                      >
                        {isParsing ? (
                          <div className="space-y-6">
                            <div className="relative">
                              <RefreshCcw className="h-16 w-16 text-primary animate-spin" />
                              <FileSearch className="h-8 w-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div>
                              <p className="text-xl font-black text-primary">Reading Document...</p>
                              <p className="text-sm text-muted-foreground font-medium">Extracting data for AI analysis</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-7 rounded-[2rem] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                              <Upload className="h-12 w-12 text-primary" />
                            </div>
                            {fileName ? (
                              <div className="space-y-3">
                                <p className="text-2xl font-black text-slate-800 tracking-tight">{fileName}</p>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">READY FOR SCAN</Badge>
                                <Button variant="link" className="text-xs text-primary font-bold h-auto p-0 pt-2">Change Document</Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-2xl font-headline font-black mb-3 text-slate-800">Drop Resume Here</h3>
                                <p className="text-base text-muted-foreground font-medium mb-10 max-w-xs mx-auto">
                                  Supports PDF, DOCX, and TXT <br/> (Maximum accuracy)
                                </p>
                                <Button 
                                  className="rounded-full px-10 h-14 bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white font-black text-sm shadow-xl shadow-primary/10 transition-all active:scale-95"
                                >
                                  CHOOSE FILE
                                </Button>
                              </>
                            )}
                          </>
                        )}
                        <Input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        />
                      </div>
                    ) : (
                      <Textarea 
                        placeholder="Paste your resume text here for instant parsing..."
                        className="flex-1 min-h-[340px] text-lg resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-primary rounded-[2.5rem] p-10 transition-all shadow-inner"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="mt-12">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || isParsing}
                      className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-black text-2xl shadow-2xl shadow-primary/30 group transition-all relative overflow-hidden active:scale-[0.98]"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-4">
                          <RefreshCcw className="h-8 w-8 animate-spin" />
                          RUNNING NEURAL SCAN...
                        </span>
                      ) : (
                        <span className="flex items-center gap-4">
                          <Award className="h-8 w-8 group-hover:rotate-12 transition-transform" />
                          GET ATS REPORT
                        </span>
                      )}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 transform skew-x-[-20deg]"></div>
                    </Button>
                    <div className="flex items-center justify-center gap-6 mt-6 opacity-60">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemini 2.5 Flash</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">100% Privacy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
            {/* Resume Preview Sidebar */}
            <div className="hidden xl:flex w-[380px] flex-col border-r glass-morphism">
              <div className="p-8 border-b flex items-center justify-between bg-white/60">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <h3 className="font-headline font-black text-sm uppercase tracking-widest text-slate-600">Document Map</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-slate-200" onClick={resetAnalysis}>
                  <RefreshCcw className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-xs leading-relaxed text-slate-500 whitespace-pre-wrap font-mono relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
                  {resumeText}
                </div>
              </div>
            </div>

            {/* Analysis Dashboard */}
            <div className="flex-1 flex flex-col bg-white/40 overflow-y-auto">
              <div className="px-10 py-8 border-b flex items-center justify-between glass-morphism sticky top-0 z-20">
                <div className="flex items-center gap-6">
                  <div className="flex h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 items-center justify-center shadow-lg shadow-green-500/20 text-white font-black italic">AI</div>
                  <div>
                    <h2 className="text-3xl font-headline font-black tracking-tighter">AI Precision Report</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Model: Gemini Pro-Vision ATS v3.4</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" onClick={resetAnalysis} className="rounded-2xl font-black px-8 border-slate-200 h-14 hover:bg-slate-50">NEW ANALYSIS</Button>
                  <Button size="lg" className="rounded-2xl px-10 font-black shadow-2xl shadow-primary/30 h-14 bg-primary hover:bg-primary/90 text-white">UPGRADE REPORT</Button>
                </div>
              </div>

              <div className="p-10 space-y-12 max-w-7xl mx-auto w-full">
                {/* Hero Score Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <Card className="lg:col-span-5 shadow-2xl shadow-primary/5 border-white rounded-[3.5rem] bg-white overflow-hidden card-vibrant">
                    <CardContent className="flex flex-col items-center justify-center py-16 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
                      <ScoreGauge score={finalScore} />
                      <div className="mt-12 text-center space-y-3">
                        <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black rounded-full text-[10px] tracking-[0.2em] uppercase">Verified AI Score</Badge>
                        <p className="text-base text-slate-500 font-bold max-w-xs">Your resume is {finalScore}% compatible with the target role requirements.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-7 shadow-2xl shadow-primary/5 border-none rounded-[3.5rem] bg-gradient-to-br from-slate-50 to-white overflow-hidden flex flex-col justify-center border border-white card-vibrant">
                    <CardHeader className="pb-4 px-10 pt-10">
                      <CardTitle className="text-3xl font-headline font-black flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        Strategic Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 px-10 pb-10">
                      {analysisResults.aiAnalysis ? (
                        <>
                          <p className="text-xl text-slate-700 leading-relaxed font-bold tracking-tight">
                            {analysisResults.aiAnalysis.summary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-green-50/70 rounded-[2.5rem] border border-green-100 shadow-sm transition-all hover:bg-green-100/50">
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 block">Primary Strength</span>
                              <p className="text-base font-black text-slate-800 leading-tight">
                                {analysisResults.aiAnalysis.strengths[0] || "Highly relevant technical experience."}
                              </p>
                            </div>
                            <div className="p-8 bg-pink-50/70 rounded-[2.5rem] border border-pink-100 shadow-sm transition-all hover:bg-pink-100/50">
                              <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 block">Optimization Gap</span>
                              <p className="text-base font-black text-slate-800 leading-tight">
                                {analysisResults.aiAnalysis.weaknesses[0] || "Formatting could be improved for ATS."}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6 animate-pulse">
                          <div className="h-6 w-full bg-slate-200 rounded-full"></div>
                          <div className="h-6 w-3/4 bg-slate-200 rounded-full"></div>
                          <div className="grid grid-cols-2 gap-6 pt-6">
                            <div className="h-32 bg-slate-100 rounded-[2.5rem]"></div>
                            <div className="h-32 bg-slate-100 rounded-[2.5rem]"></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Insight Tabs */}
                <Tabs defaultValue="strategy" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur p-2 rounded-[2.5rem] h-20 border border-white shadow-xl shadow-slate-200/50 max-w-2xl mx-auto">
                    <TabsTrigger value="strategy" className="rounded-[1.8rem] font-black text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all">STRATEGY</TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-[1.8rem] font-black text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all">SKILLS MAP</TabsTrigger>
                    <TabsTrigger value="keywords" className="rounded-[1.8rem] font-black text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all">TOKEN ANALYSIS</TabsTrigger>
                  </TabsList>

                  <TabsContent value="strategy" className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Card className="rounded-[3rem] border-white shadow-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-8">
                          <CardTitle className="text-2xl font-headline font-black flex items-center gap-4 text-accent">
                            <Zap className="h-7 w-7" />
                            Optimization Plan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                          <div className="space-y-8">
                            {analysisResults.aiAnalysis?.actionPlan.map((step, i) => (
                              <div key={i} className="flex items-start gap-6 group">
                                <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-sm font-black shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm">
                                  {i + 1}
                                </div>
                                <p className="text-lg text-slate-700 leading-tight pt-1.5 font-bold tracking-tight">{step}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-[3rem] border-white shadow-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-8">
                          <CardTitle className="text-2xl font-headline font-black flex items-center gap-4 text-primary">
                            <FileText className="h-7 w-7" />
                            Format Integrity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                          <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                            <p className="text-lg text-slate-600 leading-relaxed italic font-bold">
                              "{analysisResults.aiAnalysis?.formattingFeedback || "Analyzing document architecture..."}"
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex flex-col items-center text-center shadow-lg shadow-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Token Density</span>
                              <span className="text-4xl font-black text-primary">{analysisResults.nlp.score}%</span>
                            </div>
                            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex flex-col items-center text-center shadow-lg shadow-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Structure</span>
                              <span className="text-3xl font-black text-green-500">HEALTHY</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-12">
                    <Card className="rounded-[3.5rem] border-white shadow-2xl bg-white overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b p-10">
                        <CardTitle className="text-2xl font-headline font-black">Semantic Gap Analysis</CardTitle>
                        <CardDescription className="text-base font-bold text-slate-500">Neural identification of missing high-impact competencies.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-10">
                        {analysisResults.aiGaps ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analysisResults.aiGaps.skillGaps.map((gap, i) => (
                              <div key={i} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] flex items-center gap-6 hover:border-primary/40 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-1 group">
                                <div className="bg-white p-4 rounded-2xl shadow-lg group-hover:bg-primary/5 transition-colors border border-slate-100">
                                  <Target className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-lg font-black text-slate-700 leading-tight">{gap}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-24 flex flex-col items-center justify-center space-y-6">
                            <RefreshCcw className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-xl text-slate-500 font-black italic">Mapping neural skill patterns...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="keywords" className="mt-12">
                    <Card className="rounded-[3.5rem] border-white shadow-2xl bg-white overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b p-10">
                        <CardTitle className="text-2xl font-headline font-black">Token Intelligence</CardTitle>
                        <CardDescription className="text-base font-bold text-slate-500">Direct comparison of extracted linguistic tokens vs requirements.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                          <div className="space-y-8">
                            <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.3em] flex items-center gap-4">
                              <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-6 w-6" /></div>
                              Aligned Tokens
                            </h4>
                            <div className="flex flex-wrap gap-4">
                              {analysisResults.nlp.matched.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={true} />
                              ))}
                              {analysisResults.nlp.matched.length === 0 && <span className="text-lg text-muted-foreground font-bold italic">No direct matches identified.</span>}
                            </div>
                          </div>
                          <div className="space-y-8">
                            <h4 className="text-xs font-black text-accent uppercase tracking-[0.3em] flex items-center gap-4">
                              <div className="p-2 bg-pink-50 rounded-lg"><AlertCircle className="h-6 w-6" /></div>
                              Missing Critical Tokens
                            </h4>
                            <div className="flex flex-wrap gap-4">
                              {analysisResults.nlp.missing.map(kw => (
                                <KeywordBadge key={kw} keyword={kw} matched={false} />
                              ))}
                              {analysisResults.nlp.missing.length === 0 && <span className="text-lg text-muted-foreground font-bold italic">Linguistic profile fully aligned!</span>}
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

      <footer className="glass-morphism border-t py-12 mt-auto">
        <div className="container mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-headline font-black text-primary tracking-tighter">ResumeRefine</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI-Powered Career Intelligence Engine v3.4.1</p>
          </div>
          <div className="flex items-center gap-12">
            <a href="#" className="text-xs font-black text-slate-500 hover:text-primary transition-colors tracking-widest uppercase">Privacy</a>
            <a href="#" className="text-xs font-black text-slate-500 hover:text-primary transition-colors tracking-widest uppercase">Security</a>
            <a href="#" className="text-xs font-black text-slate-500 hover:text-primary transition-colors tracking-widest uppercase">API Docs</a>
          </div>
          <p className="text-xs font-bold text-slate-400">© 2024 ResumeRefine AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
