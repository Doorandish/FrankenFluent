import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurriculums, getProgress } from '../lib/api';
import { Curriculum, Chapter, UserProgress } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Icon } from '../components/common/Icon';
import { useUserId } from '../hooks/useUserId';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useUserId();

  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<string>('A2');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currRes, progRes] = await Promise.all([
          getCurriculums().catch(() => ({ data: [] })),
          userId ? getProgress(userId).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        ]);

        setCurriculums(currRes.data);
        if (progRes.data) setUserProgress(progRes.data);

        if (currRes.data.length > 0) {
          const userLevel = progRes.data?.current_level;
          const matched = currRes.data.find((c) => c.level === userLevel);
          setActiveLevel(matched ? matched.level : currRes.data[0].level);
        }
      } catch (error) {
        console.error('Failed to fetch roadmap data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="screen flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  const activeCurriculum = curriculums.find((c) => c.level === activeLevel) || curriculums[0];
  const chapters: Chapter[] = activeCurriculum?.chapters || [];
  const completedScenarios = userProgress?.completed_scenarios || [];

  // Determine completion of chapters
  const getChapterState = (chapter: Chapter, index: number): 'complete' | 'active' | 'locked' => {
    const totalScenarios = chapter.scenarios?.length || 0;
    const completedInChapter = (chapter.scenarios || []).filter((sc) =>
      completedScenarios.some((cs) => cs.scenario_id === sc.scenario_id)
    ).length;

    if (totalScenarios > 0 && completedInChapter === totalScenarios) {
      return 'complete';
    }

    // If first unfinished chapter, it is active
    const isFirstUnfinished =
      index === 0 ||
      chapters.slice(0, index).every((prevCh) => {
        return (prevCh.scenarios || []).every((sc) =>
          completedScenarios.some((cs) => cs.scenario_id === sc.scenario_id)
        );
      });

    if (isFirstUnfinished) return 'active';
    return 'locked';
  };

  const totalScenarios = chapters.reduce((sum, ch) => sum + (ch.scenarios?.length || 0), 0);
  const completedCount = completedScenarios.filter((cs) =>
    chapters.some((ch) => ch.scenarios?.some((sc) => sc.scenario_id === cs.scenario_id))
  ).length;
  const progressPercent = totalScenarios > 0 ? Math.round((completedCount / totalScenarios) * 100) : 0;

  // Selected chapter for the milestone bottom sheet
  const activeChapter = chapters[selectedChapterIndex] || chapters[0];
  const targetScenario =
    activeChapter?.scenarios?.find(
      (sc) => !completedScenarios.some((cs) => cs.scenario_id === sc.scenario_id)
    ) || activeChapter?.scenarios?.[0];

  const handleStartScenario = () => {
    if (activeChapter && targetScenario) {
      navigate(`/practice/${activeLevel}/${activeChapter.chapter_id}/${targetScenario.scenario_id}`);
    }
  };

  const toggleLevel = () => {
    if (curriculums.length > 1) {
      const other = curriculums.find((c) => c.level !== activeLevel);
      if (other) {
        setActiveLevel(other.level);
        setSelectedChapterIndex(0);
      }
    }
  };

  return (
    <div className="screen roadmap-screen">
      {/* Header */}
      <div className="roadmap-header">
        <div>
          <p className="eyebrow">YOUR ROADMAP</p>
          <p className="page-title">Level {activeLevel}</p>
        </div>
        <button className="level-switch pressable" onClick={toggleLevel} title="Switch Level">
          <span>{activeLevel}</span>
          <Icon name="chevron" size={15} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="level-progress">
        <div>
          <span>{activeLevel === 'A2' ? 'Elementary German (A2)' : 'Intermediate German (B1)'}</span>
          <b>{progressPercent}%</b>
        </div>
        <div className="progress-track">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Wavy Roadmap Timeline Path */}
      <div className="roadmap-path">
        <svg className="path-line" viewBox="0 0 300 560" preserveAspectRatio="none">
          <path d="M88 28 C270 75 267 145 102 180 C-12 205 20 290 190 310 C310 325 280 425 115 448 C22 460 40 520 130 548" />
        </svg>

        {chapters.slice(0, 5).map((chapter, index) => {
          const state = getChapterState(chapter, index);
          const isSelected = selectedChapterIndex === index;
          const side = index % 2 === 0 ? 'left' : 'right';

          return (
            <div
              key={chapter.chapter_id}
              className={`path-row ${side} pressable ${isSelected ? 'ring-1 ring-brand-500/30 rounded-2xl' : ''}`}
              onClick={() => setSelectedChapterIndex(index)}
            >
              <div className={`path-node ${state}`}>
                {state === 'complete' ? (
                  <Icon name="check" size={25} />
                ) : state === 'locked' ? (
                  <Icon name="lock" size={20} />
                ) : (
                  <Icon name="play" size={23} />
                )}
                {state === 'active' && <i />}
              </div>

              <div className="node-label">
                <small>
                  {state === 'active'
                    ? 'CURRENT CHAPTER'
                    : `CHAPTER ${chapter.chapter_number}`}
                </small>
                <p>{chapter.title}</p>
                <span>{chapter.scenarios?.length || 0} scenarios</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Bottom Sheet */}
      {activeChapter && (
        <div className="milestone-sheet">
          <div className="sheet-handle" />
          <div className="milestone-top">
            <div className="milestone-icon">
              <Icon name="spark" size={22} />
            </div>
            <div>
              <span>CHAPTER {activeChapter.chapter_number}</span>
              <p>{activeChapter.title}</p>
            </div>
            <div className="xp-pill">+120 XP</div>
          </div>

          <p className="sheet-description">
            {activeChapter.learning_goals?.[0] || 'Master conversational Redemittel and speaking fluency.'}
          </p>

          <div className="goal-row">
            <div>
              <Icon name="book" size={17} />
              <span>
                <b>{activeChapter.key_redemittel?.length || 0}</b> Redemittel
              </span>
            </div>
            <div>
              <Icon name="target" size={17} />
              <span>
                <b>{activeChapter.scenarios?.length || 0}</b> scenarios
              </span>
            </div>
          </div>

          <button className="primary-cta compact pressable w-full" onClick={handleStartScenario}>
            <span>Begin scenario</span>
            <Icon name="chevron" size={19} />
          </button>
        </div>
      )}
    </div>
  );
};
