/* ──────────────────────────────────────────────
   Data normalization layer.
   Transforms raw JSON into clean application models
   and handles ID inconsistencies (BNT-301 vs BNT301).
   ────────────────────────────────────────────── */

import type {
  RawSubject, RawUnit, RawConcept, RawFlashcard, RawMCQ, RawGlossaryTerm,
  Subject, Unit, Concept, Flashcard, MCQ, GlossaryTerm,
} from './types';

/** Normalize subject_id: "BNT-301" → "BNT301" */
export function normalizeSubjectId(id: string): string {
  return id.replace(/-/g, '');
}

/** Get display code: "BNT301" → "BNT-301" */
export function toDisplayCode(id: string): string {
  const match = id.match(/^(BNT)(\d{3})$/);
  return match ? `${match[1]}-${match[2]}` : id;
}

// ─── Normalizers ────────────────────────────

export function normalizeSubject(raw: RawSubject): Subject {
  return {
    id: normalizeSubjectId(raw.subject_id),
    code: raw.code,
    name: raw.name,
    courseObjective: raw.course_objective,
    theoryHours: raw.theory_hours,
    practicalHours: raw.practical_hours,
  };
}

export function normalizeUnit(raw: RawUnit): Unit {
  return {
    id: raw.unit_id,
    subjectId: normalizeSubjectId(raw.subject_id),
    unitNumber: raw.unit_number,
    title: raw.title,
  };
}

export function normalizeConcept(raw: RawConcept): Concept {
  return {
    id: raw.id,
    subjectId: normalizeSubjectId(raw.subject_id),
    unitId: raw.unit_id,
    topic: raw.topic,
    conceptName: raw.concept_name,
    simpleExplanation: raw.simple_explanation,
    technicalExplanation: raw.technical_explanation,
    keyPoints: Array.isArray(raw.key_points) ? raw.key_points : [],
    clinicalRelevance: raw.clinical_relevance,
    examPoints: raw.exam_points,
    learningLevel: raw.learning_level || 'basic',
    examImportance: raw.exam_importance || 'medium',
    needsVerification: raw.needs_verification ?? false,
  };
}

export function normalizeFlashcard(raw: RawFlashcard): Flashcard {
  return {
    id: raw.id,
    conceptId: raw.concept_id,
    unitId: raw.unit_id,
    question: raw.question,
    answer: raw.answer,
    explanation: raw.explanation || '',
    cardType: raw.card_type || 'basic',
    difficulty: raw.difficulty || 'medium',
    examImportance: raw.exam_importance || 'medium',
    needsVerification: raw.needs_verification ?? false,
  };
}

export function normalizeMCQ(raw: RawMCQ): MCQ {
  return {
    id: raw.id,
    conceptId: raw.concept_id,
    unitId: raw.unit_id,
    question: raw.question,
    options: Array.isArray(raw.options) ? raw.options : [],
    correctOption: typeof raw.correct_option === 'number' ? raw.correct_option : 0,
    explanation: raw.explanation || '',
    difficulty: raw.difficulty || 'medium',
    examImportance: raw.exam_importance || 'medium',
    needsVerification: raw.needs_verification ?? false,
  };
}

export function normalizeGlossaryTerm(raw: RawGlossaryTerm): GlossaryTerm {
  return {
    id: raw.id,
    term: raw.term,
    abbreviation: raw.abbreviation || '',
    expandedForm: raw.expanded_form || '',
    simpleExplanation: raw.simple_explanation || '',
    technicalExplanation: raw.technical_explanation || '',
    unitId: raw.unit_id,
    relatedTopics: Array.isArray(raw.related_topics) ? raw.related_topics : [],
    needsVerification: raw.needs_verification ?? false,
  };
}

// ─── Batch normalizers ──────────────────────

export function normalizeSubjects(raw: RawSubject[]): Subject[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSubject);
}

export function normalizeUnits(raw: RawUnit[]): Unit[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeUnit);
}

export function normalizeConcepts(raw: RawConcept[]): Concept[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeConcept);
}

export function normalizeFlashcards(raw: RawFlashcard[]): Flashcard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeFlashcard);
}

export function normalizeMCQs(raw: RawMCQ[]): MCQ[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeMCQ);
}

export function normalizeGlossaryTerms(raw: RawGlossaryTerm[]): GlossaryTerm[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeGlossaryTerm);
}
