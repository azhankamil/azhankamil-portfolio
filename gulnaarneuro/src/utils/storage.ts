/* ──────────────────────────────────────────────
   localStorage-based progress tracking.
   Structured for future spaced repetition support.
   ────────────────────────────────────────────── */

import type { StudyProgress, CardProgress, CardRating, QuizAttempt } from '../data/types';
import { APP_CONFIG } from '../data/config';

const STORAGE_KEY = 'gulnaar_neuro_progress';

function getDefaultProgress(): StudyProgress {
  return {
    cardProgress: {},
    quizAttempts: [],
    lastStudySession: null,
    recentlyViewedCards: [],
    topicsCompleted: [],
  };
}

export function loadProgress(): StudyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw);
    return { ...getDefaultProgress(), ...parsed };
  } catch {
    console.warn('[NeuroStorage] Failed to load progress, starting fresh.');
    return getDefaultProgress();
  }
}

export function saveProgress(progress: StudyProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('[NeuroStorage] Failed to save progress:', e);
  }
}

// ─── Card progress ──────────────────────────

export function markCardSeen(cardId: string, rating?: CardRating): StudyProgress {
  const progress = loadProgress();
  const existing = progress.cardProgress[cardId];
  const now = new Date().toISOString();

  progress.cardProgress[cardId] = {
    cardId,
    seen: true,
    timesSeen: (existing?.timesSeen || 0) + 1,
    lastSeen: now,
    rating: rating ?? existing?.rating ?? null,
  };

  // Track recently viewed
  progress.recentlyViewedCards = [
    cardId,
    ...progress.recentlyViewedCards.filter(id => id !== cardId),
  ].slice(0, APP_CONFIG.recentlyViewedMax);

  saveProgress(progress);
  return progress;
}

export function rateCard(cardId: string, rating: CardRating): StudyProgress {
  return markCardSeen(cardId, rating);
}

export function getCardProgress(cardId: string): CardProgress | null {
  const progress = loadProgress();
  return progress.cardProgress[cardId] || null;
}

// ─── Quiz progress ──────────────────────────

export function saveQuizAttempt(attempt: Omit<QuizAttempt, 'date'>): StudyProgress {
  const progress = loadProgress();
  progress.quizAttempts.push({
    ...attempt,
    date: new Date().toISOString(),
  });
  saveProgress(progress);
  return progress;
}

// ─── Session tracking ───────────────────────

export function saveStudySession(
  subjectId: string,
  unitId: string,
  cardIndex: number,
  conceptId?: string
): StudyProgress {
  const progress = loadProgress();
  progress.lastStudySession = {
    subjectId,
    unitId,
    conceptId,
    cardIndex,
    timestamp: new Date().toISOString(),
  };
  saveProgress(progress);
  return progress;
}

// ─── Topic completion ───────────────────────

export function markTopicCompleted(conceptId: string): StudyProgress {
  const progress = loadProgress();
  if (!progress.topicsCompleted.includes(conceptId)) {
    progress.topicsCompleted.push(conceptId);
    saveProgress(progress);
  }
  return progress;
}

// ─── Stats ──────────────────────────────────

export function getSubjectProgress(subjectId: string, flashcardIds: string[]): {
  cardsStudied: number;
  totalCards: number;
  percentage: number;
} {
  const progress = loadProgress();
  const studied = flashcardIds.filter(id => progress.cardProgress[id]?.seen).length;
  const total = flashcardIds.length;
  return {
    cardsStudied: studied,
    totalCards: total,
    percentage: total > 0 ? Math.round((studied / total) * 100) : 0,
  };
}

export function getQuizStats(subjectId?: string): {
  attempts: number;
  avgScore: number;
  bestScore: number;
} {
  const progress = loadProgress();
  let attempts = progress.quizAttempts;
  if (subjectId) {
    attempts = attempts.filter(a => a.subjectId === subjectId);
  }
  const scores = attempts.map(a => a.score);
  return {
    attempts: attempts.length,
    avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
  };
}

export function hasWelcomed(): boolean {
  try {
    return localStorage.getItem('gulnaar_neuro_welcomed') === 'true';
  } catch {
    return false;
  }
}

export function setWelcomed(): void {
  try {
    localStorage.setItem('gulnaar_neuro_welcomed', 'true');
  } catch { /* ignore */ }
}
