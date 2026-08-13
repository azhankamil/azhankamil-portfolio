/* ──────────────────────────────────────────────
   Core domain types for the neuroscience study app.
   These mirror the JSON schemas but provide
   TypeScript safety throughout the application.
   ────────────────────────────────────────────── */

// ─── Raw JSON shapes ────────────────────────

export interface RawSubject {
  subject_id: string;
  code: string;
  name: string;
  theory_hours?: number;
  practical_hours?: number;
  course_objective: string;
  unit_count: number;
  concept_count: number;
  flashcard_count: number;
  mcq_count: number;
  glossary_count: number;
  verification_note?: string;
}

export interface RawUnit {
  unit_id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  concept_count: number;
  flashcard_count: number;
  mcq_count: number;
  glossary_count: number;
}

export interface RawConcept {
  id: string;
  subject_id: string;
  unit_id: string;
  topic: string;
  concept_name: string;
  simple_explanation: string;
  technical_explanation: string;
  key_points: string[];
  clinical_relevance: string;
  exam_points: string;
  learning_level: 'basic' | 'intermediate' | 'advanced';
  exam_importance: 'high' | 'medium' | 'low';
  verification_risk: string;
  needs_verification: boolean;
}

export interface RawFlashcard {
  id: string;
  concept_id: string;
  unit_id: string;
  question: string;
  answer: string;
  explanation: string;
  card_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exam_importance: 'high' | 'medium' | 'low';
  verification_risk: string;
  needs_verification: boolean;
}

export interface RawMCQ {
  id: string;
  concept_id: string;
  unit_id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exam_importance: 'high' | 'medium' | 'low';
  verification_risk: string;
  needs_verification: boolean;
}

export interface RawGlossaryTerm {
  id: string;
  term: string;
  abbreviation: string;
  expanded_form: string;
  simple_explanation: string;
  technical_explanation: string;
  unit_id: string;
  related_topics: string[];
  verification_risk: string;
  needs_verification: boolean;
}

// ─── Normalized application types ───────────

export interface Subject {
  id: string;        // Normalized: "BNT301"
  code: string;      // Display: "BNT-301"
  name: string;
  courseObjective: string;
  theoryHours?: number;
  practicalHours?: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
}

export interface Concept {
  id: string;
  subjectId: string;
  unitId: string;
  topic: string;
  conceptName: string;
  simpleExplanation: string;
  technicalExplanation: string;
  keyPoints: string[];
  clinicalRelevance: string;
  examPoints: string;
  learningLevel: 'basic' | 'intermediate' | 'advanced';
  examImportance: 'high' | 'medium' | 'low';
  needsVerification: boolean;
}

export interface Flashcard {
  id: string;
  conceptId: string;
  unitId: string;
  question: string;
  answer: string;
  explanation: string;
  cardType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examImportance: 'high' | 'medium' | 'low';
  needsVerification: boolean;
}

export interface MCQ {
  id: string;
  conceptId: string;
  unitId: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examImportance: 'high' | 'medium' | 'low';
  needsVerification: boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  abbreviation: string;
  expandedForm: string;
  simpleExplanation: string;
  technicalExplanation: string;
  unitId: string;
  relatedTopics: string[];
  needsVerification: boolean;
}

// ─── Progress types ─────────────────────────

export type CardRating = 'again' | 'hard' | 'good' | 'easy';

export interface CardProgress {
  cardId: string;
  seen: boolean;
  timesSeen: number;
  lastSeen: string;     // ISO date string
  rating: CardRating | null;
}

export interface QuizAttempt {
  quizId: string;
  subjectId: string;
  unitId?: string;
  date: string;          // ISO date string
  totalQuestions: number;
  correctAnswers: number;
  score: number;         // percentage
}

export interface StudyProgress {
  cardProgress: Record<string, CardProgress>;
  quizAttempts: QuizAttempt[];
  lastStudySession: {
    subjectId: string;
    unitId: string;
    conceptId?: string;
    cardIndex: number;
    timestamp: string;
  } | null;
  recentlyViewedCards: string[];
  topicsCompleted: string[];     // concept IDs
}

// ─── Filter types ───────────────────────────

export interface FlashcardFilters {
  subjectId?: string;
  unitId?: string;
  conceptId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  examImportance?: 'high' | 'medium' | 'low';
  cardType?: string;
  status?: 'all' | 'unseen' | 'review';
}

export interface QuizMode {
  type: 'quick' | 'topic' | 'unit' | 'subject';
  subjectId?: string;
  unitId?: string;
  conceptId?: string;
  questionCount?: number;
}

// ─── Search types ───────────────────────────

export interface SearchResult {
  type: 'concept' | 'flashcard' | 'mcq' | 'glossary';
  id: string;
  title: string;
  subtitle: string;
  subjectCode: string;
  unitId: string;
  matchText: string;
}

// ─── Route types ────────────────────────────

export type Route =
  | { page: 'welcome' }
  | { page: 'dashboard' }
  | { page: 'subject'; subjectId: string }
  | { page: 'unit'; subjectId: string; unitId: string }
  | { page: 'concept'; conceptId: string }
  | { page: 'flashcards'; unitId?: string; conceptId?: string; subjectId?: string }
  | { page: 'quiz'; mode: QuizMode }
  | { page: 'glossary' }
  | { page: 'search'; query?: string }
  | { page: 'progress' };
