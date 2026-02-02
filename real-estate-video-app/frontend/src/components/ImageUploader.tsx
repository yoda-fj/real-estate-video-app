'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, GripVertical, Clock, Image as ImageIcon } from 'lucide-react';
import type { UploadedImage } from '@shared/types';

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/')
    );

    if (files.length + images.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    processFiles(files);
  }, [images.length, maxImages]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    processFiles(files);
  }, [images.length, maxImages]);

  const processFiles = async (files: File[]) => {
    const newImages: UploadedImage[] = [];

    for (const file of files) {
      const url = await readFileAsDataURL(file);
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        filename: file.name,
        duration: 3000, // Default 3 seconds
        order: images.length + newImages.length,
      });
    }

    onChange([...images, ...newImages]);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = useCallback((id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    // Reorder
    const reordered = filtered.map((img, index) => ({ ...img, order: index }));
    onChange(reordered);
  }, [images, onChange]);

  const updateDuration = useCallback((id: string, duration: number) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, duration } : img
    );
    onChange(updated);
  }, [images, onChange]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverList = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    // Update order
    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-white/20 hover:border-white/40'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDragging ? 'bg-purple-500' : 'bg-white/10'
          }`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-white/60'}`} />
          </div>
          <div>
            <p className="text-white font-medium">
              {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
            </p>
            <p className="text-sm text-white/50 mt-1">
              {images.length} / {maxImages} imagens adicionadas
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOverList(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative group bg-white/5 rounded-xl overflow-hidden border border-white/10
                  ${draggedIndex === index ? 'opacity-50' : ''}
                `}
              >
                {/* Drag Handle */}
                <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-black/50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 p-1 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Image Preview */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>

                  {/* Duration Control */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 bg-black/60 rounded-lg px-2 py-1">
                      <Clock className="w-3 h-3 text-white/60" />
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="500"
                        value={image.duration}
                        onChange={(e) => updateDuration(image.id, parseInt(e.target.value))}
                        className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                      <span className="text-xs text-white/80 min-w-[3ch]">
                        {(image.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Empty State Hint */}
      {images.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>Adicione fotos do imóvel para começar</span>
        </div>
      )}
    </div>
  );
}
