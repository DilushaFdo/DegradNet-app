export interface PredictionResult {
  material: string;
  confidence: number;
  severity: number;
  mask: string;
  binary: string;
  preprocessedImage: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PredictionResult;
  error?: string;
}
