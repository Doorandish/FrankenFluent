import React from 'react';
import { Copy } from 'lucide-react';

interface RedemittelPanelProps {
  phrases: string[];
}

export const RedemittelPanel: React.FC<RedemittelPanelProps> = ({ phrases }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">Key Phrases (Redemittel)</h3>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
        {phrases.map((phrase, idx) => (
          <div key={idx} className="bg-dark-800/50 p-3 rounded-xl flex items-start justify-between group border border-transparent hover:border-dark-700 transition-colors">
            <span className="text-sm text-dark-200">{phrase}</span>
            <button 
              onClick={() => copyToClipboard(phrase)}
              className="text-dark-500 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              title="Copy phrase"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
