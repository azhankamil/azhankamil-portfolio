import React from 'react';
import { useRouter, useNavigate, routes } from './utils/router';
import { Shell } from './components/Shell';
import { WelcomeView } from './components/WelcomeView';
import { Dashboard } from './components/Dashboard';
import { SubjectView } from './components/SubjectView';
import { UnitView } from './components/UnitView';
import { ConceptView } from './components/ConceptView';
import { FlashcardStudy } from './components/FlashcardStudy';
import { QuizView } from './components/QuizView';
import { GlossaryView } from './components/GlossaryView';
import { SearchView } from './components/SearchView';
import { ProgressView } from './components/ProgressView';
import { ErrorState } from './components/ErrorState';
import { getUnit, getSubject } from './data/store';

// ─── Error Boundary ─────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GulnaarNeuro Boundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 'var(--n-space-xl)', background: 'var(--n-bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 450, width: '100%' }}>
            <ErrorState
              title="Application Error"
              message={this.state.error?.message || 'An unexpected error occurred in Gulnaar Neuro.'}
            />
            <button
              className="btn btn--primary btn--block mt-lg"
              onClick={() => {
                window.location.hash = '#/';
                window.location.reload();
              }}
            >
              Reset App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Main App Component ─────────────────────

export const App: React.FC = () => {
  const currentRoute = useRouter();
  const navigate = useNavigate();

  const handleBack = () => {
    switch (currentRoute.page) {
      case 'subject':
        navigate(routes.dashboard());
        break;
      case 'unit':
        navigate(routes.subject(currentRoute.subjectId));
        break;
      case 'concept': {
        const unit = getUnit(getConceptUnitId(currentRoute.conceptId));
        if (unit) {
          navigate(routes.unit(unit.subjectId, unit.id));
        } else {
          navigate(routes.dashboard());
        }
        break;
      }
      default:
        navigate(routes.dashboard());
    }
  };

  const getConceptUnitId = (conceptId: string) => {
    const el = document.getElementById(conceptId); // dummy search check
    // Simple retrieval since we keep data normalized
    return conceptId.substring(0, conceptId.indexOf('-C') === -1 ? conceptId.length : conceptId.indexOf('-C')) + '-U' + conceptId.split('-C')[1]?.substring(0, 2);
  };

  const renderContent = () => {
    switch (currentRoute.page) {
      case 'welcome':
        return <WelcomeView />;

      case 'dashboard':
        return (
          <Shell title="Gulnaar Neuro" showBack={false}>
            <Dashboard />
          </Shell>
        );

      case 'subject':
        return (
          <Shell
            title={getSubject(currentRoute.subjectId)?.code || 'Subject'}
            showBack={true}
            onBack={handleBack}
          >
            <SubjectView subjectId={currentRoute.subjectId} />
          </Shell>
        );

      case 'unit':
        return (
          <Shell
            title="Unit Overview"
            showBack={true}
            onBack={handleBack}
          >
            <UnitView subjectId={currentRoute.subjectId} unitId={currentRoute.unitId} />
          </Shell>
        );

      case 'concept':
        return (
          <Shell
            title="Concept Learn"
            showBack={true}
            onBack={handleBack}
          >
            <ConceptView conceptId={currentRoute.conceptId} />
          </Shell>
        );

      case 'flashcards':
        return (
          <FlashcardStudy
            unitId={currentRoute.unitId}
            conceptId={currentRoute.conceptId}
            subjectId={currentRoute.subjectId}
          />
        );

      case 'quiz':
        return <QuizView mode={currentRoute.mode} />;

      case 'glossary':
        return (
          <Shell title="Glossary" showBack={false}>
            <GlossaryView />
          </Shell>
        );

      case 'search':
        return (
          <Shell title="Search" showBack={false}>
            <SearchView initialQuery={currentRoute.query} />
          </Shell>
        );

      case 'progress':
        return (
          <Shell title="Study Analytics" showBack={false}>
            <ProgressView />
          </Shell>
        );

      default:
        return <WelcomeView />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="neuro-root">
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
};
export default App;
