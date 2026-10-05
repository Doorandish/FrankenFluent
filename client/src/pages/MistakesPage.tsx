import React, { useState, useEffect } from 'react';
import { getMistakes } from '../lib/api';
import { Mistake } from '../types';
import { useUserId } from '../hooks/useUserId';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BookOpen, CheckCircle2, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export const MistakesPage: React.FC = () => {
  const userId = useUserId();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unreviewed'>('all');

  useEffect(() => {
    const fetchMistakes = async () => {
      if (userId) {
        try {
          const response = await getMistakes(userId);
          setMistakes(response.data);
        } catch (error) {
          console.error('Error fetching mistakes:', error);
          // Load some dummy data if api fails for demo purposes
          setMistakes([
            {
              _id: '1', user_id: userId, chapter_id: 'ch1',
              original_text: 'Ich bin gehen zum Supermarkt.',
              corrected_text: 'Ich gehe zum Supermarkt.',
              error_category: 'Grammar',
              explanation: 'In German present tense, you don\'t combine the auxiliary verb "sein" (like "bin") with the main verb (like "gehen"). Use the conjugated main verb directly: "Ich gehe".',
              reviewed: false, created_at: new Date().toISOString()
            }
          ]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMistakes();
  }, [userId]);

  const filteredMistakes = mistakes.filter(m => filter === 'all' ? true : !m.reviewed);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mistakes Notebook</h1>
          <p className="text-dark-400">Review and learn from your errors</p>
        </div>
        
        <div className="flex gap-2 bg-dark-900 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", filter === 'all' ? "bg-dark-700 text-white" : "text-dark-400 hover:text-dark-200")}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unreviewed')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", filter === 'unreviewed' ? "bg-dark-700 text-white" : "text-dark-400 hover:text-dark-200")}
          >
            Unreviewed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner className="w-8 h-8" /></div>
      ) : filteredMistakes.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-brand-500 mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">No mistakes found!</h3>
          <p className="text-dark-400">You're doing great. Keep practicing!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMistakes.map(mistake => (
            <div key={mistake._id} className="glass-card p-5 border-l-4 border-l-red-500 relative group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-dark-800 text-dark-300 uppercase tracking-wider">
                  {mistake.error_category}
                </span>
                {!mistake.reviewed && (
                  <button className="flex items-center gap-1 text-xs text-dark-400 hover:text-brand-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Reviewed</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-dark-500 mb-1">Your Mistake</div>
                  <div className="text-red-400 line-through bg-red-950/20 px-3 py-2 rounded-lg inline-block">
                    {mistake.original_text}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-dark-500 mb-1">Correction</div>
                  <div className="text-brand-400 font-medium bg-brand-950/20 px-3 py-2 rounded-lg inline-block">
                    {mistake.corrected_text}
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-800">
                  <div className="text-xs text-dark-500 mb-1">Explanation</div>
                  <p className="text-dark-200 text-base leading-relaxed">
                    {mistake.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
