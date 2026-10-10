import { GitBranch, Shield, Bell, ArrowRight } from 'lucide-react';
import type { Page } from './Sidebar';

interface OverviewPageProps {
  onNavigate: (page: Page) => void;
}

const JOURNEY_STAGES = [
  'Impersonation',
  'Artificial Urgency',
  'Sensitive Information Request',
  'Suspicious Payment Instruction',
];

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="overview-hero">
        <h2>
          Scams rarely happen in one step.{' '}
          <span className="accent">See the pattern</span> before you act.
        </h2>
        <p>
          Explore suspicious financial messages, connect warning signs,
          and understand the safest next step.
        </p>
        <div className="overview-actions">
          <button
            id="cta-analyse"
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('analyse')}
          >
            <Shield size={18} />
            Analyse a Message
          </button>
          <button
            id="cta-scenarios"
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('scenarios')}
          >
            <ArrowRight size={18} />
            Explore a Scenario
          </button>
        </div>
      </section>

      {/* Journey Preview */}
      <section className="journey-preview" aria-label="Illustrative scam journey">
        <div className="journey-preview-title">
          Illustrative Scam Journey
        </div>
        <div className="journey-preview-flow">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={stage}>
              {i > 0 && <div className="journey-preview-connector" />}
              <div className="journey-preview-stage">
                <span className="stage-num">{i + 1}</span>
                {stage}
              </div>
            </div>
          ))}
        </div>
        <p className="journey-preview-note">
          This is an illustrative example. Not every message following this pattern
          is necessarily fraudulent, and real scams may use different sequences.
        </p>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* Core Capabilities */}
      <section className="capabilities" aria-label="Core capabilities">
        <div className="capability">
          <div className="capability-icon">
            <GitBranch size={20} />
          </div>
          <h3>Connect Warning Signs</h3>
          <p>
            Analyse how individual indicators relate to one another within a
            message. See the potential scam journey unfold step by step.
          </p>
        </div>

        <div className="capability">
          <div className="capability-icon">
            <Shield size={20} />
          </div>
          <h3>Explain the Evidence</h3>
          <p>
            Every risk assessment is backed by specific evidence from the
            submitted text. See what was detected and why it matters.
          </p>
        </div>

        <div className="capability">
          <div className="capability-icon">
            <Bell size={20} />
          </div>
          <h3>Reduce Alert Fatigue</h3>
          <p>
            Group related alerts, deduplicate repeated events, and escalate
            only when genuinely new evidence warrants attention.
          </p>
        </div>
      </section>
    </div>
  );
}
