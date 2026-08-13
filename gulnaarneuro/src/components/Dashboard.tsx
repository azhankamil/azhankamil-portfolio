import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { APP_CONFIG } from '../data/config';
import { getSubjects, getSubjectStats, getFlashcards, getUnit, getSubject } from '../data/store';
import { loadProgress, getSubjectProgress } from '../utils/storage';
import { CardsIcon, QuizIcon, GlossaryIcon, SearchIcon, HeartIcon } from './Icons';
import type { Subject } from '../data/types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessionInfo, setSessionInfo] = useState<{
    subjectCode: string;
    subjectName: string;
    unitTitle: string;
    cardCount: number;
    subjectId: string;
    unitId: string;
    cardIndex: number;
  } | null>(null);

  useEffect(() => {
    setSubjects(getSubjects());

    // Load last session info
    const progress = loadProgress();
    if (progress.lastStudySession) {
      const { subjectId, unitId, cardIndex } = progress.lastStudySession;
      const sub = getSubject(subjectId);
      const unit = getUnit(unitId);
      if (sub && unit) {
        // Count unit cards
        const unitCards = getFlashcards({ unitId });
        setSessionInfo({
          subjectId,
          unitId,
          cardIndex,
          subjectCode: sub.code,
          subjectName: sub.name,
          unitTitle: unit.title,
          cardCount: unitCards.length,
        });
      }
    }
  }, []);

  const handleSubjectClick = (subjectId: string) => {
    navigate(routes.subject(subjectId));
  };

  const handleRandomCards = () => {
    navigate(routes.flashcards(undefined, {}));
  };

  const handleQuickQuiz = () => {
    navigate(routes.quiz({ mode: 'quick' }));
  };

  const handleResumeSession = () => {
    if (sessionInfo) {
      navigate(routes.flashcards(sessionInfo.unitId));
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">NeuroScience</h1>
        <p className="dashboard__degree">{APP_CONFIG.degree}</p>
      </div>

      {/* Today's Study Section */}
      <section className="today">
        <h2 className="today__label">Today's Study</h2>
        {sessionInfo ? (
          <div>
            <p className="today__info">
              Continue where you left off on <span className="today__subject">{sessionInfo.subjectCode}</span>:
            </p>
            <p className="today__info" style={{ fontStyle: 'italic', color: 'var(--n-text-primary)', margin: 'var(--n-space-sm) 0' }}>
              {sessionInfo.unitTitle} (Card {sessionInfo.cardIndex + 1} / {sessionInfo.cardCount})
            </p>
            <button className="btn btn--primary btn--sm mt-md" onClick={handleResumeSession}>
              Continue Session
            </button>
          </div>
        ) : (
          <div>
            <p className="today__info">Start your first neuroscience study session.</p>
            <button className="btn btn--primary btn--sm mt-md" onClick={() => handleSubjectClick(subjects[0]?.id || 'BNT301')}>
              Start Learning
            </button>
          </div>
        )}
      </section>

      {/* Quick Study Actions */}
      <h2 className="section-label">Quick Actions</h2>
      <div className="quick-actions">
        <button className="btn btn--secondary" onClick={handleRandomCards}>
          <CardsIcon size={16} />
          <span>Surprise Me</span>
        </button>
        <button className="btn btn--secondary" onClick={handleQuickQuiz}>
          <QuizIcon size={16} />
          <span>Quick Quiz</span>
        </button>
        <button className="btn btn--secondary" onClick={() => navigate(routes.glossary())}>
          <GlossaryIcon size={16} />
          <span>Glossary</span>
        </button>
        <button className="btn btn--secondary" onClick={() => navigate(routes.search())}>
          <SearchIcon size={16} />
          <span>Search</span>
        </button>
      </div>

      {/* Subjects Section */}
      <h2 className="section-label">Subjects</h2>
      <div className="subjects-list">
        {subjects.map(subject => {
          const stats = getSubjectStats(subject.id);
          const allCards = getFlashcards({ subjectId: subject.id });
          const prog = getSubjectProgress(subject.id, allCards.map(c => c.id));
          return (
            <div key={subject.id} className="subject-card" onClick={() => handleSubjectClick(subject.id)}>
              <div className="subject-card__code">{subject.code}</div>
              <h3 className="subject-card__name">{subject.name}</h3>

              <div className="subject-card__stats">
                <div className="subject-card__stat">
                  <span>Units</span>
                  <span className="subject-card__stat-value">{stats.unitCount}</span>
                </div>
                <div className="subject-card__stat">
                  <span>Cards</span>
                  <span className="subject-card__stat-value">{stats.flashcardCount}</span>
                </div>
                <div className="subject-card__stat">
                  <span>MCQs</span>
                  <span className="subject-card__stat-value">{stats.mcqCount}</span>
                </div>
              </div>

              <div className="mb-md" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--n-text-xs)', color: 'var(--n-text-secondary)' }}>
                <span>Studied: {prog.cardsStudied} / {prog.totalCards} cards</span>
                <span>{prog.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${prog.percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="footer-note">
        <HeartIcon size={12} style={{ marginRight: 6, color: 'var(--n-accent)', verticalAlign: 'middle' }} />
        {APP_CONFIG.footerNote}
      </footer>
    </div>
  );
};
