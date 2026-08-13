import React, { useState, useEffect } from 'react';
import { getGlossaryTerms, getSubjects } from '../data/store';
import type { GlossaryTerm, Subject } from '../data/types';
import { ChevronDownIcon, SearchIcon } from './Icons';

export const GlossaryView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [openTermId, setOpenTermId] = useState<string | null>(null);

  // Alphabet letters list
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    setSubjects(getSubjects());
  }, []);

  useEffect(() => {
    const subId = selectedSubject === 'all' ? undefined : selectedSubject;
    const filteredTerms = getGlossaryTerms(searchQuery, subId, undefined);

    let finalTerms = [...filteredTerms];

    if (selectedLetter !== 'all') {
      finalTerms = finalTerms.filter(t => t.term.toUpperCase().startsWith(selectedLetter));
    }

    setTerms(finalTerms);
  }, [selectedSubject, searchQuery, selectedLetter]);

  const toggleTerm = (id: string) => {
    setOpenTermId(openTermId === id ? null : id);
  };

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(prev => (prev === letter ? 'all' : letter));
  };

  return (
    <div>
      <div className="mb-lg">
        <h1 className="dashboard__title">Glossary</h1>
        <p className="dashboard__degree">B.Sc. Neuro Science Technology Lexicon</p>
      </div>

      <div className="glossary__search">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search terms, concepts, or explanations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="filters-panel__row mb-md">
        <div className="select-wrapper" style={{ width: '100%' }}>
          <select
            className="select-native"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alphabet Letters Grid */}
      <div className="glossary__letters">
        <button
          className={`glossary__letter ${selectedLetter === 'all' ? 'glossary__letter--active' : ''}`}
          onClick={() => setSelectedLetter('all')}
        >
          All
        </button>
        {alphabet.map(letter => {
          return (
            <button
              key={letter}
              className={`glossary__letter ${selectedLetter === letter ? 'glossary__letter--active' : ''}`}
              onClick={() => handleLetterSelect(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Terms List */}
      <h2 className="section-label">Terminology ({terms.length})</h2>

      {terms.length === 0 ? (
        <div className="empty-state">
          <SearchIcon size={32} className="empty-state__icon" />
          <p className="empty-state__message">No terms matched your search or filters.</p>
        </div>
      ) : (
        <div className="terms-list">
          {terms.map(t => {
            const isOpen = openTermId === t.id;
            return (
              <div key={t.id} className={`glossary-term ${isOpen ? 'glossary-term--open' : ''}`}>
                <button className="glossary-term__header" onClick={() => toggleTerm(t.id)}>
                  <div>
                    <span className="glossary-term__name">{t.term}</span>
                    {t.expandedForm && <span className="glossary-term__expanded">({t.expandedForm})</span>}
                  </div>
                  <span className="glossary-term__toggle">
                    <ChevronDownIcon size={16} />
                  </span>
                </button>

                {isOpen && (
                  <div className="glossary-term__body">
                    {t.simpleExplanation && (
                      <div className="glossary-term__section">
                        <h4 className="glossary-term__section-label">Explanation</h4>
                        <p className="glossary-term__section-text">{t.simpleExplanation}</p>
                      </div>
                    )}

                    {t.technicalExplanation && (
                      <div className="glossary-term__section">
                        <h4 className="glossary-term__section-label">Technical Details</h4>
                        <p className="glossary-term__section-text">{t.technicalExplanation}</p>
                      </div>
                    )}

                    {t.relatedTopics && t.relatedTopics.length > 0 && (
                      <div className="glossary-term__section">
                        <h4 className="glossary-term__section-label">Related Topics</h4>
                        <div className="glossary-term__related">
                          {t.relatedTopics.map((topic, index) => (
                            <span key={index} className="glossary-term__related-tag">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default GlossaryView;
