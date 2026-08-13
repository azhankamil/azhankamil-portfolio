import React, { useState, useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { searchNeuroContent } from '../data/store';
import type { SearchResult } from '../data/types';
import { SearchIcon } from './Icons';

interface SearchViewProps {
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchNeuroContent(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleResultClick = (res: SearchResult) => {
    if (res.type === 'concept') {
      navigate(routes.concept(res.id));
    } else if (res.type === 'flashcard') {
      navigate(routes.flashcards(res.unitId));
    } else if (res.type === 'mcq') {
      navigate(routes.quiz({ mode: 'unit', unit: res.unitId }));
    } else if (res.type === 'glossary') {
      navigate(routes.glossary());
    }
  };

  return (
    <div>
      <div className="mb-lg">
        <h1 className="dashboard__title">Global Search</h1>
        <p className="dashboard__degree">Search concepts, flashcards, MCQs, and lexicon glossary</p>
      </div>

      <div className="glossary__search">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Type at least 2 characters to search (e.g. BAER, MEP)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <SearchIcon
            size={18}
            style={{
              position: 'absolute',
              right: 'var(--n-space-lg)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--n-text-muted)',
            }}
          />
        </div>
      </div>

      <h2 className="section-label">Search Results ({results.length})</h2>

      {results.length === 0 ? (
        <div className="empty-state">
          <SearchIcon size={32} className="empty-state__icon" />
          {query.trim().length < 2 ? (
            <p className="empty-state__message">Enter a search query to discover neuroscience topics.</p>
          ) : (
            <p className="empty-state__message">No results found for "{query}". Try a different keyword.</p>
          )}
        </div>
      ) : (
        <div className="search-results-list">
          {results.map((res, index) => (
            <div
              key={`${res.type}_${res.id}_${index}`}
              className="search-result"
              onClick={() => handleResultClick(res)}
            >
              <div className="search-result__type">{res.type}</div>
              <h3 className="search-result__title">{res.title}</h3>
              {res.subtitle && <p className="search-result__meta">{res.subtitle}</p>}
              <p className="search-result__meta" style={{ color: 'var(--n-text-secondary)', marginTop: 'var(--n-space-xs)' }}>
                {res.subjectCode && <span>{res.subjectCode} · </span>}
                <span>"{res.matchText}"</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SearchView;
