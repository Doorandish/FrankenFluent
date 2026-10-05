import React, { useEffect, useState } from 'react';
import { Icon } from '../components/common/Icon';
import { useUserId } from '../hooks/useUserId';
import { getProgress, getMistakes } from '../lib/api';
import { UserProgress, Mistake } from '../types';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const userId = useUserId();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

  useEffect(() => {
    if (userId) {
      getProgress(userId).then(res => setProgress(res.data)).catch(() => {});
      getMistakes(userId).then(res => setMistakes(res.data)).catch(() => {});
    }
  }, [userId]);

  const fluencyScore = progress?.overall_fluency_score || 0;
  const completedScenariosCount = progress?.completed_scenarios?.length || 0;
  const userLevel = progress?.current_level || 'A2';

  return (
    <div className="screen profile-screen">
      <div className="profile-hero">
        <div className="large-avatar">
          <span>FF</span>
          <i />
        </div>
        <p className="page-title">German Learner</p>
        <span>Ansbach, Middle Franconia</span>
      </div>

      <div className="profile-level">
        <div>
          <span>Current level</span>
          <b>Level {userLevel} · Elementary</b>
        </div>
        <strong>{completedScenariosCount > 0 ? `${Math.min(completedScenariosCount * 10, 100)}%` : '0%'}</strong>
      </div>

      <div className="profile-grid">
        <div>
          <b>1</b>
          <span>day streak</span>
        </div>
        <div>
          <b>{fluencyScore}</b>
          <span>Fluency XP</span>
        </div>
        <div>
          <b>{completedScenariosCount}</b>
          <span>scenarios</span>
        </div>
      </div>

      <div className="achievement-card">
        <div>
          <Icon name="flame" size={24} />
        </div>
        <span>
          <b>On Track</b>
          Complete today's scenario to keep your fluency streak alive.
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link to="/system" className="pressable flex items-center justify-between p-3.5 rounded-2xl bg-dark-900/80 border border-dark-700/50 text-dark-300 hover:text-white text-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="grid" size={16} />
            <span>Interactive System Dashboard</span>
          </div>
          <Icon name="chevron" size={14} />
        </Link>
      </div>
    </div>
  );
};
