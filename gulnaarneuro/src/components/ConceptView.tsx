import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { getConcept, getUnit, getFlashcardsForConcept, getMCQsForConcept } from '../data/store';
import type { Concept, Unit } from '../data/types';
import { ErrorState } from './ErrorState';
import { CardsIcon, QuizIcon, StarIcon } from './Icons';
import { markTopicCompleted } from '../utils/storage';

interface ConceptViewProps {
  conceptId: string;
}

export const ConceptView: React.FC<ConceptViewProps> = ({ conceptId }) => {
  const navigate = useNavigate();
  const [concept, setConcept] = useState<Concept | undefined>(undefined);
  const [unit, setUnit] = useState<Unit | undefined>(undefined);
  const [hasCards, setHasCards] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    const c = getConcept(conceptId);
    setConcept(c);
    if (c) {
      setUnit(getUnit(c.unitId));
      setHasCards(getFlashcardsForConcept(conceptId).length > 0);
      setHasQuiz(getMCQsForConcept(conceptId).length > 0);

      // Track completion
      markTopicCompleted(conceptId);
    }
  }, [conceptId]);

  if (!concept) {
    return <ErrorState title="Concept Not Found" message={`Could not load concept with ID "${conceptId}".`} />;
  }

  const handleStudyFlashcards = () => {
    navigate(routes.flashcards(concept.unitId, { concept: concept.id }));
  };

  const handleTakeQuiz = () => {
    navigate(routes.quiz({ mode: 'topic', concept: concept.id, unit: concept.unitId, subject: concept.subjectId }));
  };

  return (
    <div className="concept-view">
      <div className="mb-lg">
        <h1 className="concept-view__name">{concept.conceptName}</h1>
        <p className="concept-view__topic">
          {unit ? `Unit ${unit.unitNumber}: ${unit.title}` : ''}
          {concept.topic && ` · ${concept.topic}`}
        </p>
      </div>

      <div className="concept-badges">
        <span className="badge badge--level">
          Level: {concept.learningLevel}
        </span>
        <span className={`badge badge--importance-${concept.examImportance}`}>
          Importance: {concept.examImportance}
        </span>
      </div>

      {concept.simpleExplanation && (
        <section className="concept-section">
          <h2 className="concept-section__label">Simple Explanation</h2>
          <p className="concept-section__content">{concept.simpleExplanation}</p>
        </section>
      )}

      {concept.technicalExplanation && (
        <section className="concept-section">
          <h2 className="concept-section__label">Technical Breakdown</h2>
          <p className="concept-section__content">{concept.technicalExplanation}</p>
        </section>
      )}

      {concept.keyPoints && concept.keyPoints.length > 0 && (
        <section className="concept-section">
          <h2 className="concept-section__label">Key Takeaways</h2>
          <ul className="concept-section__list">
            {concept.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {concept.clinicalRelevance && (
        <section className="concept-section">
          <h2 className="concept-section__label">Clinical Application</h2>
          <p className="concept-section__content" style={{ color: 'var(--n-info)' }}>
            {concept.clinicalRelevance}
          </p>
        </section>
      )}

      {concept.examPoints && (
        <section className="concept-section" style={{ background: 'var(--n-bg-secondary)', padding: 'var(--n-space-md)', borderRadius: 'var(--n-radius-md)', borderLeft: '3px solid var(--n-warning)' }}>
          <h2 className="concept-section__label" style={{ color: 'var(--n-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarIcon size={12} />
            <span>Exam Focus</span>
          </h2>
          <p className="concept-section__content" style={{ fontSize: 'var(--n-text-sm)', color: 'var(--n-text-primary)' }}>
            {concept.examPoints}
          </p>
        </section>
      )}

      <div className="concept-actions mt-xl">
        <button
          className="btn btn--primary"
          disabled={!hasCards}
          onClick={handleStudyFlashcards}
          style={!hasCards ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <CardsIcon size={16} />
          <span>Study Topic Cards</span>
        </button>
        <button
          className="btn btn--secondary"
          disabled={!hasQuiz}
          onClick={handleTakeQuiz}
          style={!hasQuiz ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <QuizIcon size={16} />
          <span>Take Topic Quiz</span>
        </button>
      </div>
    </div>
  );
};
export default ConceptView;
