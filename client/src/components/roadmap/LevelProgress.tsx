import React from 'react';
import { ProgressRing } from '../common/ProgressRing';

interface LevelProgressProps {
  level: string;
  progress: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ level, progress }) => {
  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
      <h3 className="text-xl font-bold">{level} Level</h3>
      <ProgressRing progress={progress} size={120} strokeWidth={8} className="text-xl" />
      <p className="text-dark-400 text-sm">{progress}% Completed</p>
    </div>
  );
};
