import { useState, useCallback } from 'react';
import { Sidebar, type Page } from './components/Sidebar';
import { OverviewPage } from './components/OverviewPage';
import { AnalysePage } from './components/AnalysePage';
import { JourneyPage } from './components/JourneyPage';
import { AlertsPage } from './components/AlertsPage';
import { ScenariosPage } from './components/ScenariosPage';
import { MethodologyPage } from './components/MethodologyPage';
import type { AnalysisResult } from './engine/analyser';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
    setAnalysisResult(result);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigate} />;
      case 'analyse':
        return (
          <AnalysePage
            onAnalysisComplete={handleAnalysisComplete}
            onNavigate={handleNavigate}
            currentResult={analysisResult}
          />
        );
      case 'journey':
        return <JourneyPage result={analysisResult} onNavigate={handleNavigate} />;
      case 'alerts':
        return <AlertsPage />;
      case 'scenarios':
        return (
          <ScenariosPage
            onNavigate={handleNavigate}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      case 'methodology':
        return <MethodologyPage />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content" role="main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
