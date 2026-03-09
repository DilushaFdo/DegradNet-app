# DegradNet - AI Infrastructure Degradation Detection System

A modern, production-ready web application for detecting and analyzing infrastructure degradation using AI-powered computer vision.

## Features

### Image Upload
- Drag-and-drop interface for easy image upload
- File picker support for JPG and PNG formats
- Real-time image preview
- Loading states during analysis

### AI Analysis
- Integration with backend ML API via `/api/predict` endpoint
- Real-time prediction processing
- Mock data fallback for development/demo purposes

### Results Dashboard
- **Material Detection**: Clear display of detected material type (concrete, metal, asphalt, etc.)
- **Confidence Score**: Visual progress bar showing model prediction certainty (0-100%)
- **Severity Analysis**: Color-coded degradation severity indicator
  - Green: Low severity (0-33%)
  - Yellow: Moderate severity (33-66%)
  - Red: High severity (66-100%)
- **Visual Segmentation**: Canvas-based overlay of segmentation mask on original image
- **Mask Toggle**: Show/hide segmentation mask with smooth transitions

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **UI Library**: React 18 (Functional Components)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **API**: Fetch API for backend communication
- **Canvas**: HTML5 Canvas for image manipulation

## Project Structure

```
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts        # API endpoint (mock)
│   ├── page.tsx                # Main application page
│   └── layout.tsx              # Root layout
├── components/
│   ├── ImageUploader.tsx       # Drag-and-drop upload component
│   ├── PredictionResultCard.tsx # Results display container
│   ├── ConfidenceBar.tsx       # Confidence visualization
│   ├── SeverityBar.tsx         # Severity visualization
│   ├── ImageMaskCanvas.tsx     # Canvas-based mask overlay
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── api.ts                  # API integration utilities
└── types/
    └── index.ts                # TypeScript type definitions
```

## API Integration

The application expects a backend API endpoint at `/api/predict` that accepts a POST request with:

**Request:**
- `Content-Type`: multipart/form-data
- Body: FormData with `image` field containing the uploaded file

**Response:**
```json
{
  "material": "Concrete",
  "confidence": 0.92,
  "severity": 0.68,
  "mask": "data:image/png;base64,..."
}
```

**Response Fields:**
- `material`: String - Detected material type
- `confidence`: Number (0-1) - Model prediction confidence
- `severity`: Number (0-1) - Degradation severity level
- `mask`: String - Base64-encoded PNG image for segmentation mask

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Upload Image**: Drag and drop or click to select an infrastructure image (concrete, metal, or asphalt)
2. **Analyze**: Click the "Analyze Image" button to send the image to the AI model
3. **View Results**: Review the detected material, confidence score, and severity level
4. **Toggle Mask**: Use the show/hide mask button to visualize the segmentation overlay

## Demo Mode

If the backend API is not available, the application automatically falls back to mock data for demonstration purposes. This allows testing the UI/UX without a live ML backend.

## Responsive Design

- Desktop-first design optimized for presentations and technical demos
- Fully responsive layout that adapts to tablets and mobile devices
- Grid-based layout that stacks on smaller screens

## Color Scheme

- Primary: Blue (#2563EB)
- Success/Low Severity: Green
- Warning/Moderate Severity: Yellow
- Error/High Severity: Red
- Neutral: Gray scale for backgrounds and text

## Future Enhancements

- Batch image processing
- Historical analysis tracking
- Export results to PDF/CSV
- Real-time video analysis
- Multi-material detection in single image
- Advanced filtering and comparison tools

## License

Built as a final-year project demonstration for AI-powered infrastructure analysis.
