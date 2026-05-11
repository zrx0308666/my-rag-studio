import React from 'react';
import { Chunk } from '@/src/lib/ragUtils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Hash, Layers, Scissors } from 'lucide-react';

interface DetailPanelProps {
  chunk: Chunk | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ chunk, onClose }) => {
  return (
    <AnimatePresence>
      {chunk && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Chunk Properties</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">IDENTIFIER</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-slate-700">{chunk.id}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">EST. TOKENS</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-slate-700">{chunk.tokens}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Scissors className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Extracted Content</span>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-sans text-sm leading-relaxed text-slate-600 shadow-inner italic">
                  "{chunk.text}"
                </div>
              </div>

              {chunk.embedding && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Vector Embedding Data (First 16 dims)</span>
                  <div className="grid grid-cols-4 gap-2">
                    {chunk.embedding.slice(0, 16).map((val, i) => (
                      <div key={i} className="bg-blue-50/50 p-2 rounded border border-blue-100 text-[10px] font-mono text-blue-700 text-center">
                        {val.toFixed(3)}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 border-dashed">
                      The vector above is a 768-dimensional numerical representation of the text's semantic meaning, 
                      generated using Google's text-embedding-004 model.
                  </p>
                </div>
              )}
              
              {chunk.score !== undefined && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Retrieval Significance</span>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${chunk.score * 100}%` }}
                                className="h-full bg-green-500"
                            />
                        </div>
                        <span className="text-sm font-mono font-bold text-green-600">{(chunk.score * 100).toFixed(1)}%</span>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailPanel;
