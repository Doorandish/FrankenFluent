import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMistakes, markMistakeReviewed } from '../lib/api';
import { Mistake } from '../types';
import { useUserId } from '../hooks/useUserId';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Icon } from '../components/common/Icon';

export const MistakesPage: React.FC = () => {
  const userId = useUserId();
  const navigate = useNavigate();

  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  const filters = ['All', 'Grammar', 'Word Order', 'Preposition', 'Word Choice'];

  const fetchMistakes = async () => {
    if (userId) {
      try {
        const response = await getMistakes(userId);
        setMistakes(response.data);
      } catch (error) {
        console.error('Error fetching mistakes:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, [userId]);

  const handleReview = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markMistakeReviewed(id);
      setMistakes((prev) =>
        prev.map((m) => (m._id === id ? { ...m, reviewed: true } : m))
      );
    } catch (err) {
      console.error('Failed to mark mistake reviewed:', err);
    }
  };

  const masteredCount = mistakes.filter((m) => m.reviewed).length;
  const totalCount = mistakes.length;
  const masteredPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === 'All') return true;
    return m.error_category?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="screen mistakes-screen">
      {/* Header */}
      <div className="mistakes-header">
        <div>
          <p className="eyebrow">PERSONAL REVIEW</p>
          <p className="page-title">Mistakes ledger</p>
        </div>
        <div className="mastery">
          <b>{masteredCount}</b>
          <span>MASTERED</span>
        </div>
      </div>

      {/* Review Summary Banner */}
      <div className="review-summary">
        <div className="summary-icon">
          <Icon name="trend" size={23} />
        </div>
        <div>
          <p>You’re improving fast</p>
          <span>
            {masteredCount} of {totalCount} mistakes mastered
          </span>
        </div>
        <b>{masteredPercent}%</b>
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            className={`filter-pill pressable ${filter === item ? 'selected' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Count Header */}
      <div className="mistake-count">
        <span>{filteredMistakes.filter((m) => !m.reviewed).length} TO REVIEW</span>
        <small>Newest first</small>
      </div>

      {/* Mistake List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="glass-card p-8 text-center mt-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center mb-3">
            <Icon name="check" size={24} />
          </div>
          <p className="text-white font-semibold text-sm">No mistakes recorded!</p>
          <p className="text-dark-400 text-xs mt-1">Keep speaking and practicing scenarios.</p>
        </div>
      ) : (
        <div className="mistake-list">
          {filteredMistakes.map((mistake, index) => (
            <div className="mistake-card" key={mistake._id}>
              <div className="card-topline">
                <span className={`type-tag type-${index % 3}`}>
                  {mistake.error_category || 'GRAMMAR'}
                </span>
                <small>{new Date(mistake.created_at).toLocaleDateString()}</small>
              </div>

              <div className="language-row wrong">
                <span>YOU SAID</span>
                <p>{mistake.original_text}</p>
              </div>

              <div className="language-row right">
                <span>NATIVE CORRECTION</span>
                <p>{mistake.corrected_text}</p>
              </div>

              {mistake.explanation && (
                <div className="rule-box">
                  <Icon name="spark" size={15} />
                  <p>{mistake.explanation}</p>
                </div>
              )}

              <button
                type="button"
                className="practice-action pressable w-full"
                onClick={() => {
                  if (!mistake.reviewed) {
                    handleReview(mistake._id);
                  }
                  navigate('/roadmap');
                }}
              >
                <Icon name={mistake.reviewed ? 'check' : 'mic'} size={16} />
                <span>{mistake.reviewed ? 'Mastered · Practice again' : 'Mark as Mastered'}</span>
                <Icon name="chevron" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
