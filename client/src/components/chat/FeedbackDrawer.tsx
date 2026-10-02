import React from 'react';
import { FeedbackFarsi } from '../../types';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FeedbackDrawerProps {
  feedback: FeedbackFarsi;
}

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({ feedback }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="mt-2 text-sm">
      <button 
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${feedback.has_error ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40' : 'border-brand-900/50 bg-brand-950/20 text-brand-400 hover:bg-brand-950/40'}`}
      >
        {feedback.has_error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
        <span className="font-medium">{feedback.has_error ? 'بازخورد' : 'عالی!'}</span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      {expanded && feedback.has_error && (
        <div className="mt-3 p-4 glass-card border-red-900/30 bg-dark-900/80 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-dark-500 uppercase tracking-wider block mb-1">Your Mistake</span>
              <span className="text-red-400 line-through bg-red-950/30 px-1 rounded">{feedback.user_mistake}</span>
            </div>
            <div>
              <span className="text-xs text-dark-500 uppercase tracking-wider block mb-1">Correction</span>
              <span className="text-brand-400 font-medium bg-brand-950/30 px-1 rounded">{feedback.correct_version}</span>
            </div>
            {feedback.explanation && (
              <div className="pt-2 border-t border-dark-700/50">
                <p className="persian-text text-dark-200 text-base leading-relaxed">{feedback.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {expanded && !feedback.has_error && feedback.explanation && (
        <div className="mt-3 p-4 glass-card border-brand-900/30 bg-dark-900/80 animate-in slide-in-from-top-2 duration-200">
          <p className="persian-text text-dark-200 text-base leading-relaxed">{feedback.explanation}</p>
        </div>
      )}
    </div>
  );
};
