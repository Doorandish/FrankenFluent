import React, { useState, useEffect } from 'react';
import { getCurriculums } from '../lib/api';
import { Curriculum } from '../types';
import { ChapterCard } from '../components/roadmap/ChapterCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RoadmapPage: React.FC = () => {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<string>('A2');

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await getCurriculums();
        setCurriculums(response.data);
        if (response.data.length > 0) {
          setActiveLevel(response.data[0].level);
        }
      } catch (error) {
        console.error('Failed to fetch curriculums', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculums();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[50vh]"><LoadingSpinner className="w-10 h-10" /></div>;
  }

  const activeCurriculum = curriculums.find(c => c.level === activeLevel);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Roadmap</h1>
        <p className="text-dark-400">Follow the path to fluency</p>
      </div>

      <div className="flex gap-2 p-1 bg-dark-900 rounded-xl mb-8 w-max">
        {curriculums.map(c => (
          <button
            key={c.level}
            onClick={() => setActiveLevel(c.level)}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${activeLevel === c.level ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'}`}
          >
            {c.level}
          </button>
        ))}
      </div>

      {activeCurriculum && (
        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[35px] before:w-0.5 before:bg-dark-800">
          {activeCurriculum.chapters.map((chapter, idx) => (
            <ChapterCard 
              key={chapter.chapter_id} 
              chapter={chapter} 
              level={activeCurriculum.level}
              isCompleted={idx === 0}
              isLocked={idx > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
