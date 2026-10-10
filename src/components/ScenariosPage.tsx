import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SCENARIOS } from '../engine/scenarios';
import type { Page } from './Sidebar';
import type { AnalysisResult } from '../engine/analyser';
import { analyseMessage } from '../engine/analyser';

interface ScenariosPageProps {
  onNavigate: (page: Page) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export function ScenariosPage({ onNavigate, onAnalysisComplete }: ScenariosPageProps) {
  const handleAnalyseScenario = (message: string) => {
    const outcome = analyseMessage(message);
    if (outcome.success) {
      onAnalysisComplete(outcome.result);
      onNavigate('analyse');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Scenario Lab</h2>
        <p>
          Explore synthetic example scenarios to understand how the detection engine works.
          All examples are crafted for demonstration purposes.
        </p>
      </div>

      <div className="info-notice mb-lg">
        <AlertTriangle size={18} className="notice-icon" />
        <span>
          <strong>All scenarios below are synthetic test content.</strong> They do not
          represent real messages or real financial institutions. They are designed to
          demonstrate the analysis capabilities of ScamShield AI.
        </span>
      </div>

      <div className="scenario-grid">
        {SCENARIOS.map((scenario) => (
          <div key={scenario.id} className="scenario-card">
            <div className="scenario-card-header">
              <h3>{scenario.title}</h3>
              {scenario.isSuspicious ? (
                <span className="badge badge-high" style={{ flexShrink: 0 }}>Suspicious</span>
              ) : (
                <span className="badge badge-low" style={{ flexShrink: 0 }}>Benign</span>
              )}
            </div>
            <p>{scenario.description}</p>

            <div className="message-preview">
              {scenario.message}
            </div>

            {/* Expected warnings */}
            {scenario.expectedWarnings.length > 0 && (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-xs)',
                  fontWeight: 600,
                }}>
                  Expected Warning Signs
                </div>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                }}>
                  {scenario.expectedWarnings.map((w, i) => (
                    <li key={i} style={{ paddingLeft: 'var(--space-md)', position: 'relative', marginBottom: '2px' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scenario.expectedWarnings.length === 0 && (
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--risk-low)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: 'var(--space-md)',
              }}>
                <CheckCircle2 size={14} />
                No warning signs expected
              </div>
            )}

            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-md)',
              lineHeight: 1.5,
            }}>
              <strong>Expected assessment:</strong> {scenario.expectedAssessment}
            </div>

            <div className="scenario-card-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAnalyseScenario(scenario.message)}
              >
                <Search size={14} />
                Analyse This Example
              </button>
              <span className="scenario-synthetic">Synthetic data</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
