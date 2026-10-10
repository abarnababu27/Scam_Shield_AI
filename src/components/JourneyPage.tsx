import { useState } from 'react';
import { Info, ArrowLeft, ChevronRight } from 'lucide-react';
import type { AnalysisResult } from '../engine/analyser';
import type { JourneyStage } from '../engine/journey';
import { categoryLabel } from '../engine/indicators';
import type { Page } from './Sidebar';

interface JourneyPageProps {
  result: AnalysisResult | null;
  onNavigate: (page: Page) => void;
}

export function JourneyPage({ result, onNavigate }: JourneyPageProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  if (!result || result.journey.stages.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Scam Journey</h2>
          <p>Explore how warning signs connect to form a potential scam workflow.</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Info size={48} />
          </div>
          <h3>No Journey Available</h3>
          <p>
            Analyse a message first to generate a scam journey.
            The journey is constructed from detected warning signs.
          </p>
          <button
            className="btn btn-primary mt-lg"
            onClick={() => onNavigate('analyse')}
          >
            Analyse a Message
          </button>
        </div>
      </div>
    );
  }

  const journey = result.journey;
  const activeStage = journey.stages.find((s) => s.id === selectedStage) ?? null;

  return (
    <div>
      <div className="page-header">
        <h2>Scam Journey</h2>
        <p>{journey.summary}</p>
      </div>

      {/* Disclaimer */}
      <div className="info-notice mb-lg">
        <Info size={18} className="notice-icon" />
        <span>{journey.disclaimer}</span>
      </div>

      <div className="journey-grid">
        {/* Timeline */}
        <div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-md)',
            fontWeight: 600,
          }}>
            Detected Stages ({journey.stages.length})
          </div>
          <div className="journey-timeline">
            {journey.stages.map((stage) => (
              <div
                key={stage.id}
                className={`journey-node ${selectedStage === stage.id ? 'active' : ''}`}
                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedStage(selectedStage === stage.id ? null : stage.id);
                  }
                }}
                aria-expanded={selectedStage === stage.id}
                aria-label={`Stage ${stage.order}: ${stage.stageLabel}`}
              >
                <div className="journey-node-dot" />
                <div className="journey-node-content">
                  <div className="journey-node-order">Stage {stage.order}</div>
                  <div className="journey-node-label">{stage.stageLabel}</div>
                  <div className="journey-node-evidence">
                    {stage.indicator.evidence[0]}
                  </div>
                  {stage.isInferred && (
                    <div className="journey-node-inferred">
                      <ChevronRight size={12} />
                      Inferred connection
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost mt-lg"
            onClick={() => onNavigate('analyse')}
          >
            <ArrowLeft size={14} />
            Back to Analysis
          </button>
        </div>

        {/* Detail Panel */}
        <div>
          {activeStage ? (
            <StageDetail stage={activeStage} />
          ) : (
            <div className="panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              color: 'var(--text-tertiary)',
              fontSize: 'var(--font-size-sm)',
              textAlign: 'center' as const,
            }}>
              <div>
                <Info size={32} style={{ marginBottom: 'var(--space-sm)', opacity: 0.4 }} />
                <p>Select a stage to view detailed evidence and recommendations.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageDetail({ stage }: { stage: JourneyStage }) {
  return (
    <div className="journey-detail">
      <h4>
        Stage {stage.order}: {stage.stageLabel}
      </h4>

      <div className="journey-detail-section">
        <h5>Warning Sign</h5>
        <p>
          <span className={`badge badge-${stage.indicator.confidence === 'high' ? 'critical' : stage.indicator.confidence === 'medium' ? 'moderate' : 'low'}`} style={{ fontSize: '0.625rem', padding: '2px 8px', marginRight: '8px' }}>
            {categoryLabel(stage.indicator.category)}
          </span>
          {stage.indicator.label}
        </p>
      </div>

      <div className="journey-detail-section">
        <h5>Supporting Evidence</h5>
        <div>
          {stage.indicator.evidence.map((e, i) => (
            <span key={i} className="evidence-tag" style={{ display: 'inline-block', marginBottom: '4px' }}>"{e}"</span>
          ))}
        </div>
      </div>

      <div className="journey-detail-section">
        <h5>Why This Matters</h5>
        <p>{stage.whyItMatters}</p>
      </div>

      <div className="journey-detail-section">
        <h5>Contribution to Assessment</h5>
        <p>
          Weight: <strong>{stage.indicator.weight}</strong> · 
          Confidence: <strong>{stage.indicator.confidence}</strong>
          {stage.isInferred && (
            <span style={{ color: 'var(--accent-warning)', marginLeft: '8px' }}>
              (Inferred connection)
            </span>
          )}
        </p>
      </div>

      <div className="journey-detail-section">
        <h5>Uncertainties</h5>
        <ul>
          {stage.uncertainties.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>

      <div className="journey-detail-section">
        <h5>Safety Recommendation</h5>
        <p style={{
          padding: 'var(--space-sm) var(--space-md)',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent-primary)',
        }}>
          {stage.safetyTip}
        </p>
      </div>
    </div>
  );
}
