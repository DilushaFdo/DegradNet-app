'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import PredictionResultCard from '@/components/PredictionResultCard';
import { predictImage, getMockPrediction } from '@/lib/api';
import { PredictionResult } from '@/types';
import { Brain, Loader2, RefreshCw, Activity, Scan, ChevronDown, ShieldCheck, Zap, Layers, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
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

      {/* ─── Top Navigation Bar ─── */}
      <nav className="sticky top-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              DegradNet
            </span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              v1.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'dashboard' ? 'text-foreground bg-secondary font-medium' : 'hover:text-foreground hover:bg-secondary/50'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'about' ? 'text-foreground bg-secondary font-medium' : 'hover:text-foreground hover:bg-secondary/50'}`}
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
              <span className="hidden sm:inline">System Online</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="container mx-auto max-w-7xl px-4 py-6 lg:py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ─── Left Panel: Upload & Controls ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Scan className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
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
                          className="block text-sm font-medium text-muted-foreground"
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
                            className="text-sm font-medium text-muted-foreground"
                          >
                            Detection Threshold
                          </label>
                          <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
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
                          className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(217_91%_60%/0.4)]"
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
                          className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing…
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4 mr-2" />
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

            {/* ─── Right Panel: Results ─── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Results
                </h2>
              </div>

              {result && imagePreview ? (
                <PredictionResultCard result={result} imagePreview={imagePreview} threshold={threshold} />
              ) : (
                <Card className="flex items-center justify-center min-h-[400px] lg:min-h-[500px] border-border/50 border-dashed">
                  <CardContent className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 border border-border/50 mb-5">
                      <Brain className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-medium text-foreground/70 mb-2">
                      No Results Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Upload an infrastructure image and run analysis to see AI-powered degradation detection results.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 py-4">
            {/* About Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
                <Info className="w-3 h-3" />
                About DegradNet
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                AI-Powered Infrastructure Analysis
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                DegradNet is a cutting-edge computer vision system designed to automate the detection and analysis of degradation in critical infrastructure components.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Scan className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Advanced Segmentation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our proprietary U-Net architecture provides pixel-level segmentation masks, accurately identifying the extent of cracks, corrosion, and wear.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Severity Assessment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Beyond simple detection, the system calculates a severity index (0-100%) to help prioritize maintenance and repair efforts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Layers className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Multi-Material Support</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Optimized models for diverse materials including Concrete, Metal, and Wood, ensuring tailored analysis for each infrastructure type.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interactive Visualization</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tech Stack</h2>
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
                  <div key={tech.name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-medium">
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

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30 mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/60">
            DegradNet v1.0 — AI Infrastructure Analysis
          </p>
          <p className="text-xs text-muted-foreground/40">
            Powered by Deep Learning &amp; Computer Vision
          </p>
        </div>
      </footer>

      {/* ─── Low Confidence Dialog ─── */}
      <AlertDialog open={showLowConfidenceDialog} onOpenChange={setShowLowConfidenceDialog}>
        <AlertDialogContent className="border-amber-500/20 bg-background">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-xl">Low Confidence Detected</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              The AI is only <span className="font-bold text-foreground">{(lowConfidenceData?.confidence ? lowConfidenceData.confidence * 100 : 0).toFixed(0)}%</span> confident that the material is <span className="font-bold text-foreground">{lowConfidenceData?.material}</span>.
              <br /><br />
              To ensure the most accurate analysis, please <span className="text-primary font-medium">manually select the material type</span> from the dropdown menu if the detection is incorrect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowLowConfidenceDialog(false)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
