import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { useUserId } from '../hooks/useUserId';
import { getProgress, getMistakes, getCurriculums } from '../lib/api';
import { UserProgress, Mistake, Curriculum } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useUserId();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          const [progRes, mistRes, currRes] = await Promise.all([
            getProgress(userId).catch(() => ({ data: null })),
            getMistakes(userId).catch(() => ({ data: [] })),
            getCurriculums().catch(() => ({ data: [] })),
          ]);
          if (progRes.data) setProgress(progRes.data);
          if (mistRes.data) setMistakes(mistRes.data);
          if (currRes.data) setCurriculums(currRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const fluencyScore = progress?.overall_fluency_score || 0;
  const completedScenarios = progress?.completed_scenarios || [];
  const completedCount = completedScenarios.length;
  const unreviewedMistakes = mistakes.filter((m) => !m.reviewed).length;
  const masteredMistakes = mistakes.filter((m) => m.reviewed).length;
  const level = progress?.current_level || 'A2';

  // Target scenario to continue: find first uncompleted scenario in active curriculum
  const activeCurriculum = curriculums.find((c) => c.level === level) || curriculums[0];
  let targetChapterId = 'A2_CH01';
  let targetScenarioId = 'A2_CH01_SC01';
  let targetChapterTitle = 'Kennenlernen im Kurs';
  let targetChapterNumber = 1;

  if (activeCurriculum && activeCurriculum.chapters?.length > 0) {
    const firstUnfinishedChapter = activeCurriculum.chapters.find((ch) =>
      ch.scenarios?.some(
        (sc) => !completedScenarios.some((cs) => cs.scenario_id === sc.scenario_id)
      )
    ) || activeCurriculum.chapters[0];

    if (firstUnfinishedChapter) {
      targetChapterId = firstUnfinishedChapter.chapter_id;
      targetChapterTitle = firstUnfinishedChapter.title;
      targetChapterNumber = firstUnfinishedChapter.chapter_number;
      const unfinishedScenario = firstUnfinishedChapter.scenarios?.find(
        (sc) => !completedScenarios.some((cs) => cs.scenario_id === sc.scenario_id)
      ) || firstUnfinishedChapter.scenarios?.[0];

      if (unfinishedScenario) {
        targetScenarioId = unfinishedScenario.scenario_id;
      }
    }
  }

  const handleStartPractice = () => {
    navigate(`/practice/${level}/${targetChapterId}/${targetScenarioId}`);
  };

  // Progress calculations
  const totalScenariosCount = activeCurriculum?.chapters?.reduce(
    (acc, ch) => acc + (ch.scenarios?.length || 0),
    0
  ) || 12;
  const progressPercent = Math.min(Math.round((completedCount / totalScenariosCount) * 100), 100);
  const ringOffset = 207 - (207 * (progressPercent || 0)) / 100;

  return (
    <div className="screen home-screen">
      {/* Header */}
      <header className="home-header">
        <Link to="/profile" className="avatar pressable" title="View Profile">
          <span>FF</span>
          <i />
        </Link>
        <div className="header-chips">
          <div className="status-chip streak">
            <Icon name="flame" size={17} />
            <b>{completedCount > 0 ? 1 : 0}</b>
          </div>
          <div className="status-chip score">
            <Icon name="spark" size={16} />
            <b>{fluencyScore}</b>
          </div>
          <Link to="/roadmap" className="status-chip level pressable">
            <b>{level}</b>
            <Icon name="chevron" size={14} />
          </Link>
        </div>
      </header>

      {/* Greeting */}
      <div className="greeting">
        <p className="eyebrow">WILLKOMMEN BEI FRANKENFLUENT</p>
        <p className="display-title">
          Ready to get <span>fluent?</span>
        </p>
      </div>

      {/* Hero Card */}
      <div className="hero-card">
        <div className="hero-glow" />
        <div className="hero-top">
          <div>
            <div className="mini-label">
              <Icon name="target" size={15} /> TODAY'S GOAL
            </div>
            <p className="hero-title">Daily conversation</p>
            <p className="hero-subtitle">
              {completedCount === 0
                ? 'Complete your first roleplay to start your streak.'
                : `${completedCount} scenario${completedCount > 1 ? 's' : ''} mastered. Keep practicing!`}
            </p>
          </div>
          <div className="progress-ring">
            <svg viewBox="0 0 80 80">
              <circle className="ring-track" cx="40" cy="40" r="33" />
              <circle
                className="ring-value"
                cx="40"
                cy="40"
                r="33"
                style={{ strokeDashoffset: ringOffset }}
              />
            </svg>
            <div>
              <b>{completedCount}</b>
              <span>/{totalScenariosCount}</span>
            </div>
          </div>
        </div>
        <button className="primary-cta pressable w-full" onClick={handleStartPractice}>
          <span className="cta-icon">
            <Icon name="mic" size={20} />
          </span>
          <span>Start speaking</span>
          <Icon name="chevron" size={20} />
        </button>
      </div>

      {/* Progress Section */}
      <div className="section-heading">
        <p>YOUR PROGRESS</p>
        <span>Real-time</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon mint">
            <Icon name="trend" size={18} />
          </div>
          <p className="stat-value">{fluencyScore}</p>
          <p className="stat-label">Fluency score</p>
          <p className="stat-note mint">+10 XP per turn</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Icon name="grid" size={18} />
          </div>
          <p className="stat-value">{completedCount}</p>
          <p className="stat-label">Scenarios done</p>
          <p className="stat-note blue">{totalScenariosCount - completedCount} left</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon coral">
            <Icon name="mistakes" size={18} />
          </div>
          <p className="stat-value">{unreviewedMistakes}</p>
          <p className="stat-label">Mistakes to review</p>
          <p className="stat-note coral">{masteredMistakes} reviewed</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Icon name="target" size={18} />
          </div>
          <p className="stat-value">{progressPercent}%</p>
          <p className="stat-label">{level} progress</p>
          <p className="stat-note purple">Curriculum path</p>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="section-heading resume-heading">
        <p>CONTINUE LEARNING</p>
        <Link to="/roadmap" className="text-dark-400 hover:text-brand-400 text-xs">
          See all
        </Link>
      </div>

      <div className="resume-card pressable" onClick={handleStartPractice}>
        <div className="resume-art">
          <div className="bubble one" />
          <div className="bubble two" />
          <div className="person p1">
            <span />
          </div>
          <div className="person p2">
            <span />
          </div>
        </div>
        <div className="resume-copy">
          <span>CHAPTER {targetChapterNumber} · SCENARIO</span>
          <p>{targetChapterTitle}</p>
          <small>Interactive AI Roleplay</small>
        </div>
        <div className="play-button">
          <Icon name="play" size={17} />
        </div>
      </div>
    </div>
  );
};
