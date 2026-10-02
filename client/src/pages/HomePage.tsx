import React from 'react';
import { Link } from 'react-router-dom';
import { LevelProgress } from '../components/roadmap/LevelProgress';

export const HomePage: React.FC = () => {
  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Willkommen bei <span className="text-brand-500">FrankenFluent</span>
        </h1>
        <p className="text-dark-300 text-lg">
          Master German through immersive, AI-powered conversations set in the heart of Middle Franconia. Practice speaking, get instant feedback, and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">Current Level</div>
          <div className="text-2xl font-bold text-white">B1</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">Fluency Score</div>
          <div className="text-2xl font-bold text-brand-400">850</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">Scenarios Done</div>
          <div className="text-2xl font-bold text-white">12</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">Mistakes to Review</div>
          <div className="text-2xl font-bold text-accent-500">5</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link to="/roadmap" className="btn-primary text-center">
          Continue Learning
        </Link>
        <Link to="/mistakes" className="btn-secondary text-center">
          Review Mistakes
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LevelProgress level="A2" progress={100} />
        <LevelProgress level="B1" progress={35} />
      </div>
    </div>
  );
};
