import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { getSubject, getUnits, getUnitStats, getFlashcardsForUnit, getMCQs } from '../data/store';
import type { Subject, Unit } from '../data/types';
import { ErrorState } from './ErrorState';
import { BookIcon, CardsIcon, QuizIcon } from './Icons';

interface SubjectViewProps {
  subjectId: string;
}

export const SubjectView: React.FC<SubjectViewProps> = ({ subjectId }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | undefined>(undefined);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    setSubject(getSubject(subjectId));
    setUnits(getUnits(subjectId));
  }, [subjectId]);

  if (!subject) {
    return <ErrorState title="Subject Not Found" message={`Could not load subject with ID "${subjectId}".`} />;
  }

  const handleUnitClick = (unitId: string) => {
    navigate(routes.unit(subjectId, unitId));
  };

  const handleStudyFlashcards = (e: React.MouseEvent, unitId: string) => {
    e.stopPropagation();
    navigate(routes.flashcards(unitId));
  };

  const handleTakeQuiz = (e: React.MouseEvent, unitId: string) => {
    e.stopPropagation();
    navigate(routes.quiz({ mode: 'unit', unit: unitId, subject: subjectId }));
  };

  return (
    <div>
      <div className="subject-header">
        <span className="subject-header__code">{subject.code}</span>
        <h1 className="subject-header__name">{subject.name}</h1>
        {subject.courseObjective && (
          <p className="mt-md" style={{ color: 'var(--n-text-secondary)', fontSize: 'var(--n-text-sm)', lineHeight: 1.6 }}>
            {subject.courseObjective}
          </p>
        )}
      </div>

      <h2 className="section-label">Units &amp; Chapters</h2>

      {units.length === 0 ? (
        <div className="empty-state">
          <BookIcon size={32} className="empty-state__icon" />
          <p className="empty-state__message">No units available for this subject yet.</p>
        </div>
      ) : (
        <div className="units-list">
          {units.map(unit => {
            const stats = getUnitStats(unit.id);
            const hasCards = stats.flashcardCount > 0;
            const hasQuiz = stats.mcqCount > 0;

            return (
              <div key={unit.id} className="unit-card" onClick={() => handleUnitClick(unit.id)}>
                <span className="unit-card__number">UNIT {unit.unitNumber}</span>
                <h3 className="unit-card__title">{unit.title}</h3>

                <div className="unit-card__meta">
                  <span>{stats.conceptCount} concepts</span>
                  <span>{stats.flashcardCount} cards</span>
                  <span>{stats.mcqCount} quizzes</span>
                </div>

                <div className="mt-md" style={{ display: 'flex', gap: 'var(--n-space-sm)' }}>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnitClick(unit.id);
                    }}
                  >
                    <BookIcon size={12} />
                    <span>Browse Topics</span>
                  </button>

                  <button
                    className="btn btn--secondary btn--sm"
                    disabled={!hasCards}
                    onClick={(e) => handleStudyFlashcards(e, unit.id)}
                    style={!hasCards ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    <CardsIcon size={12} />
                    <span>Flashcards</span>
                  </button>

                  <button
                    className="btn btn--secondary btn--sm"
                    disabled={!hasQuiz}
                    onClick={(e) => handleTakeQuiz(e, unit.id)}
                    style={!hasQuiz ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    <QuizIcon size={12} />
                    <span>Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SubjectView;
