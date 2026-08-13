import React, { useState, useEffect } from 'react';
import { getSubjects, getFlashcards } from '../data/store';
import type { Subject } from '../data/types';
import { loadProgress, getSubjectProgress, getQuizStats } from '../utils/storage';
import { ChartIcon, StarIcon } from './Icons';

export const ProgressView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    completionPercentage: 0,
    totalQuizzes: 0,
    avgQuizScore: 0,
    completedTopicsCount: 0,
  });

  useEffect(() => {
    const subList = getSubjects();
    setSubjects(subList);

    const progress = loadProgress();

    // Accumulate total cards and studied cards
    let totalCardsCount = 0;
    let studiedCardsCount = 0;

    subList.forEach(s => {
      const subjectCards = getFlashcards({ subjectId: s.id });
      const subjProg = getSubjectProgress(s.id, subjectCards.map(c => c.id));
      totalCardsCount += subjProg.totalCards;
      studiedCardsCount += subjProg.cardsStudied;
    });

    const quizStats = getQuizStats();

    setOverallStats({
      totalCards: totalCardsCount,
      studiedCards: studiedCardsCount,
      completionPercentage: totalCardsCount > 0 ? Math.round((studiedCardsCount / totalCardsCount) * 100) : 0,
      totalQuizzes: quizStats.attempts,
      avgQuizScore: quizStats.avgScore,
      completedTopicsCount: progress.topicsCompleted.length,
    });
  }, []);

  return (
    <div>
      <div className="mb-lg">
        <h1 className="dashboard__title">Study Analytics</h1>
        <p className="dashboard__degree">Track your learning progress across B.Sc. Neuroscience Technology</p>
      </div>

      {/* Overview Stats Grid */}
      <div className="quick-actions mb-xl">
        <div className="subject-card" style={{ flex: '1', minWidth: '140px', cursor: 'default' }}>
          <div className="subject-card__code">Overall Progress</div>
          <h3 className="subject-card__name" style={{ fontSize: 'var(--n-text-3xl)', color: 'var(--n-accent)', margin: 'var(--n-space-xs) 0' }}>
            {overallStats.completionPercentage}%
          </h3>
          <p style={{ fontSize: 'var(--n-text-xs)', color: 'var(--n-text-tertiary)' }}>
            {overallStats.studiedCards} / {overallStats.totalCards} cards studied
          </p>
        </div>

        <div className="subject-card" style={{ flex: '1', minWidth: '140px', cursor: 'default' }}>
          <div className="subject-card__code">Topics Completed</div>
          <h3 className="subject-card__name" style={{ fontSize: 'var(--n-text-3xl)', color: 'var(--n-info)', margin: 'var(--n-space-xs) 0' }}>
            {overallStats.completedTopicsCount}
          </h3>
          <p style={{ fontSize: 'var(--n-text-xs)', color: 'var(--n-text-tertiary)' }}>
            Total concepts understood
          </p>
        </div>

        <div className="subject-card" style={{ flex: '1', minWidth: '140px', cursor: 'default' }}>
          <div className="subject-card__code">Average Quiz Score</div>
          <h3 className="subject-card__name" style={{ fontSize: 'var(--n-text-3xl)', color: 'var(--n-success)', margin: 'var(--n-space-xs) 0' }}>
            {overallStats.avgQuizScore}%
          </h3>
          <p style={{ fontSize: 'var(--n-text-xs)', color: 'var(--n-text-tertiary)' }}>
            Across {overallStats.totalQuizzes} quiz attempts
          </p>
        </div>
      </div>

      {/* Subject-specific Progress */}
      <h2 className="section-label">Subject Breakdown</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--n-space-md)' }}>
        {subjects.map(s => {
          const subjectCards = getFlashcards({ subjectId: s.id });
          const prog = getSubjectProgress(s.id, subjectCards.map(c => c.id));
          const subQuizStats = getQuizStats(s.id);

          return (
            <div key={s.id} className="progress-view__subject">
              <div className="progress-view__subject-header">
                <div>
                  <span className="subject-card__code">{s.code}</span>
                  <h3 className="progress-view__subject-name">{s.name}</h3>
                </div>
                <div className="progress-view__subject-pct">{prog.percentage}%</div>
              </div>

              <div className="progress-bar mb-md">
                <div className="progress-bar__fill" style={{ width: `${prog.percentage}%` }} />
              </div>

              <div className="progress-view__stats">
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--n-text-secondary)' }}>
                    {prog.cardsStudied} / {prog.totalCards}
                  </p>
                  <p>Cards Studied</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--n-text-secondary)' }}>
                    {subQuizStats.attempts}
                  </p>
                  <p>Quiz Attempts</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--n-text-secondary)' }}>
                    {subQuizStats.bestScore}%
                  </p>
                  <p>Best Score</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ProgressView;
