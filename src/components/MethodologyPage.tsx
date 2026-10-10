import { Shield, Lock, AlertTriangle, Info } from 'lucide-react';

export function MethodologyPage() {
  return (
    <div>
      <div className="page-header">
        <h2>Methodology & Privacy</h2>
        <p>How ScamShield AI works, its capabilities, limitations, and privacy commitments.</p>
      </div>

      {/* Overview */}
      <section className="methodology-section">
        <h3>How Message Analysis Works</h3>
        <p>
          ScamShield AI uses a <strong>rule-based indicator detection engine</strong> to analyse
          the text content of financial messages. The engine searches for patterns commonly
          associated with known scam workflows.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          The analysis pipeline has three stages:
        </p>
        <ol>
          <li><strong>Indicator Detection:</strong> The submitted text is compared against a library of regular expression patterns grouped by category.</li>
          <li><strong>Risk Scoring:</strong> Detected indicators are weighted and combined to produce a risk score (0–100).</li>
          <li><strong>Journey Construction:</strong> Indicators are arranged in a canonical sequence to visualise the potential scam workflow.</li>
        </ol>
        <div className="info-notice mt-md">
          <Info size={18} className="notice-icon" />
          <span>
            This is a <strong>rule-based heuristic system</strong>, not a trained machine learning model.
            It does not learn from user submissions or adapt over time. It does not use any
            external AI APIs.
          </span>
        </div>
      </section>

      {/* Indicators */}
      <section className="methodology-section">
        <h3>Indicator Categories</h3>
        <p>The engine checks for the following categories of warning signs:</p>
        <table className="methodology-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Weight</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>OTP / Credential Request</td>
              <td>0.35</td>
              <td>Requests for OTPs, PINs, passwords, or CVVs</td>
            </tr>
            <tr>
              <td>Remote Access</td>
              <td>0.30</td>
              <td>Requests to install remote access software like AnyDesk or TeamViewer</td>
            </tr>
            <tr>
              <td>Payment Instruction</td>
              <td>0.25</td>
              <td>Instructions to transfer money, pay fees, or complete suspicious payments</td>
            </tr>
            <tr>
              <td>Impersonation</td>
              <td>0.20</td>
              <td>Claims of affiliation with banks, government agencies, or well-known companies</td>
            </tr>
            <tr>
              <td>Urgency / Threat</td>
              <td>0.20</td>
              <td>Artificial time pressure, account suspension threats, or legal threats</td>
            </tr>
            <tr>
              <td>Sensitive Info Request</td>
              <td>0.20</td>
              <td>Requests for Aadhaar, PAN, account numbers, or KYC details</td>
            </tr>
            <tr>
              <td>Suspicious Link</td>
              <td>0.15</td>
              <td>URLs with unfamiliar domains or URL shorteners</td>
            </tr>
            <tr>
              <td>Social Engineering</td>
              <td>0.15</td>
              <td>Prize notifications, lottery claims, or secrecy demands</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Risk Scoring */}
      <section className="methodology-section">
        <h3>Risk Scoring Method</h3>
        <p>The risk score is calculated as follows:</p>
        <ol>
          <li>Each indicator category contributes a <strong>weight</strong> (the maximum weight if multiple patterns match within the same category).</li>
          <li>Category weights are <strong>summed</strong>.</li>
          <li>A <strong>combination bonus</strong> is applied when multiple categories are detected (e.g., 0.08 for 2 categories, up to 0.30 for 5+).</li>
          <li>The total is <strong>capped at 1.0</strong> and normalised to a 0–100 scale.</li>
        </ol>

        <h4>Risk Levels</h4>
        <table className="methodology-table">
          <thead>
            <tr>
              <th>Score Range</th>
              <th>Level</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0–20</td>
              <td><span className="badge badge-low">Low</span></td>
              <td>Few or no warning signs detected</td>
            </tr>
            <tr>
              <td>21–50</td>
              <td><span className="badge badge-moderate">Moderate</span></td>
              <td>Some warning signs — verify independently</td>
            </tr>
            <tr>
              <td>51–75</td>
              <td><span className="badge badge-high">High</span></td>
              <td>Multiple warning signs — exercise extreme caution</td>
            </tr>
            <tr>
              <td>76–100</td>
              <td><span className="badge badge-critical">Critical</span></td>
              <td>Strong indicators of a potential scam</td>
            </tr>
          </tbody>
        </table>

        <div className="info-notice mt-md">
          <AlertTriangle size={18} className="notice-icon" style={{ color: 'var(--accent-warning)' }} />
          <span>
            The risk score is a <strong>heuristic measure</strong>, not a probability of fraud.
            It is based on pattern matching, not statistical analysis of real scam data.
            A low score does not guarantee safety, and a high score does not prove criminal intent.
          </span>
        </div>
      </section>

      {/* Alert Grouping */}
      <section className="methodology-section">
        <h3>Alert Grouping Method</h3>
        <p>The alert grouping engine processes events using these rules:</p>
        <ol>
          <li><strong>Grouping:</strong> Events with the same scenario identifier are grouped into a single alert.</li>
          <li><strong>Deduplication:</strong> Events with the same event identifier are not added twice.</li>
          <li><strong>Updating:</strong> New evidence updates the existing group with additional context.</li>
          <li><strong>Escalation:</strong> If new evidence has higher severity than the current group, the alert is escalated. Severity can only increase (low → medium → high → critical), never decrease.</li>
          <li><strong>Preservation:</strong> All historical events and escalation records are preserved within each group.</li>
        </ol>
      </section>

      {/* Capabilities */}
      <section className="methodology-section">
        <h3>Capability Classification</h3>
        <table className="methodology-table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Method</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Indicator Detection</td>
              <td>Rule-based (regex patterns)</td>
              <td>Deterministic, no ML</td>
            </tr>
            <tr>
              <td>Risk Scoring</td>
              <td>Weighted heuristic</td>
              <td>Documented formula, deterministic</td>
            </tr>
            <tr>
              <td>Journey Construction</td>
              <td>Rule-based ordering</td>
              <td>Canonical stage order, deterministic</td>
            </tr>
            <tr>
              <td>Alert Grouping</td>
              <td>Rule-based (scenario ID matching)</td>
              <td>Documented rules, deterministic</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          No machine learning models are currently implemented. The system is entirely rule-based.
        </p>
      </section>

      {/* Known Limitations */}
      <section className="methodology-section">
        <h3>Known Limitations</h3>
        <ul>
          <li>Detection relies on text patterns only — it does not consider sender metadata, transaction history, or call audio.</li>
          <li>New scam techniques that don't match current patterns will not be detected.</li>
          <li>The engine works best with English text. Support for other languages is limited.</li>
          <li>Context-dependent meaning (sarcasm, quotes, forwarded messages) is not handled.</li>
          <li>The system cannot verify the true identity of a message sender.</li>
          <li>The risk score is a heuristic, not a calibrated probability.</li>
          <li>The system has not been validated against real-world scam data at scale.</li>
          <li>Alert grouping uses scenario IDs, which may not reflect how real alert systems identify related events.</li>
        </ul>
      </section>

      {/* Privacy */}
      <section className="methodology-section">
        <h3>
          <Lock size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Privacy & Security
        </h3>
        <p>ScamShield AI is designed with privacy as a core consideration:</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', margin: 'var(--space-md) 0' }}>
          <span className="privacy-badge"><Shield size={14} /> No real OTPs collected</span>
          <span className="privacy-badge"><Shield size={14} /> No UPI PINs requested</span>
          <span className="privacy-badge"><Shield size={14} /> No bank passwords stored</span>
          <span className="privacy-badge"><Shield size={14} /> No card details processed</span>
          <span className="privacy-badge"><Shield size={14} /> No live bank connections</span>
          <span className="privacy-badge"><Shield size={14} /> No private message access</span>
          <span className="privacy-badge"><Shield size={14} /> No data sent to external servers</span>
          <span className="privacy-badge"><Shield size={14} /> All analysis runs locally</span>
        </div>

        <h4>Data Processing</h4>
        <ul>
          <li>All text analysis runs entirely in the browser. No submitted text is transmitted to any server.</li>
          <li>No user data is persisted to disk or stored in any database.</li>
          <li>The application does not use cookies for tracking purposes.</li>
          <li>No API keys or secret credentials are used or exposed in the frontend.</li>
          <li>User input is sanitised and rendered as text content to prevent injection attacks.</li>
          <li>Suspicious links in submitted text are never opened, loaded, or followed.</li>
        </ul>

        <h4>What This Application Does Not Do</h4>
        <ul>
          <li>Does not connect to live banking systems or financial APIs.</li>
          <li>Does not access, read, or scan private messages on any device.</li>
          <li>Does not request or process real financial credentials.</li>
          <li>Does not make legal determinations about fraud or criminal intent.</li>
          <li>Does not provide financial advice.</li>
        </ul>
      </section>
    </div>
  );
}
