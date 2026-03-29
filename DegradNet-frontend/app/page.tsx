'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import PredictionResultCard from '@/components/PredictionResultCard';
import { predictImage, getMockPrediction } from '@/lib/api';
import { PredictionResult } from '@/types';
import { HardHat, Loader2, RefreshCw, Construction, Ruler, ChevronDown, ShieldAlert, Hammer, Warehouse, Drill, CheckCircle2, AlertTriangle, BrickWall } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [materialOverride, setMaterialOverride] = useState<string>('auto');
  const [threshold, setThreshold] = useState<number>(0.5);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'about'>('dashboard');
  const [showLowConfidenceDialog, setShowLowConfidenceDialog] = useState(false);
  const [lowConfidenceData, setLowConfidenceData] = useState<{material: string, confidence: number} | null>(null);

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedFile(file);
    setImagePreview(preview);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);

    const response = await predictImage(selectedFile, materialOverride, threshold);

    if (response.success && response.data) {
      console.log(`[Analyze] U-Net model used: '${response.data.material}' (confidence: ${(response.data.confidence * 100).toFixed(1)}%)`);
      setResult(response.data);
      
      if (response.data.confidence < 0.85 && materialOverride === 'auto') {
        setLowConfidenceData({
          material: response.data.material,
          confidence: response.data.confidence
        });
        setShowLowConfidenceDialog(true);
      } else {
        toast.success('Analysis complete', {
          description: `Detected ${response.data.material} with ${(response.data.confidence * 100).toFixed(0)}% confidence`,
        });
      }
    } else {
      const mockResponse = getMockPrediction();
      if (mockResponse.success && mockResponse.data) {
        setResult(mockResponse.data);
        toast.warning('Using mock data', {
          description: 'Backend API not available',
        });
      } else {
        toast.error('Analysis failed', {
          description: response.error || 'Failed to get prediction',
        });
      }
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview('');
    setResult(null);
    setMaterialOverride('auto');
    setThreshold(0.5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster theme="dark" position="top-right" richColors />

      {/* ─── Caution Stripe Top Bar ─── */}
      <div className="caution-stripe h-1.5" />

      {/* ─── Top Navigation Bar ─── */}
      <nav className="sticky top-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/30">
              <HardHat className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              DegradNet
            </span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/50">
              v1.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${activeTab === 'dashboard' ? 'text-primary bg-primary/10 border border-primary/20' : 'hover:text-foreground hover:bg-secondary/50'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${activeTab === 'about' ? 'text-primary bg-primary/10 border border-primary/20' : 'hover:text-foreground hover:bg-secondary/50'}`}
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">System Operational</span>
            </div>
          </div>
        </div>
      </nav>

      {/* main layout container */}
      <main className="container mx-auto max-w-7xl px-4 py-6 lg:py-8">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* top dashboard banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 p-6 md:p-8 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                    Infrastructure Diagnostics Layer
                  </h2>
                  <p className="text-sm text-foreground/60 max-w-xl">
                    Upload structural imagery for immediate AI-powered defect detection. The system is calibrated for high-precision architectural analysis.
                  </p>
                </div>
                
                <div className="hidden md:flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border/50 min-w-[200px]">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-xs font-mono text-primary font-bold">Supported Materials :</span>
                    <span className="text-foreground/50" > Concrete | Metal | Wood</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* left side: upload box and settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                  Input
                </h2>
              </div>

              <Card className="border-border/50">
                <CardContent className="p-5">
                  {!imagePreview ? (
                    <ImageUploader
                      onImageSelect={handleImageSelect}
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="space-y-5">
                      {/* Image Preview */}
                      <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black/20">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto"
                        />
                      </div>

                      {/* Material Type */}
                      <div className="space-y-2">
                        <label
                          htmlFor="material-override"
                          className="block text-sm font-semibold text-muted-foreground"
                        >
                          Material Type
                        </label>
                        <div className="relative">
                          <select
                            id="material-override"
                            value={materialOverride}
                            onChange={(e) => setMaterialOverride(e.target.value)}
                            disabled={isLoading}
                            className="w-full appearance-none rounded-lg border border-border bg-secondary/50 px-4 py-2.5 pr-10 text-sm text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <option value="auto">Auto Detect</option>
                            <option value="concrete">Concrete</option>
                            <option value="metal">Metal</option>
                            <option value="wood">Wood</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Threshold Slider */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="threshold-slider"
                            className="text-sm font-semibold text-muted-foreground"
                          >
                            Detection Threshold
                          </label>
                          <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                            {threshold.toFixed(2)}
                          </span>
                        </div>
                        <input
                          id="threshold-slider"
                          type="range"
                          min="0.05"
                          max="0.95"
                          step="0.05"
                          value={threshold}
                          onChange={(e) => setThreshold(parseFloat(e.target.value))}
                          disabled={isLoading}
                          className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(36_95%_50%/0.4)]"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground/60">
                          <span>Sensitive</span>
                          <span>Conservative</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={handlePredict}
                          disabled={isLoading}
                          className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing…
                            </>
                          ) : (
                            <>
                              <Hammer className="w-4 h-4 mr-2" />
                              Run Analysis
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="lg"
                          disabled={isLoading}
                          className="h-11 border-border hover:bg-secondary"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* right side: results */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Construction className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                  Results
                </h2>
              </div>

              {result && imagePreview ? (
                <PredictionResultCard result={result} imagePreview={imagePreview} threshold={threshold} />
              ) : (
                <Card className="relative flex items-center justify-center min-h-[400px] lg:min-h-[500px] border-border/50 border-dashed overflow-hidden group bg-secondary/10">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000 pointer-events-none">
                    <img src="/hero-art.png" alt="" className="w-full h-full object-cover grayscale" />
                    {/* Scanning line animation */}
                    <div className="absolute left-0 right-0 h-1 bg-primary/40 shadow-[0_0_15px_rgba(255,165,0,0.5)] animate-scan" />
                  </div>
                  <CardContent className="relative z-10 text-center py-12 pointer-events-none">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-background/80 border border-primary/30 mb-6 shadow-xl shadow-primary/5 backdrop-blur-sm relative">
                      <div className="absolute inset-0 rounded-2xl border border-primary/50 animate-ping opacity-20" />
                      <Construction className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-foreground tracking-tight">
                         System Awaiting Telemetry
                       </h3>
                       <p className="text-sm text-foreground/60 max-w-xs mx-auto leading-relaxed">
                         The diagnostic canvas is primed. Upload infrastructure scan data to initiate AI breakdown and severity generation.
                       </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-16 py-8">
            {/* About Header Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-2 shadow-sm shadow-primary/5">
                <Construction className="w-4 h-4" />
                Engineering Excellence
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                AI-Powered <span className="text-primary drop-shadow-[0_0_15px_rgba(255,165,0,0.3)]">Infrastructure</span> Analysis.
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto">
                DegradNet is a cutting-edge computer vision system designed to automate the detection and analysis of degradation in critical infrastructure components, ensuring safety and precision.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <BrickWall className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Advanced Segmentation</h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      Our proprietary U-Net architecture provides pixel-level segmentation masks, accurately identifying the extent of cracks, corrosion, and wear.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Severity Assessment</h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      Beyond simple detection, the system calculates a severity index (0-100%) to help prioritize maintenance and repair efforts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm hover:border-sky-500/30 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <Warehouse className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Multi-Material Support</h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      Optimized models for diverse materials including Concrete, Metal, and Wood, ensuring tailored analysis for each infrastructure type.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Drill className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">Interactive Visualization</h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      Dynamic canvas overlays and adjustable detection thresholds allow technical users to explore results with maximum precision.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tech Stack Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50"></div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tech Stack</h2>
                <div className="h-px flex-1 bg-border/50"></div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: 'Next.js 13', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { name: 'React 18', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { name: 'Tailwind CSS', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { name: 'FastAPI Backend', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { name: 'PyTorch ML', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { name: 'Lucide Icons', icon: <CheckCircle2 className="w-4 h-4" /> },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-semibold hover:border-primary/30 transition-colors">
                    <span className="text-primary">{tech.icon}</span>
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Version Info */}
            <div className="pt-8 text-center text-xs text-muted-foreground">
              Built as a comprehensive demonstration for AI-powered structural health monitoring.
            </div>
          </div>
        )}
      </main>

      {/* bottom footer */}
      <footer className="mt-12">
        <div className="caution-stripe h-1" />
        <div className="border-t border-border/30">
          <div className="container mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground/60">
              DegradNet v1.0 — Structural Health Platform
            </p>
            <p className="text-xs text-muted-foreground/40">
              Powered by Deep Learning &amp; Computer Vision
            </p>
          </div>
        </div>
      </footer>

      {/* ─── Low Confidence Dialog ─── */}
      <AlertDialog open={showLowConfidenceDialog} onOpenChange={setShowLowConfidenceDialog}>
        <AlertDialogContent className="border-yellow-500/20 bg-background">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">Low Confidence Detected</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              The AI is only <span className="font-bold text-foreground">{(lowConfidenceData?.confidence ? lowConfidenceData.confidence * 100 : 0).toFixed(0)}%</span> confident that the material is <span className="font-bold text-foreground">{lowConfidenceData?.material}</span>.
              <br /><br />
              To ensure the most accurate analysis, please <span className="text-primary font-semibold">manually select the material type</span> from the dropdown menu if the detection is incorrect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowLowConfidenceDialog(false)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
            >
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
