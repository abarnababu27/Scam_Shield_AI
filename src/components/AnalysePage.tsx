import { useState, useCallback } from 'react';
import {
  Search,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
} from 'lucide-react';
import { analyseMessage, MAX_MESSAGE_LENGTH, AnalysisResult } from '../engine/analyser';
import { categoryLabel } from '../engine/indicators';
import type { RiskLevel } from '../engine/scoring';
import { SCENARIOS } from '../engine/scenarios';
import type { Page } from './Sidebar';

interface AnalysePageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onNavigate: (page: Page) => void;
  currentResult: AnalysisResult | null;
}

export function AnalysePage({ onAnalysisComplete, onNavigate, currentResult }: AnalysePageProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(currentResult);
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  const handleAnalyse = useCallback(() => {
    setError(null);
    setIsAnalysing(true);
    setResult(null);

    // Simulate brief processing time for UX
    setTimeout(() => {
      const outcome = analyseMessage(message);
      if (outcome.success) {
        setResult(outcome.result);
        onAnalysisComplete(outcome.result);
      } else {
        setError(outcome.error.message);
      }
      setIsAnalysing(false);
    }, 600);
  }, [message, onAnalysisComplete]);

  const handleClear = () => {
    setMessage('');
    setResult(null);
    setError(null);
    setExpandedIndicator(null);
  };

  const handleLoadScenario = (scenarioMessage: string) => {
    setMessage(scenarioMessage);
    setResult(null);
    setError(null);
  };

  const handleAnalyseAnother = () => {
    setResult(null);
    setError(null);
    setExpandedIndicator(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const riskColor = (level: RiskLevel) => `var(--risk-${level})`;

  return (
    <div>
      <div className="page-header">
        <h2>Analyse a Message</h2>
        <p>Paste a suspicious message below to identify potential scam indicators and understand the risk.</p>
      </div>

      {/* Input Section */}
      {!result && (
        <>
          <div className="panel">
            <div className="textarea-wrap">
              <label htmlFor="message-input" className="sr-only">Message to analyse</label>
              <textarea
                id="message-input"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste a suspicious message here for analysis..."
                maxLength={MAX_MESSAGE_LENGTH + 100}
                disabled={isAnalysing}
                aria-describedby="char-count"
              />
            </div>
            <div className="textarea-footer">
              <span id="char-count">
                {message.length} / {MAX_MESSAGE_LENGTH} characters
              </span>
              {message.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleClear}
                  aria-label="Clear input"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                id="btn-analyse"
                className="btn btn-primary"
                onClick={handleAnalyse}
                disabled={isAnalysing || message.trim().length === 0}
              >
                {isAnalysing ? (
                  <>Analysing...</>
                ) : (
                  <>
                    <Search size={16} />
                    Analyse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scenario Selector */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              marginBottom: 'var(--space-sm)',
            }}>
              Or load an example scenario
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleLoadScenario(s.message)}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isAnalysing && (
            <div className="loading-dots" aria-label="Analysing message">
              <span /><span /><span />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-message mt-md" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}
        </>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Risk Header */}
          <div className="panel" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
              <div>
                <span
                  className={`badge badge-${result.risk.level}`}
                  style={{ marginBottom: '8px', display: 'inline-flex' }}
                >
                  {result.risk.label}
                </span>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}>
                  {result.indicators.length} indicator{result.indicators.length !== 1 ? 's' : ''} detected
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 700,
                  color: riskColor(result.risk.level),
                  lineHeight: 1,
                }}>
                  {result.risk.score}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-tertiary)',
                }}>
                  Risk Score
                </div>
              </div>
            </div>

            {/* Risk Meter */}
            <div className="risk-meter">
              <div className="risk-meter-bar">
                <div
                  className={`risk-meter-fill ${result.risk.level}`}
                  style={{ width: `${result.risk.score}%` }}
                />
              </div>
              <div className="risk-meter-labels">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="panel" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="panel-title" style={{ marginBottom: 'var(--space-sm)' }}>Assessment</div>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: 'var(--space-md)',
            }}>
              {result.risk.explanation}
            </p>

            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              marginBottom: 'var(--space-xs)',
              fontWeight: 600,
            }}>
              Recommendation
            </div>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              padding: 'var(--space-md)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${riskColor(result.risk.level)}`,
            }}>
              {result.risk.recommendation}
            </p>
          </div>

          {/* Detected Indicators */}
          {result.indicators.length > 0 && (
            <div className="panel" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="panel-title" style={{ marginBottom: 'var(--space-md)' }}>
                Detected Indicators
              </div>
              <div className="indicator-list">
                {result.indicators.map((ind) => (
                  <div
                    key={ind.id}
                    className={`indicator-item ${expandedIndicator === ind.id ? 'expanded' : ''}`}
                    onClick={() =>
                      setExpandedIndicator(expandedIndicator === ind.id ? null : ind.id)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedIndicator(expandedIndicator === ind.id ? null : ind.id);
                      }
                    }}
                    aria-expanded={expandedIndicator === ind.id}
                  >
                    <div className="indicator-item-header">
                      <span className="indicator-item-label">
                        <span className={`badge badge-${ind.confidence === 'high' ? 'critical' : ind.confidence === 'medium' ? 'moderate' : 'low'}`} style={{ fontSize: '0.625rem', padding: '2px 8px' }}>
                          {categoryLabel(ind.category)}
                        </span>
                        {ind.label}
                      </span>
                      {expandedIndicator === ind.id ? (
                        <ChevronUp size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      ) : (
                        <ChevronDown size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      )}
                    </div>

                    {expandedIndicator === ind.id && (
                      <div className="indicator-item-detail">
                        <p>{ind.description}</p>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-tertiary)',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.06em',
                          marginTop: 'var(--space-sm)',
                          marginBottom: 'var(--space-xs)',
                          fontWeight: 600,
                        }}>
                          Supporting Evidence
                        </div>
                        <div>
                          {ind.evidence.map((e, i) => (
                            <span key={i} className="evidence-tag">"{e}"</span>
                          ))}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-tertiary)',
                          marginTop: 'var(--space-sm)',
                        }}>
                          Confidence: {ind.confidence} · Weight: {ind.weight}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Journey link */}
          {result.journey.stages.length > 0 && (
            <div className="panel" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="flex-between">
                <div>
                  <div className="panel-title">Scam Journey</div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {result.journey.stages.length} stage{result.journey.stages.length !== 1 ? 's' : ''} detected — explore how these indicators connect.
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate('journey')}
                >
                  View Journey <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Limitations */}
          <div className="info-notice" style={{ marginBottom: 'var(--space-md)' }}>
            <Info size={18} className="notice-icon" />
            <div>
              <strong>Important Limitations</strong>
              <ul style={{
                listStyle: 'disc',
                paddingLeft: 'var(--space-md)',
                marginTop: 'var(--space-xs)',
              }}>
                {result.risk.limitations.map((l, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-size-xs)', marginBottom: '2px' }}>{l}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Analysed message preview */}
          <div className="panel">
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              marginBottom: 'var(--space-sm)',
              fontWeight: 600,
            }}>
              Analysed Message
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-primary)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.7,
              wordBreak: 'break-word' as const,
            }}>
              {result.message}
            </div>
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                id="btn-analyse-another"
                className="btn btn-secondary"
                onClick={handleAnalyseAnother}
              >
                Analyse Another Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
