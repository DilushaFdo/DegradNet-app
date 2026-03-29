'use client';

import { useEffect, useRef, useState } from 'react';
import { infernoLUT } from '@/lib/inferno';
import { Loader2 } from 'lucide-react';

interface InteractiveXRayCanvasProps {
  imageUrl: string;
  rawMaskUrl?: string; // If undefined, fallback gracefully
  threshold: number;
}

export default function InteractiveXRayCanvas({
  imageUrl,
  rawMaskUrl,
  threshold,
}: InteractiveXRayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  // keep the image pixel data here so we don't have to load it again
  const origDataRef = useRef<Uint8ClampedArray | null>(null);
  const maskDataRef = useRef<Uint8ClampedArray | null>(null);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  // step 1: load images and grab the pixel arrays
  useEffect(() => {
    if (!imageUrl || !rawMaskUrl) return;
    setIsProcessing(true);

    const origImg = new Image();
    const maskImg = new Image();
    
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        // got both images, now extract pixels
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const w = origImg.width;
        const h = origImg.height;
        cvs.width = w;
        cvs.height = h;
        widthRef.current = w;
        heightRef.current = h;

        // Extract original RGB
        ctx.drawImage(origImg, 0, 0, w, h);
        origDataRef.current = ctx.getImageData(0, 0, w, h).data;

        // Extract mask pixels
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(maskImg, 0, 0, w, h);
        maskDataRef.current = ctx.getImageData(0, 0, w, h).data;
        
        setIsProcessing(false);
      }
    };

    origImg.crossOrigin = 'anonymous';
    maskImg.crossOrigin = 'anonymous';
    origImg.onload = onLoad;
    maskImg.onload = onLoad;
    
    origImg.src = imageUrl;
    maskImg.src = rawMaskUrl;
  }, [imageUrl, rawMaskUrl]);

  // step 2: mix pixels and apply heatmap color if it passes the threshold
  useEffect(() => {
    if (isProcessing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = widthRef.current;
    const h = heightRef.current;
    const origData = origDataRef.current;
    const maskData = maskDataRef.current;

    if (!origData || !maskData || w === 0 || h === 0) return;

    canvas.width = w;
    canvas.height = h;

    const outputData = new ImageData(w, h);
    const out = outputData.data;

    // go through every pixel quickly
    const threshByte = Math.floor(threshold * 255);
    
    for (let i = 0; i < origData.length; i += 4) {
      // black and white mask, so we only need the red value
      const prob = maskData[i];
      
      if (prob > threshByte) {
        const lutColor = infernoLUT[prob];
        // Safe access just in case prob is exactly 256
        const [r, g, b] = lutColor || infernoLUT[255]; 
        
        // blend original picture with the heatmap color
        const alpha = prob / 255.0;
        const invAlpha = 1.0 - alpha;
        
        out[i] = origData[i] * invAlpha + r * alpha;         // R
        out[i+1] = origData[i+1] * invAlpha + g * alpha;     // G
        out[i+2] = origData[i+2] * invAlpha + b * alpha;     // B
        out[i+3] = 255;                                      // A
      } else {
        // Below threshold, just show original image
        out[i] = origData[i];
        out[i+1] = origData[i+1];
        out[i+2] = origData[i+2];
        out[i+3] = 255;
      }
    }

    ctx.putImageData(outputData, 0, 0);
  }, [threshold, isProcessing]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black/20 font-sans">
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto block"
        style={{ opacity: isProcessing ? 0 : 1, transition: 'opacity 0.2s ease' }}
      />
      
      {!isProcessing && (
         <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-background/90 backdrop-blur-md rounded border border-border/50 shadow-sm flex items-center gap-2 pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Live View</span>
         </div>
      )}
    </div>
  );
}
