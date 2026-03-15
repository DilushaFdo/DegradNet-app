'use client';

import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/imageCompression';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.match(/image\/(jpeg|jpg|png|heic|heif|webp)/)) {
        alert('Please upload a valid image file (JPG, PNG, or HEIC)');
        return;
      }

      try {
        setIsCompressing(true);
        const { file: compressedFile, preview } = await compressImage(file);
        onImageSelect(compressedFile, preview);
      } catch (err) {
        console.error('Image compression failed, using original:', err);
        // Fallback: send original file if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          onImageSelect(file, preview);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isCompressing) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isCompressing, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const isDisabled = disabled || isCompressing;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-10 sm:p-12 text-center transition-all duration-200 ${
        isDragging
          ? 'upload-drag-active border-primary/50'
          : 'border-border/60 hover:border-muted-foreground/30'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInput}
        disabled={isDisabled}
      />

      {/* Hidden input for mobile camera capture */}
      <input
        type="file"
        id="camera-capture"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        disabled={isDisabled}
      />

      {/* Compressing overlay */}
      {isCompressing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-foreground/80">Optimizing image…</p>
          <p className="text-xs text-muted-foreground mt-1">This only takes a moment</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/60 border border-border/50">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>

        <div>
          <p className="text-base font-medium text-foreground/80 mb-1">
            Drop your infrastructure image here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>

        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isDisabled}
          type="button"
          variant="outline"
          className="mt-1 border-border hover:bg-secondary"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Select Image
        </Button>

        {/* Mobile-only camera capture button */}
        <Button
          onClick={() => document.getElementById('camera-capture')?.click()}
          disabled={isDisabled}
          type="button"
          variant="outline"
          className="mt-2 sm:hidden border-border hover:bg-secondary"
        >
          <Camera className="w-4 h-4 mr-2" />
          Capture Photo
        </Button>

        <p className="text-[11px] text-muted-foreground/50 mt-1">
          Supported: JPG, PNG
        </p>
      </div>
    </div>
  );
}
