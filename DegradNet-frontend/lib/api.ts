import { ApiResponse } from "@/types";

export async function predictImage(imageFile: File, materialOverride: string = 'auto', threshold: number = 0.5): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("materialOverride", materialOverride);
    formData.append("threshold", threshold.toString());

    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Prediction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export function getMockPrediction(): ApiResponse {
  return {
    success: true,
    data: {
      material: "Concrete",
      confidence: 0.92,
      severity: 0.68,
      mask: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      binary: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMBAQA3RWNQAAAABJRU5ErkJggg==",
      preprocessedImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    },
  };
}
