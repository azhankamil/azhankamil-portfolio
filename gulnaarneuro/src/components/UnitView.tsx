import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { getUnit, getConcepts, getSubject } from '../data/store';
import type { Unit, Concept, Subject } from '../data/types';
import { ErrorState } from './ErrorState';
import { BookIcon, CardsIcon, QuizIcon } from './Icons';

interface UnitViewProps {
  subjectId: string;
  unitId: string;
}

export const UnitView: React.FC<UnitViewProps> = ({ subjectId, unitId }) => {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | undefined>(undefined);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [subject, setSubject] = useState<Subject | undefined>(undefined);

  useEffect(() => {
    setUnit(getUnit(unitId));
    setConcepts(getConcepts(unitId));
    setSubject(getSubject(subjectId));
  }, [subjectId, unitId]);

  if (!unit || !subject) {
    return <ErrorState title="Unit Not Found" message={`Could not load Unit with ID "${unitId}".`} />;
  }

  const handleConceptClick = (conceptId: string) => {
    navigate(routes.concept(conceptId));
  };

  return (
    <div>
      <div className="subject-header">
        <span className="subject-header__code">{subject.code} · UNIT {unit.unitNumber}</span>
        <h1 className="subject-header__name">{unit.title}</h1>
      </div>

      <div className="quick-actions">
        <button
          className="btn btn--primary"
          onClick={() => navigate(routes.flashcards(unitId))}
          disabled={concepts.length === 0}
        >
          <CardsIcon size={16} />
          <span>Study Unit Cards</span>
        </button>
        <button
          className="btn btn--secondary"
          onClick={() => navigate(routes.quiz({ mode: 'unit', unit: unitId, subject: subjectId }))}
          disabled={concepts.length === 0}
        >
          <QuizIcon size={16} />
          <span>Take Unit Quiz</span>
        </button>
      </div>

      <h2 className="section-label">Core Concepts</h2>

      {concepts.length === 0 ? (
        <div className="empty-state">
          <BookIcon size={32} className="empty-state__icon" />
          <p className="empty-state__message">No concepts available for this unit yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--n-space-sm)' }}>
          {concepts.map(concept => (
            <div
              key={concept.id}
              className="unit-card"
              onClick={() => handleConceptClick(concept.id)}
            >
              <h3 className="unit-card__title" style={{ margin: 0 }}>
                {concept.conceptName}
              </h3>
              {concept.topic && (
                <p style={{ fontSize: 'var(--n-text-xs)', color: 'var(--n-text-tertiary)', marginTop: 'var(--n-space-xs)' }}>
                  Topic: {concept.topic}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default UnitView;
