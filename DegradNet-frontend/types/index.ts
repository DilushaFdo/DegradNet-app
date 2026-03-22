export interface PredictionResult {
  material: string;
  confidence: number;
  severity: number;
  rawMask?: string;
  mask: string;
  surfaceData?: number[][];
  binary: string;
  preprocessedImage: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PredictionResult;
  error?: string;
}
