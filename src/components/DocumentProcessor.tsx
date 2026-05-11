import React, { useState } from 'react';
import { Upload, FileText, Info } from 'lucide-react';
import mammoth from 'mammoth';
import { Chunk, chunkText } from '@/src/lib/ragUtils';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentProcessorProps {
  onChunksGenerated: (chunks: Chunk[]) => void;
  isProcessing: boolean;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ onChunksGenerated, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    let text = '';

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else {
      text = await file.text();
    }

    const chunks = chunkText(text);
    onChunksGenerated(chunks);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">1. Document Processing</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4" />
          <span>Supports .docx, .txt</span>
        </div>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`
          relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300
          ${dragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'}
        `}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
            <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              {fileName ? fileName : 'Drag & drop document here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">or click to browse from device</p>
          </div>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            accept=".txt,.docx"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
        <div className="text-xs font-medium text-blue-700 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Lab Insight: Chunking Strategy
        </div>
        <p className="text-xs text-blue-600/80 mt-1 leading-relaxed">
          Standard chunk size: 800 chars (~200 tokens). Overlap: 20 chars. 
          This ensures context is preserved across splits.
        </p>
      </div>
    </div>
  );
};

export default DocumentProcessor;
