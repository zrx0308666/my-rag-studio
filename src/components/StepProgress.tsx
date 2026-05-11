import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type RAGStep = 'upload' | 'embedding' | 'storage' | 'retrieval' | 'generation';

interface StepProgressProps {
  currentStep: RAGStep;
  steps: { id: RAGStep; label: string }[];
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, steps }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted ? "bg-green-500 text-white" : "",
                  isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" : "",
                  !isCompleted && !isActive ? "bg-slate-100 text-slate-400 border border-slate-200" : ""
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isActive ? "text-blue-600" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 px-4 mb-6">
                <div className={cn(
                  "h-[2px] w-full transition-colors duration-500",
                  isCompleted ? "bg-green-500" : "bg-slate-100"
                )} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress;
