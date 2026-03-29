'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PredictionResult } from '@/types';
import ConfidenceBar from './ConfidenceBar';
import SeverityBar from './SeverityBar';
import ImageMaskCanvas from './ImageMaskCanvas';
import { CheckCircle, Wrench } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopographicMap from './TopographicMap';
import InteractiveXRayCanvas from './InteractiveXRayCanvas';

interface PredictionResultCardProps {
  result: PredictionResult;
  imagePreview: string;
  threshold?: number;
}

export default function PredictionResultCard({
  result,
  imagePreview,
  threshold = 0.5,
}: PredictionResultCardProps) {
  return (
    <div className="space-y-4">
      {/* main results card */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              Analysis Complete
            </span>
          </div>

          {/* material type section */}
          <div className="p-4 rounded-lg bg-secondary/40 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 border border-accent/20">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Detected Material
                </p>
                <p className="text-2xl font-bold text-foreground capitalize tracking-tight">
                  {result.material}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ConfidenceBar confidence={result.confidence} />
            <SeverityBar severity={result.severity} />
          </div>
        </CardContent>
      </Card>

      {/* showing the x-ray canvas */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <Tabs defaultValue="2d" className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-medium text-foreground/80">Analysis Visualization</h3>
              <TabsList className="bg-secondary/50 w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger value="2d" className="text-xs">2D X-Ray Overlay</TabsTrigger>
                <TabsTrigger value="3d" className="text-xs focus:outline-none">3D Topographic</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="2d" className="mt-0 outline-none">
              {result.rawMask ? (
                <InteractiveXRayCanvas
                  imageUrl={result.preprocessedImage}
                  rawMaskUrl={result.rawMask}
                  threshold={threshold}
                />
              ) : (
                <ImageMaskCanvas
                  imageUrl={result.preprocessedImage}
                  maskUrl={result.binary}
                  heatmapUrl={result.mask}
                  severity={result.severity}
                  threshold={threshold}
                />
              )}
              <p className="text-[11px] text-muted-foreground/60 mt-3 pl-1">
                Real-time interactive X-Ray view. Drag the Detection Threshold slider to explore structural degradation instantly.
              </p>
            </TabsContent>
            
            <TabsContent value="3d" className="mt-0 outline-none">
              <TopographicMap surfaceData={result.surfaceData || []} height={400} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
