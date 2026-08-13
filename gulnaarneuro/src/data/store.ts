/* ──────────────────────────────────────────────
   Data store — loads, normalizes, and provides
   all neuroscience content to the application.
   Single source of truth for all data access.
   ────────────────────────────────────────────── */

import type {
  Subject, Unit, Concept, Flashcard, MCQ, GlossaryTerm,
  FlashcardFilters, SearchResult,
} from './types';
import { normalizeSubjectId, toDisplayCode } from './normalize';
import {
  normalizeSubjects, normalizeUnits, normalizeConcepts,
  normalizeFlashcards, normalizeMCQs, normalizeGlossaryTerms,
} from './normalize';

// ─── Raw data imports ───────────────────────
import rawSubjects from './subjects.json';
import rawUnits from './units.json';
import rawConcepts from './concepts.json';
import rawFlashcards from './flashcards.json';
import rawMCQs from './mcqs.json';
import rawGlossary from './glossary.json';

// ─── Normalized data ────────────────────────
let _subjects: Subject[] = [];
let _units: Unit[] = [];
let _concepts: Concept[] = [];
let _flashcards: Flashcard[] = [];
let _mcqs: MCQ[] = [];
let _glossary: GlossaryTerm[] = [];
let _initialized = false;

function ensureInit() {
  if (_initialized) return;
  try {
    _subjects = normalizeSubjects(rawSubjects as any[]);
    _units = normalizeUnits(rawUnits as any[]);
    _concepts = normalizeConcepts(rawConcepts as any[]);
    _flashcards = normalizeFlashcards(rawFlashcards as any[]);
    _mcqs = normalizeMCQs(rawMCQs as any[]);
    _glossary = normalizeGlossaryTerms(rawGlossary as any[]);
    _initialized = true;
  } catch (e) {
    console.error('[NeuroData] Failed to initialize data:', e);
    _initialized = true; // Prevent infinite retries
  }
}

// ─── Subjects ───────────────────────────────

export function getSubjects(): Subject[] {
  ensureInit();
  return _subjects;
}

export function getSubject(subjectId: string): Subject | undefined {
  ensureInit();
  const nid = normalizeSubjectId(subjectId);
  return _subjects.find(s => s.id === nid);
}

// ─── Units ──────────────────────────────────

export function getUnits(subjectId: string): Unit[] {
  ensureInit();
  const nid = normalizeSubjectId(subjectId);
  return _units
    .filter(u => u.subjectId === nid)
    .sort((a, b) => a.unitNumber - b.unitNumber);
}

export function getUnit(unitId: string): Unit | undefined {
  ensureInit();
  return _units.find(u => u.id === unitId);
}

export function getUnitSubjectId(unitId: string): string | undefined {
  const unit = getUnit(unitId);
  return unit?.subjectId;
}

// ─── Concepts ───────────────────────────────

export function getConcepts(unitId: string): Concept[] {
  ensureInit();
  return _concepts.filter(c => c.unitId === unitId);
}

export function getConceptsForSubject(subjectId: string): Concept[] {
  ensureInit();
  const nid = normalizeSubjectId(subjectId);
  return _concepts.filter(c => c.subjectId === nid);
}

export function getConcept(conceptId: string): Concept | undefined {
  ensureInit();
  return _concepts.find(c => c.id === conceptId);
}

// ─── Flashcards ─────────────────────────────

export function getFlashcards(filters?: FlashcardFilters): Flashcard[] {
  ensureInit();
  let cards = [..._flashcards];

  if (!filters) return cards;

  if (filters.subjectId) {
    const unitIds = getUnits(filters.subjectId).map(u => u.id);
    cards = cards.filter(c => unitIds.includes(c.unitId));
  }
  if (filters.unitId) {
    cards = cards.filter(c => c.unitId === filters.unitId);
  }
  if (filters.conceptId) {
    cards = cards.filter(c => c.conceptId === filters.conceptId);
  }
  if (filters.difficulty) {
    cards = cards.filter(c => c.difficulty === filters.difficulty);
  }
  if (filters.examImportance) {
    cards = cards.filter(c => c.examImportance === filters.examImportance);
  }
  if (filters.cardType) {
    cards = cards.filter(c => c.cardType === filters.cardType);
  }

  return cards;
}

export function getFlashcardsForConcept(conceptId: string): Flashcard[] {
  return getFlashcards({ conceptId });
}

export function getFlashcardsForUnit(unitId: string): Flashcard[] {
  return getFlashcards({ unitId });
}

// ─── MCQs ───────────────────────────────────

export function getMCQs(unitId?: string, subjectId?: string): MCQ[] {
  ensureInit();
  let questions = [..._mcqs];

  if (unitId) {
    questions = questions.filter(m => m.unitId === unitId);
  } else if (subjectId) {
    const unitIds = getUnits(subjectId).map(u => u.id);
    questions = questions.filter(m => unitIds.includes(m.unitId));
  }

  return questions;
}

export function getMCQsForConcept(conceptId: string): MCQ[] {
  ensureInit();
  return _mcqs.filter(m => m.conceptId === conceptId);
}

// ─── Glossary ───────────────────────────────

export function getGlossaryTerms(query?: string, subjectId?: string, unitId?: string): GlossaryTerm[] {
  ensureInit();
  let terms = [..._glossary];

  if (unitId) {
    terms = terms.filter(t => t.unitId === unitId);
  } else if (subjectId) {
    const unitIds = getUnits(subjectId).map(u => u.id);
    terms = terms.filter(t => unitIds.includes(t.unitId));
  }

  if (query) {
    const q = query.toLowerCase();
    terms = terms.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.expandedForm.toLowerCase().includes(q) ||
      t.simpleExplanation.toLowerCase().includes(q)
    );
  }

  return terms.sort((a, b) => a.term.localeCompare(b.term));
}

// ─── Stats ──────────────────────────────────

export function getSubjectStats(subjectId: string) {
  const nid = normalizeSubjectId(subjectId);
  const units = getUnits(nid);
  const unitIds = units.map(u => u.id);
  const concepts = _concepts.filter(c => c.subjectId === nid);
  const flashcards = _flashcards.filter(f => unitIds.includes(f.unitId));
  const mcqs = _mcqs.filter(m => unitIds.includes(m.unitId));
  const glossary = _glossary.filter(g => unitIds.includes(g.unitId));

  return {
    unitCount: units.length,
    conceptCount: concepts.length,
    flashcardCount: flashcards.length,
    mcqCount: mcqs.length,
    glossaryCount: glossary.length,
  };
}

export function getUnitStats(unitId: string) {
  const concepts = getConcepts(unitId);
  const flashcards = getFlashcardsForUnit(unitId);
  const mcqs = getMCQs(unitId);
  const glossary = _glossary.filter(g => g.unitId === unitId);

  return {
    conceptCount: concepts.length,
    flashcardCount: flashcards.length,
    mcqCount: mcqs.length,
    glossaryCount: glossary.length,
  };
}

// ─── Search ─────────────────────────────────

export function searchNeuroContent(query: string): SearchResult[] {
  ensureInit();
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const maxResults = 30;

  // Search concepts
  for (const c of _concepts) {
    if (results.length >= maxResults) break;
    if (
      c.conceptName.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.simpleExplanation.toLowerCase().includes(q)
    ) {
      const subjectId = c.subjectId;
      results.push({
        type: 'concept',
        id: c.id,
        title: c.conceptName,
        subtitle: c.topic,
        subjectCode: toDisplayCode(subjectId),
        unitId: c.unitId,
        matchText: c.simpleExplanation.substring(0, 100),
      });
    }
  }

  // Search flashcards
  for (const f of _flashcards) {
    if (results.length >= maxResults) break;
    if (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
    ) {
      const unit = getUnit(f.unitId);
      results.push({
        type: 'flashcard',
        id: f.id,
        title: f.question.substring(0, 80),
        subtitle: 'Flashcard',
        subjectCode: unit ? toDisplayCode(unit.subjectId) : '',
        unitId: f.unitId,
        matchText: f.answer.substring(0, 100),
      });
    }
  }

  // Search MCQs
  for (const m of _mcqs) {
    if (results.length >= maxResults) break;
    if (m.question.toLowerCase().includes(q)) {
      const unit = getUnit(m.unitId);
      results.push({
        type: 'mcq',
        id: m.id,
        title: m.question.substring(0, 80),
        subtitle: 'MCQ',
        subjectCode: unit ? toDisplayCode(unit.subjectId) : '',
        unitId: m.unitId,
        matchText: m.options[m.correctOption]?.substring(0, 100) || '',
      });
    }
  }

  // Search glossary
  for (const g of _glossary) {
    if (results.length >= maxResults) break;
    if (
      g.term.toLowerCase().includes(q) ||
      g.expandedForm.toLowerCase().includes(q)
    ) {
      const unit = getUnit(g.unitId);
      results.push({
        type: 'glossary',
        id: g.id,
        title: g.term,
        subtitle: g.expandedForm,
        subjectCode: unit ? toDisplayCode(unit.subjectId) : '',
        unitId: g.unitId,
        matchText: g.simpleExplanation.substring(0, 100),
      });
    }
  }

  return results;
}

// ─── Random ─────────────────────────────────

export function getRandomFlashcard(excludeIds: string[] = []): Flashcard | null {
  ensureInit();
  const available = _flashcards.filter(f => !excludeIds.includes(f.id));
  if (available.length === 0) return _flashcards.length > 0 ? _flashcards[0] : null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomMCQs(count: number, unitId?: string, subjectId?: string): MCQ[] {
  const pool = getMCQs(unitId, subjectId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
