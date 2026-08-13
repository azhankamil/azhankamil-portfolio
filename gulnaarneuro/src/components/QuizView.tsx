import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { getMCQs, getMCQsForConcept, getUnit, getSubject } from '../data/store';
import type { MCQ, QuizMode } from '../data/types';
import { saveQuizAttempt } from '../utils/storage';
import { CloseIcon, CheckIcon, InfoIcon } from './Icons';
import { ErrorState } from './ErrorState';

interface QuizViewProps {
  mode: QuizMode;
}

export const QuizView: React.FC<QuizViewProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState<{ questionId: string; correct: boolean }[]>([]);

  // Load questions based on mode
  useEffect(() => {
    let pool: MCQ[] = [];
    if (mode.type === 'quick') {
      pool = getMCQs(undefined, undefined);
    } else if (mode.type === 'topic' && mode.conceptId) {
      pool = getMCQsForConcept(mode.conceptId);
    } else if (mode.type === 'unit' && mode.unitId) {
      pool = getMCQs(mode.unitId);
    } else if (mode.type === 'subject' && mode.subjectId) {
      pool = getMCQs(undefined, mode.subjectId);
    }

    // Shuffle and pick subset if quick mode
    let quizSet = [...pool];
    if (mode.type === 'quick') {
      quizSet = quizSet.sort(() => Math.random() - 0.5).slice(0, mode.questionCount || 10);
    } else {
      // General shuffle for non-static ordering
      quizSet = quizSet.sort(() => Math.random() - 0.5);
    }

    setQuestions(quizSet);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setAnswersLog([]);
  }, [mode]);

  const handleOptionSelect = (optionIndex: number) => {
    if (submitted) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || submitted) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctOption;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev,
      { questionId: currentQuestion.id, correct: isCorrect },
    ]);

    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setFinished(true);
    // Save quiz attempt progress
    const finalScorePct = Math.round((score / questions.length) * 100);
    saveQuizAttempt({
      quizId: `${mode.type}_${Date.now()}`,
      subjectId: mode.subjectId || getSubjectFromUnit(mode.unitId) || 'BNT301',
      unitId: mode.unitId,
      totalQuestions: questions.length,
      correctAnswers: score,
      score: finalScorePct,
    });
  };

  const getSubjectFromUnit = (unitId?: string) => {
    if (!unitId) return undefined;
    const unit = getUnit(unitId);
    return unit?.subjectId;
  };

  const handleExit = () => {
    if (mode.subjectId) {
      navigate(routes.subject(mode.subjectId));
      return;
    }
    navigate(routes.dashboard());
  };

  if (questions.length === 0) {
    return (
      <div className="quiz">
        <header className="quiz__header">
          <span className="quiz__progress-text">Quiz Mode</span>
          <button className="flashcard-study__close" onClick={handleExit} aria-label="Exit quiz">
            <CloseIcon size={24} />
          </button>
        </header>
        <div className="quiz__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorState
            title="Quiz Unavailable"
            message="Quiz questions aren't available for this selection yet."
          />
        </div>
      </div>
    );
  }

  if (finished) {
    const scorePct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz">
        <header className="quiz__header">
          <span className="quiz__progress-text">Quiz Results</span>
          <button className="flashcard-study__close" onClick={handleExit} aria-label="Exit results">
            <CloseIcon size={24} />
          </button>
        </header>
        <div className="quiz__body">
          <div className="quiz-results">
            <div className="quiz-results__score">{scorePct}%</div>
            <p className="quiz-results__label">
              You answered {score} out of {questions.length} questions correctly.
            </p>

            <div className="quiz-results__stats">
              <div className="quiz-results__stat">
                <span className="quiz-results__stat-value quiz-results__stat-value--correct">{score}</span>
                <span className="quiz-results__stat-label">Correct</span>
              </div>
              <div className="quiz-results__stat">
                <span className="quiz-results__stat-value quiz-results__stat-value--incorrect">
                  {questions.length - score}
                </span>
                <span className="quiz-results__stat-label">Incorrect</span>
              </div>
            </div>

            <div className="quiz-results__actions">
              <button
                className="btn btn--primary"
                onClick={() => {
                  setFinished(false);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setSubmitted(false);
                  setScore(0);
                  setAnswersLog([]);
                }}
              >
                Retry Quiz
              </button>
              <button className="btn btn--secondary" onClick={handleExit}>
                Return
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz">
      <header className="quiz__header">
        <span className="quiz__progress-text">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <button className="flashcard-study__close" onClick={handleExit} aria-label="Exit quiz">
          <CloseIcon size={24} />
        </button>
      </header>

      <div className="quiz__body">
        <div className="quiz__question">{currentQuestion.question}</div>

        <div className="quiz__options">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = 'quiz__option';
            if (selectedOption === idx) optionClass += ' quiz__option--selected';
            if (submitted) {
              optionClass += ' quiz__option--disabled';
              if (idx === currentQuestion.correctOption) {
                optionClass += ' quiz__option--correct';
              } else if (selectedOption === idx) {
                optionClass += ' quiz__option--incorrect';
              }
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleOptionSelect(idx)}
                disabled={submitted}
              >
                <span className="quiz__option-letter">{optionLetters[idx]}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {submitted && currentQuestion.explanation && (
          <div className="quiz__explanation">
            <h4 className="quiz__explanation-label">Explanation</h4>
            <p className="quiz__explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <footer className="quiz__footer">
        {!submitted ? (
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={selectedOption === null}
            style={selectedOption === null ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Submit Answer
          </button>
        ) : (
          <button className="btn btn--primary" onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </footer>
    </div>
  );
};
export default QuizView;
