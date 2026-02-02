'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Sparkles } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TextInput({ value, onChange, placeholder, maxLength = 500 }: TextInputProps) {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    onChange(newValue);
    setCharCount(newValue.length);
  }, [onChange, maxLength]);

  const charPercentage = (charCount / maxLength) * 100;
  const isNearLimit = charPercentage > 80;
  const isAtLimit = charPercentage >= 100;

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Descreva o imóvel...'}
        rows={6}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
      />

      {/* Character Count & Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-white/40" />
          <span className={`text-sm ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/40'}`}>
            {charCount} / {maxLength} caracteres
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${charPercentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Auto-generate hint */}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Legendas automáticas</span>
        </div>
      </div>

      {/* Text Preview Style */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Preview das Legendas</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed italic">
            "{value.length > 150 ? value.slice(0, 150) + '...' : value}"
          </p>
          <p className="text-xs text-white/40 mt-2">
            {value.split('.').filter(Boolean).length} sentença(s) • 
            {Math.ceil(value.length / 50)} bloco(s) de legenda
          </p>
        </motion.div>
      )}

      {/* Tips */}
      {!value && (
        <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Seja descritivo sobre o imóvel</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Mencione diferenciais</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Inclua localização</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>Preço se relevante</span>
          </div>
        </div>
      )}
    </div>
  );
}
