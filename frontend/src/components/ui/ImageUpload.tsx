import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function ImageUpload({ images, onChange, maxFiles = 5, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    if (images.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      // data.urls will be something like ["/uploads/file1.jpg"]
      onChange([...images, ...data.urls]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-[var(--radius-xl)] p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-surface-600 bg-surface-800 hover:border-surface-400 hover:bg-surface-700/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading || images.length >= maxFiles}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-surface-300 font-medium">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-surface-900 border border-surface-600 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="h-7 w-7 text-primary stroke-[2]" />
            </div>
            <p className="text-surface-200 font-bold mb-1 tracking-tight">Click or drag images to upload</p>
            <p className="text-surface-400 text-sm">PNG, JPG up to 5MB (Max {maxFiles} images)</p>
          </>
        )}
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          <AnimatePresence>
            {images.map((url, index) => {
              // Construct full url for preview if relative
              const previewUrl = url.startsWith('/') 
                ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`
                : url;

              return (
                <motion.div
                  key={url + index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden border border-surface-600 shadow-sm group"
                >
                  <img src={previewUrl} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      type="button" 
                      variant="danger" 
                      size="icon" 
                      className="w-8 h-8 rounded-full"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
