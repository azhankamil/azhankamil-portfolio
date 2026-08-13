import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, routes } from '../utils/router';
import { getFlashcards, getUnit, getConcept } from '../data/store';
import type { Flashcard, CardRating, FlashcardFilters } from '../data/types';
import { rateCard, saveStudySession, loadProgress } from '../utils/storage';
import { CloseIcon, BackIcon, InfoIcon } from './Icons';
import { ErrorState } from './ErrorState';

interface FlashcardStudyProps {
  unitId?: string;
  conceptId?: string;
  subjectId?: string;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  unitId,
  conceptId,
  subjectId,
}) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [filters, setFilters] = useState<FlashcardFilters>({
    unitId,
    conceptId,
    subjectId,
    difficulty: undefined,
    examImportance: undefined,
    status: 'all',
  });

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Load and filter cards
  useEffect(() => {
    const rawCards = getFlashcards(filters);
    
    // Apply seen/unseen filters client-side to make it responsive
    const progress = loadProgress();
    let filtered = [...rawCards];
    
    if (filters.status === 'unseen') {
      filtered = filtered.filter(c => !progress.cardProgress[c.id]?.seen);
    } else if (filters.status === 'review') {
      filtered = filtered.filter(c => progress.cardProgress[c.id]?.rating === 'again' || progress.cardProgress[c.id]?.rating === 'hard');
    }

    setCards(filtered);
    
    // Resume session if matching unit
    if (unitId && progress.lastStudySession?.unitId === unitId) {
      const savedIndex = progress.lastStudySession.cardIndex;
      if (savedIndex >= 0 && savedIndex < filtered.length) {
        setCurrentIndex(savedIndex);
      } else {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(0);
    }
    setRevealed(false);
  }, [filters, unitId]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setRevealed(true);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, currentIndex, revealed]);

  // Save progress session on card change
  useEffect(() => {
    if (cards.length > 0 && cards[currentIndex]) {
      const card = cards[currentIndex];
      const actualUnitId = card.unitId;
      const unit = getUnit(actualUnitId);
      if (unit) {
        saveStudySession(unit.subjectId, actualUnitId, currentIndex, conceptId);
      }
    }
  }, [currentIndex, cards, conceptId]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleRating = (rating: CardRating) => {
    const card = cards[currentIndex];
    if (card) {
      rateCard(card.id, rating);
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRevealed(false);
    }
  };

  const handleExit = () => {
    if (unitId) {
      const unit = getUnit(unitId);
      if (unit) {
        navigate(routes.unit(unit.subjectId, unitId));
        return;
      }
    }
    if (conceptId) {
      navigate(routes.concept(conceptId));
      return;
    }
    navigate(routes.dashboard());
  };

  const handleFilterStatus = (status: FlashcardFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleFilterDifficulty = (difficulty: FlashcardFilters['difficulty']) => {
    setFilters(prev => ({ ...prev, difficulty }));
  };

  if (cards.length === 0) {
    return (
      <div className="flashcard-study">
        <header className="flashcard-study__header">
          <span className="flashcard-study__context">Study Mode</span>
          <button className="flashcard-study__close" onClick={handleExit} aria-label="Exit study mode">
            <CloseIcon size={24} />
          </button>
        </header>
        <div className="flashcard-study__body">
          <div className="filters-panel" style={{ width: '100%', maxWidth: 500 }}>
            <h3 className="filters-panel__title">Adjust Filters</h3>
            <div className="filters-panel__row">
              <button
                className={`filter-chip ${filters.status === 'all' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterStatus('all')}
              >
                All Cards
              </button>
              <button
                className={`filter-chip ${filters.status === 'unseen' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterStatus('unseen')}
              >
                Unseen
              </button>
              <button
                className={`filter-chip ${filters.status === 'review' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterStatus('review')}
              >
                Review List
              </button>
            </div>
            <div className="filters-panel__row">
              <button
                className={`filter-chip ${filters.difficulty === undefined ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterDifficulty(undefined)}
              >
                Any Difficulty
              </button>
              <button
                className={`filter-chip ${filters.difficulty === 'easy' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterDifficulty('easy')}
              >
                Easy
              </button>
              <button
                className={`filter-chip ${filters.difficulty === 'medium' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterDifficulty('medium')}
              >
                Medium
              </button>
              <button
                className={`filter-chip ${filters.difficulty === 'hard' ? 'filter-chip--active' : ''}`}
                onClick={() => handleFilterDifficulty('hard')}
              >
                Hard
              </button>
            </div>
          </div>
          <div className="empty-state">
            <InfoIcon size={32} className="empty-state__icon" />
            <p className="empty-state__message">No flashcards match the current filters.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="flashcard-study" ref={cardsContainerRef}>
      <header className="flashcard-study__header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="flashcard-study__context">
            {conceptId ? 'Topic Study' : unitId ? 'Unit Study' : 'All Cards'}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--n-text-muted)' }}>
            Difficulty: {currentCard.difficulty} · Importance: {currentCard.examImportance}
          </span>
        </div>
        <span className="flashcard-study__counter">
          {currentIndex + 1} / {cards.length}
        </span>
        <button className="flashcard-study__close" onClick={handleExit} aria-label="Exit study mode">
          <CloseIcon size={24} />
        </button>
      </header>

      <div className="flashcard-study__progress">
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flashcard-study__body">
        <div className="flashcard">
          <span className="flashcard__type-badge">
            {currentCard.cardType} card
          </span>

          <div className="flashcard__question">
            {currentCard.question}
          </div>

          {!revealed ? (
            <button className="btn btn--primary flashcard__reveal-btn" onClick={handleReveal}>
              Reveal Answer
            </button>
          ) : (
            <div className="flashcard__answer-area">
              <div className="flashcard__divider" />
              
              <h4 className="flashcard__answer-label">Answer</h4>
              <p className="flashcard__answer-text">{currentCard.answer}</p>
              
              {currentCard.explanation && (
                <>
                  <h4 className="flashcard__explanation-label">Explanation</h4>
                  <p className="flashcard__explanation-text">{currentCard.explanation}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="flashcard-study__footer">
        {revealed ? (
          <div className="flashcard-study__rating">
            <button className="btn btn--rating btn--again" onClick={() => handleRating('again')}>
              Again
            </button>
            <button className="btn btn--rating btn--hard" onClick={() => handleRating('hard')}>
              Hard
            </button>
            <button className="btn btn--rating btn--good" onClick={() => handleRating('good')}>
              Good
            </button>
            <button className="btn btn--rating btn--easy" onClick={() => handleRating('easy')}>
              Easy
            </button>
          </div>
        ) : (
          <div className="flashcard-study__nav">
            <button
              className="btn btn--secondary btn--sm"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              style={currentIndex === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              Previous
            </button>
            <span className="flashcard-study__nav-hint">Press Space to Reveal</span>
            <button
              className="btn btn--secondary btn--sm"
              disabled={currentIndex === cards.length - 1}
              onClick={handleNext}
              style={currentIndex === cards.length - 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              Skip
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
export default FlashcardStudy;
