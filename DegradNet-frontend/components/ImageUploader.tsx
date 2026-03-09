'use client';

import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        alert('Please upload a valid image file (JPG or PNG)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onImageSelect(file, preview);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-10 sm:p-12 text-center transition-all duration-200 ${
        isDragging
          ? 'upload-drag-active border-primary/50'
          : 'border-border/60 hover:border-muted-foreground/30'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInput}
        disabled={disabled}
      />

      {/* Hidden input for mobile camera capture */}
      <input
        type="file"
        id="camera-capture"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        disabled={disabled}
      />

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
          disabled={disabled}
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
          disabled={disabled}
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
