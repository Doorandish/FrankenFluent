import React from 'react';
import { Chapter } from '../../types';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ChapterCardProps {
  chapter: Chapter;
  level: string;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, level, isLocked = false, isCompleted = false }) => {
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className={cn("glass-card p-6 relative transition-all duration-300", isLocked ? "opacity-60 grayscale" : "")}>
      <div className="absolute top-6 right-6">
        {isCompleted ? <CheckCircle2 className="w-6 h-6 text-brand-500" /> : isLocked ? <Lock className="w-6 h-6 text-dark-500" /> : null}
      </div>
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center font-bold text-xl text-brand-500 shrink-0">
          {chapter.chapter_number}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{chapter.title}</h3>
          <div className="flex flex-wrap gap-2">
            {chapter.topics.map((topic, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-dark-800 rounded-md text-dark-300">{topic}</span>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-400 font-medium py-2 w-full justify-between"
      >
        <span>View Details & Scenarios</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-dark-700/50 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-2">Learning Goals</h4>
            <ul className="list-disc list-inside text-sm text-dark-400 space-y-1">
              {chapter.learning_goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-2">Scenarios</h4>
            <div className="space-y-2">
              {chapter.scenarios.map((scenario) => (
                <div key={scenario.scenario_id} className="flex items-center justify-between bg-dark-800 p-3 rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-white">{scenario.situation}</div>
                    <div className="text-xs text-dark-400">{scenario.task}</div>
                  </div>
                  <button 
                    disabled={isLocked}
                    onClick={() => navigate(`/practice/${level}/${chapter.chapter_id}/${scenario.scenario_id}`)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isLocked ? "text-dark-600 bg-dark-900" : "text-brand-500 bg-brand-500/10 hover:bg-brand-500/20"
                    )}
                  >
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
