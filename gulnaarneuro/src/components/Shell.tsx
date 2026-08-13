import React, { useEffect } from 'react';
import { useRouter, useNavigate, routes } from '../utils/router';
import { APP_CONFIG } from '../data/config';
import { BookIcon, CardsIcon, QuizIcon, GlossaryIcon, SearchIcon, ChartIcon, BackIcon } from './Icons';

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  title = APP_CONFIG.appName,
  subtitle,
  onBack,
  showBack = false,
}) => {
  const currentRoute = useRouter();
  const navigate = useNavigate();

  // Handle page-specific SEO titles
  useEffect(() => {
    document.title = APP_CONFIG.pageTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', APP_CONFIG.pageDescription);
    }
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isTabActive = (tab: string) => {
    if (tab === 'dashboard' && currentRoute.page === 'dashboard') return true;
    if (tab === 'subjects' && (currentRoute.page === 'subject' || currentRoute.page === 'unit' || currentRoute.page === 'concept')) return true;
    if (tab === 'flashcards' && currentRoute.page === 'flashcards') return true;
    if (tab === 'quiz' && currentRoute.page === 'quiz') return true;
    if (tab === 'glossary' && currentRoute.page === 'glossary') return true;
    if (tab === 'progress' && currentRoute.page === 'progress') return true;
    return false;
  };

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__header-left">
          {showBack && (
            <button className="shell__back" onClick={onBack} aria-label="Go back">
              <BackIcon size={20} />
            </button>
          )}
          <span className="shell__title">{title}</span>
          {subtitle && <span className="shell__subtitle">{subtitle}</span>}
        </div>

        <nav className="desktop-nav">
          <button
            onClick={() => handleNavClick(routes.dashboard())}
            className={`desktop-nav__item ${isTabActive('dashboard') ? 'desktop-nav__item--active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick(routes.dashboard())}
            className={`desktop-nav__item ${isTabActive('subjects') ? 'desktop-nav__item--active' : ''}`}
          >
            Subjects
          </button>
          <button
            onClick={() => handleNavClick(routes.flashcards())}
            className={`desktop-nav__item ${isTabActive('flashcards') ? 'desktop-nav__item--active' : ''}`}
          >
            Flashcards
          </button>
          <button
            onClick={() => handleNavClick(routes.quiz({ mode: 'quick' }))}
            className={`desktop-nav__item ${isTabActive('quiz') ? 'desktop-nav__item--active' : ''}`}
          >
            Quiz
          </button>
          <button
            onClick={() => handleNavClick(routes.glossary())}
            className={`desktop-nav__item ${isTabActive('glossary') ? 'desktop-nav__item--active' : ''}`}
          >
            Glossary
          </button>
          <button
            onClick={() => handleNavClick(routes.progress())}
            className={`desktop-nav__item ${isTabActive('progress') ? 'desktop-nav__item--active' : ''}`}
          >
            Progress
          </button>
          <button
            onClick={() => handleNavClick(routes.search())}
            className={`desktop-nav__item ${currentRoute.page === 'search' ? 'desktop-nav__item--active' : ''}`}
          >
            Search
          </button>
        </nav>
      </header>

      <main className="shell__content">{children}</main>

      <nav className="bottom-nav">
        <button
          onClick={() => handleNavClick(routes.dashboard())}
          className={`bottom-nav__item ${isTabActive('dashboard') || isTabActive('subjects') ? 'bottom-nav__item--active' : ''}`}
        >
          <BookIcon size={18} className="bottom-nav__icon" />
          <span>Study</span>
        </button>
        <button
          onClick={() => handleNavClick(routes.flashcards())}
          className={`bottom-nav__item ${isTabActive('flashcards') ? 'bottom-nav__item--active' : ''}`}
        >
          <CardsIcon size={18} className="bottom-nav__icon" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => handleNavClick(routes.quiz({ mode: 'quick' }))}
          className={`bottom-nav__item ${isTabActive('quiz') ? 'bottom-nav__item--active' : ''}`}
        >
          <QuizIcon size={18} className="bottom-nav__icon" />
          <span>Quiz</span>
        </button>
        <button
          onClick={() => handleNavClick(routes.glossary())}
          className={`bottom-nav__item ${isTabActive('glossary') ? 'bottom-nav__item--active' : ''}`}
        >
          <GlossaryIcon size={18} className="bottom-nav__icon" />
          <span>Terms</span>
        </button>
        <button
          onClick={() => handleNavClick(routes.progress())}
          className={`bottom-nav__item ${isTabActive('progress') ? 'bottom-nav__item--active' : ''}`}
        >
          <ChartIcon size={18} className="bottom-nav__icon" />
          <span>Stats</span>
        </button>
      </nav>
    </div>
  );
};
