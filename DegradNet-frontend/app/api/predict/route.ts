import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL - MUST be set in Vercel environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'https://dilushaf-degradnet.hf.space';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Create a new FormData for the backend request
    const backendFormData = new FormData();
    backendFormData.append('file', image); // FastAPI expects 'file' as the field name

    // Build the backend URL with query parameters
    const materialOverride = formData.get('materialOverride') as string;
    const threshold = formData.get('threshold') as string;
    const params = new URLSearchParams();
    if (materialOverride && materialOverride !== 'auto') {
      params.set('material_override', materialOverride);
    }
    if (threshold) {
      params.set('threshold', threshold);
    }
    const queryString = params.toString();
    const predictUrl = `${BACKEND_URL}/predict${queryString ? `?${queryString}` : ''}`;

    // Forward the request to the FastAPI backend
    const response = await fetch(predictUrl, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Backend prediction failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the response to match frontend expectations
    return NextResponse.json({
      material: data.material,
      confidence: data.confidence,
      severity: data.severity,
      mask: `data:image/png;base64,${data.mask}`,
      binary: `data:image/png;base64,${data.binary}`,
      preprocessedImage: `data:image/png;base64,${data.preprocessed_image}`,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

