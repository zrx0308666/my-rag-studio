import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GenerationOutputProps {
  answer: string;
  fullPrompt: string;
  isGenerating: boolean;
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {displayedText.length < text.length && <span className="typewriter-cursor h-4 w-1 bg-blue-600 inline-block ml-1" />}
    </div>
  );
};

const GenerationOutput: React.FC<GenerationOutputProps> = ({ answer, fullPrompt, isGenerating }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            5. Generation (LLM Response)
        </h2>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl min-h-[300px] border border-slate-800 relative overflow-hidden">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-400 text-sm font-medium animate-pulse">Synthesis in progress...</span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-mono text-slate-500 ml-4 tracking-widest uppercase">Gemini-1.5-Pro</span>
        </div>

        <div className="text-slate-100 font-sans leading-relaxed">
            {answer ? (
              <TypewriterText text={answer} />
            ) : (
              <p className="text-slate-500 italic">Waiting for query completion to generate response...</p>
            )}
        </div>
      </div>

      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
        <button 
          onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Inspect Combined Prompt Context</span>
          </div>
          {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {showPrompt && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="bg-slate-50 border-t border-slate-200"
            >
              <div className="p-4">
                <pre className="text-[10px] sm:text-xs font-mono text-slate-600 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {fullPrompt || "Prompt will be constructed after retrieval phase."}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerationOutput;
