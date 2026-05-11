/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Database, 
  Search, 
  Cpu, 
  RefreshCcw, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Chunk, projectEmbedding, cosineSimilarity } from '@/src/lib/ragUtils';
import { getEmbedding, generateResponse } from '@/src/services/geminiService';
import StepProgress, { RAGStep } from './components/StepProgress';
import DocumentProcessor from './components/DocumentProcessor';
import VectorSpace from './components/VectorSpace';
import GenerationOutput from './components/GenerationOutput';
import DetailPanel from './components/DetailPanel';
import { cn } from './lib/utils';

export default function App() {
  const [currentStep, setCurrentStep] = useState<RAGStep>('upload');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const [queryEmbedding, setQueryEmbedding] = useState<number[] | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
  const [answer, setAnswer] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const steps: { id: RAGStep; label: string }[] = [
    { id: 'upload', label: 'Processing' },
    { id: 'embedding', label: 'Embedding' },
    { id: 'storage', label: 'Index Store' },
    { id: 'retrieval', label: 'Retrieve' },
    { id: 'generation', label: 'Generate' },
  ];

  const handleChunksGenerated = (newChunks: Chunk[]) => {
    setChunks(newChunks);
    setCurrentStep('embedding');
  };

  const runEmbedding = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const processedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const emb = await getEmbedding(chunk.text);
          return {
            ...chunk,
            embedding: emb,
            position: projectEmbedding(emb)
          };
        })
      );
      setChunks(processedChunks);
      setCurrentStep('storage');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setIsProcessing(true);
    setError(null);
    setCurrentStep('retrieval');
    
    try {
      // 1. Get query embedding
      const qEmb = await getEmbedding(query);
      setQueryEmbedding(qEmb);

      // 2. Calculate similarity
      const scoredChunks = chunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(qEmb, chunk.embedding!)
      })).sort((a, b) => (b.score || 0) - (a.score || 0));

      setChunks(scoredChunks);

      // 3. Prepare for generation
      const topK = scoredChunks.slice(0, 3);
      const context = topK.map(c => c.text).join('\n\n');
      
      const builtPrompt = `Context:\n${context}\n\nUser Question: ${query}`;
      setFullPrompt(builtPrompt);

      setCurrentStep('generation');

      // 4. Generate response
      const result = await generateResponse(query, context);
      setAnswer(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setChunks([]);
    setCurrentStep('upload');
    setQuery('');
    setQueryEmbedding(null);
    setAnswer('');
    setFullPrompt('');
    setError(null);
  };

  const topKIds = useMemo(() => {
    if (currentStep === 'retrieval' || currentStep === 'generation') {
      return chunks.slice(0, 3).map(c => c.id);
    }
    return [];
  }, [chunks, currentStep]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StepProgress currentStep={currentStep} steps={steps} />

      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Flow Control & Input */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <AnimatePresence mode="wait">
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <DocumentProcessor 
                    onChunksGenerated={handleChunksGenerated} 
                    isProcessing={isProcessing} 
                  />
                </motion.div>
              )}

              {currentStep === 'embedding' && (
                <motion.div
                  key="embedding"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">2. Embedding Layer</h2>
                    <Database className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Convert textual tokens into high-dimensional numerical vectors using <code className="bg-slate-100 px-1 rounded text-blue-600">text-embedding-004</code>.
                  </p>
                  <button
                    onClick={runEmbedding}
                    disabled={isProcessing}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                    {isProcessing ? 'Processing Vectors...' : 'Start Vectorization'}
                  </button>
                </motion.div>
              )}

              {(currentStep === 'storage' || currentStep === 'retrieval' || currentStep === 'generation') && (
                <motion.div
                  key="query"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">Knowledge Interaction</h2>
                    <Search className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="relative group">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask the documentation anything..."
                      className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none text-sm leading-relaxed"
                    />
                    <div className="absolute right-4 bottom-4 flex gap-2">
                        <button
                            onClick={handleQuery}
                            disabled={isProcessing || !query}
                            className="p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                        onClick={reset}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1 py-4 border border-dashed border-slate-200 rounded-xl hover:border-red-200"
                    >
                        <RefreshCcw className="w-3 h-3" />
                        PURGE LABORATORY DATA
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}
          </section>

          {/* Miniature Storage List */}
          <section className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                In-Memory Vector Store
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {chunks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">
                  Initialize steps to fill database...
                </div>
              ) : (
                chunks.map((chunk, idx) => (
                  <button
                    key={chunk.id}
                    onClick={() => setSelectedChunk(chunk)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all group relative",
                      topKIds.includes(chunk.id) 
                        ? "bg-green-50 border-green-200 ring-1 ring-green-100" 
                        : "bg-slate-50 border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">{chunk.id}</span>
                      {chunk.score !== undefined && (
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                           <span className="text-[10px] font-mono font-bold text-green-600">{(chunk.score * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 group-hover:line-clamp-2 transition-all">
                      {chunk.text}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Visualization & Output */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
             {/* Vector Space Visualization */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <VectorSpace 
                    chunks={chunks.filter(c => c.embedding)} 
                    queryPosition={queryEmbedding ? projectEmbedding(queryEmbedding) : undefined}
                    highlightedIds={topKIds}
                    onChunkClick={setSelectedChunk}
                />
             </div>

             {/* Dynamic Context Dashboard */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        4. Retrieval Engine
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                    {currentStep === 'retrieval' || currentStep === 'generation' ? (
                        <>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Reasoning: Top-3 Recall</h4>
                                {chunks.slice(0, 3).map((chunk, i) => (
                                    <motion.div 
                                        key={chunk.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-green-50/50 p-4 rounded-xl border border-green-100 border-l-4 border-l-green-500"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-green-700">RANK #{i+1}</span>
                                            <span className="text-[10px] font-mono text-green-600">SIMILARITY: {(chunk.score! * 100).toFixed(1)}%</span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-3 italic">"{chunk.text}"</p>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 italic text-sm text-center px-8">
                            Knowledge Retrieval visualization will activate once a query is submitted.
                        </div>
                    )}
                </div>
             </div>
          </div>

          <div className="flex-1">
            <GenerationOutput 
                answer={answer} 
                fullPrompt={fullPrompt} 
                isGenerating={isProcessing && currentStep === 'generation'} 
            />
          </div>
        </div>
      </main>

      <DetailPanel 
        chunk={selectedChunk} 
        onClose={() => setSelectedChunk(null)} 
      />
    </div>
  );
}
