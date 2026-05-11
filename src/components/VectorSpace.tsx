import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Chunk } from '@/src/lib/ragUtils';
import { motion } from 'motion/react';

interface VectorSpaceProps {
  chunks: Chunk[];
  queryPosition?: { x: number; y: number };
  highlightedIds?: string[];
  onChunkClick?: (chunk: Chunk) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg max-w-xs">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {data.id || 'QUERY'}
        </p>
        <p className="text-xs text-slate-600 line-clamp-3">
          {data.text || 'Question Vector Space'}
        </p>
      </div>
    );
  }
  return null;
};

const VectorSpace: React.FC<VectorSpaceProps> = ({ chunks, queryPosition, highlightedIds = [], onChunkClick }) => {
  const data = chunks.map(c => ({
    ...c,
    x: c.position?.x || 0,
    y: c.position?.y || 0,
    z: 10
  }));

  const queryData = queryPosition ? [{ x: queryPosition.x, y: queryPosition.y, z: 20, isQuery: true }] : [];

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Vector Space Distribution</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-medium text-slate-500 uppercase">Chunks</span>
          </div>
          {queryPosition && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-medium text-slate-500 uppercase">Query</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 overflow-hidden shadow-inner bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-repeat">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="x" hide domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="y" hide domain={['auto', 'auto']} />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            <Scatter 
              name="Chunks" 
              data={data} 
              onClick={(payload) => onChunkClick?.(payload as unknown as Chunk)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isHighlighted = highlightedIds.includes(entry.id);
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isHighlighted ? '#10b981' : '#3b82f6'} 
                    fillOpacity={isHighlighted ? 1 : 0.4}
                    stroke={isHighlighted ? '#059669' : '#2563eb'}
                    strokeWidth={isHighlighted ? 2 : 1}
                  />
                );
              })}
            </Scatter>

            {queryPosition && (
              <Scatter name="Query" data={queryData}>
                <Cell fill="#f59e0b" fillOpacity={1} stroke="#d97706" strokeWidth={3} className="animate-pulse" />
              </Scatter>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">DIMENSIONALITY</span>
            <span className="text-sm font-mono font-medium text-slate-700">768 (Projected to 2D)</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">TOTAL VECTORS</span>
            <span className="text-sm font-mono font-medium text-slate-700">{chunks.length}</span>
        </div>
      </div>
    </div>
  );
};

export default VectorSpace;
