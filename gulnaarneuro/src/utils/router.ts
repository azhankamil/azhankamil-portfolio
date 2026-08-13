/* ──────────────────────────────────────────────
   Simple hash-based router for GitHub Pages.
   No dependencies needed.
   ────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import type { Route, QuizMode } from '../data/types';

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);

  if (parts.length === 0 || h === '' || h === 'welcome') {
    return { page: 'welcome' };
  }
  if (h === 'dashboard') {
    return { page: 'dashboard' };
  }
  if (parts[0] === 'subject' && parts[1]) {
    return { page: 'subject', subjectId: parts[1] };
  }
  if (parts[0] === 'unit' && parts[1] && parts[2]) {
    return { page: 'unit', subjectId: parts[1], unitId: parts[2] };
  }
  if (parts[0] === 'concept' && parts[1]) {
    return { page: 'concept', conceptId: parts[1] };
  }
  if (parts[0] === 'flashcards') {
    return {
      page: 'flashcards',
      unitId: parts[1],
      conceptId: getParam(h, 'concept'),
      subjectId: getParam(h, 'subject'),
    };
  }
  if (parts[0] === 'quiz') {
    const mode: QuizMode = {
      type: (getParam(h, 'mode') || 'quick') as QuizMode['type'],
      subjectId: getParam(h, 'subject'),
      unitId: parts[1] || getParam(h, 'unit'),
      conceptId: getParam(h, 'concept'),
      questionCount: parseInt(getParam(h, 'count') || '10', 10),
    };
    return { page: 'quiz', mode };
  }
  if (parts[0] === 'glossary') {
    return { page: 'glossary' };
  }
  if (parts[0] === 'search') {
    return { page: 'search', query: decodeURIComponent(parts[1] || '') };
  }
  if (parts[0] === 'progress') {
    return { page: 'progress' };
  }
  return { page: 'welcome' };
}

function getParam(hash: string, key: string): string | undefined {
  const match = hash.match(new RegExp(`[?&]${key}=([^&]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRouter(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export function useNavigate() {
  return useCallback((path: string) => {
    navigate(path);
  }, []);
}

// Helper to build hash routes
export const routes = {
  welcome: () => '#/',
  dashboard: () => '#/dashboard',
  subject: (id: string) => `#/subject/${id}`,
  unit: (subjectId: string, unitId: string) => `#/unit/${subjectId}/${unitId}`,
  concept: (id: string) => `#/concept/${id}`,
  flashcards: (unitId?: string, opts?: { concept?: string; subject?: string }) => {
    let path = '#/flashcards';
    if (unitId) path += `/${unitId}`;
    const params: string[] = [];
    if (opts?.concept) params.push(`concept=${opts.concept}`);
    if (opts?.subject) params.push(`subject=${opts.subject}`);
    if (params.length) path += `?${params.join('&')}`;
    return path;
  },
  quiz: (opts?: { mode?: string; unit?: string; subject?: string; concept?: string; count?: number }) => {
    let path = '#/quiz';
    if (opts?.unit) path += `/${opts.unit}`;
    const params: string[] = [];
    if (opts?.mode) params.push(`mode=${opts.mode}`);
    if (opts?.subject) params.push(`subject=${opts.subject}`);
    if (opts?.concept) params.push(`concept=${opts.concept}`);
    if (opts?.count) params.push(`count=${opts.count}`);
    if (params.length) path += `?${params.join('&')}`;
    return path;
  },
  glossary: () => '#/glossary',
  search: (q?: string) => q ? `#/search/${encodeURIComponent(q)}` : '#/search',
  progress: () => '#/progress',
};
