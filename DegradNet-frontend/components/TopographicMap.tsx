'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Plotly needs to be heavily dynamically imported without SSR since it accesses `window`
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-secondary/20 rounded-lg animate-pulse">
      <p className="text-muted-foreground text-sm">Loading 3D Engine...</p>
    </div>
  ),
});

interface TopographicMapProps {
  surfaceData: number[][]; // 2D array of z-values (probabilities)
  height?: number;
}

export default function TopographicMap({
  surfaceData,
  height = 400,
}: TopographicMapProps) {
  if (!surfaceData || surfaceData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px] bg-secondary/10 rounded-lg border border-border/50">
        <p className="text-muted-foreground text-sm">No topographic data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-lg overflow-hidden border border-border/50 bg-black/40">
      <Plot
        data={[
          {
            z: surfaceData,
            type: 'surface',
            colorscale: 'Inferno',
            showscale: true,
            colorbar: {
              title: { 
                text: 'Severity', 
                side: 'right',
                font: { color: 'rgba(255,255,255,0.9)', size: 10 }
              },
              tickfont: { color: 'rgba(255,255,255,0.7)', size: 10 },
              thickness: 10,
              len: 0.6,
              x: 0.95,
              y: 0.5,
            },
            contours: {
              z: {
                show: true,
                usecolormap: true,
                highlightcolor: 'white',
                project: { z: true },
              },
            } as any,
          },
        ]}
        layout={{
          title: { text: '' },
          autosize: true,
          margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
          paper_bgcolor: 'transparent',
          scene: {
            xaxis: { visible: false },
            yaxis: { autorange: 'reversed', visible: false },
            zaxis: { 
              visible: true, 
              title: { text: '' }, 
              gridcolor: 'rgba(255,255,255,0.1)',
              tickfont: { color: 'rgba(255,255,255,0.5)' } 
            },
            camera: {
              eye: { x: 1.5, y: 1.5, z: 1.0 }, // Dynamic starting angle
            },
            aspectratio: { x: 1, y: 1, z: 0.5 }, // Squish the Z axis slightly so spikes aren't overwhelmingly tall
          },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: `${height}px` }}
        config={{ displayModeBar: false, responsive: true }}
      />
      
      <div className="absolute top-2 left-2 px-3 py-1.5 bg-background/80 backdrop-blur-md border border-border/50 rounded-md text-xs font-medium text-muted-foreground">
        Interactive 3D Surface
      </div>
    </div>
  );
}
