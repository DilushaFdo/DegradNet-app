"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageMaskCanvasProps {
  imageUrl: string;
  maskUrl: string;
  heatmapUrl: string;
  severity: number;
  threshold?: number;
}

export default function ImageMaskCanvas({
  maskUrl,
  heatmapUrl,
  severity,
  threshold,
}: ImageMaskCanvasProps) {
  const detectedArea = (severity * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="mask" className="w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Visual Analysis
          </h3>
          <TabsList className="bg-secondary border border-border/50 h-9">
            <TabsTrigger
              value="mask"
              className="text-xs px-3 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              Mask
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="text-xs px-3 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              Heatmap
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-3">
          <p className="text-sm font-mono text-foreground text-center mb-3">
            Detected Area:{" "}
            <span className="font-bold text-primary">{detectedArea}%</span>
            {threshold !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">
                (threshold: {threshold.toFixed(2)})
              </span>
            )}
          </p>

          <TabsContent value="mask" className="mt-0">
            <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black/20">
              <img
                src={maskUrl}
                alt="Degradation mask"
                className="w-full h-auto"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-2">
              AI-predicted degradation mask — white = defect, black = clean
            </p>
          </TabsContent>

          <TabsContent value="heatmap" className="mt-0">
            <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black/20">
              <img
                src={heatmapUrl}
                alt="Degradation heatmap"
                className="w-full h-auto"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-2">
              AI-predicted degradation heatmap — red = high, blue = low
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
