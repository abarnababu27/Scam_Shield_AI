import { useState, useMemo } from 'react';
import { Info, ArrowUp, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { groupAlerts, getSyntheticEvents, type AlertSeverity, type GroupedAlert, type AlertEvent } from '../engine/alerts';

type AlertView = 'raw' | 'grouped';

export function AlertsPage() {
  const [view, setView] = useState<AlertView>('grouped');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const syntheticEvents = useMemo(() => getSyntheticEvents(), []);
  const comparison = useMemo(() => groupAlerts(syntheticEvents), [syntheticEvents]);

  const severityBadge = (severity: AlertSeverity) => `badge badge-${severity}`;

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Alert Intelligence</h2>
        <p>See how alert consolidation reduces fatigue while preserving important signals.</p>
      </div>

      {/* Simulation notice */}
      <div className="info-notice mb-lg">
        <Info size={18} className="notice-icon" />
        <span>
          This is a <strong>simulation</strong> using synthetic events. All data shown is
          generated for demonstration purposes. The alert grouping feature has not been
          tested against real-world alert volumes.
        </span>
      </div>

      {/* Stats */}
      <div className="alert-stats">
        <div className="alert-stat">
          <div className="alert-stat-value">{comparison.totalRawCount}</div>
          <div className="alert-stat-label">Total Events</div>
        </div>
        <div className="alert-stat">
          <div className="alert-stat-value">{comparison.totalGroupedCount}</div>
          <div className="alert-stat-label">Consolidated Alerts</div>
        </div>
        <div className="alert-stat">
          <div className="alert-stat-value">{comparison.deduplicatedTotal}</div>
          <div className="alert-stat-label">Deduplicated</div>
        </div>
        <div className="alert-stat">
          <div className="alert-stat-value">{comparison.reductionPercentage}%</div>
          <div className="alert-stat-label">Reduction</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="alert-tabs" role="tablist">
        <button
          className={`alert-tab ${view === 'grouped' ? 'active' : ''}`}
          role="tab"
          aria-selected={view === 'grouped'}
          onClick={() => setView('grouped')}
        >
          Consolidated View ({comparison.totalGroupedCount})
        </button>
        <button
          className={`alert-tab ${view === 'raw' ? 'active' : ''}`}
          role="tab"
          aria-selected={view === 'raw'}
          onClick={() => setView('raw')}
        >
          Individual Alerts ({comparison.totalRawCount})
        </button>
      </div>

      {/* Grouped View */}
      {view === 'grouped' && (
        <div role="tabpanel">
          {comparison.groupedAlerts.map((group) => (
            <GroupedAlertCard
              key={group.scenarioId}
              group={group}
              isExpanded={expandedGroup === group.scenarioId}
              onToggle={() =>
                setExpandedGroup(
                  expandedGroup === group.scenarioId ? null : group.scenarioId
                )
              }
              formatTime={formatTime}
              severityBadge={severityBadge}
            />
          ))}
        </div>
      )}

      {/* Raw View */}
      {view === 'raw' && (
        <div role="tabpanel">
          {comparison.rawAlerts.map((event, i) => (
            <RawAlertCard
              key={`${event.eventId}-${i}`}
              event={event}
              formatTime={formatTime}
              severityBadge={severityBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupedAlertCard({
  group,
  isExpanded,
  onToggle,
  formatTime,
  severityBadge,
}: {
  group: GroupedAlert;
  isExpanded: boolean;
  onToggle: () => void;
  formatTime: (ts: string) => string;
  severityBadge: (s: AlertSeverity) => string;
}) {
  return (
    <div className={`alert-card ${isExpanded ? '' : ''}`}>
      <div
        className="alert-card-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
        }}
        aria-expanded={isExpanded}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <div className="alert-card-title">{group.title}</div>
          <div className="alert-card-meta">
            <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Last updated: {formatTime(group.lastUpdated)} ·
            {group.events.length} event{group.events.length !== 1 ? 's' : ''}
            {group.deduplicatedCount > 0 && (
              <span> · {group.deduplicatedCount} deduplicated</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className={severityBadge(group.currentSeverity)}>
            {group.currentSeverity}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          {/* Grouping reason */}
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Grouping reason: {group.groupingReason}
          </div>

          {/* Escalation history */}
          {group.escalationHistory.length > 0 && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginBottom: 'var(--space-xs)',
                fontWeight: 600,
              }}>
                Escalation History
              </div>
              <div className="escalation-list">
                {group.escalationHistory.map((esc, i) => (
                  <div key={i} className="escalation-item">
                    <ArrowUp size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-warning)' }} />
                    {esc.from} → {esc.to} at {formatTime(esc.timestamp)}: {esc.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events in group */}
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-xs)',
            fontWeight: 600,
          }}>
            Events in this group
          </div>
          {group.events.map((event, i) => (
            <div key={i} className="alert-card-evidence">
              <span className={severityBadge(event.severity)} style={{ fontSize: '0.6rem', padding: '1px 6px', marginRight: '6px' }}>
                {event.severity}
              </span>
              <strong>{event.category}</strong>: {event.evidence}
              <span style={{ color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                ({formatTime(event.timestamp)})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RawAlertCard({
  event,
  formatTime,
  severityBadge,
}: {
  event: AlertEvent;
  formatTime: (ts: string) => string;
  severityBadge: (s: AlertSeverity) => string;
}) {
  return (
    <div className="alert-card">
      <div className="alert-card-header">
        <div>
          <div className="alert-card-title">{event.description}</div>
          <div className="alert-card-meta">
            <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            {formatTime(event.timestamp)} · {event.category} · ID: {event.eventId}
          </div>
        </div>
        <span className={severityBadge(event.severity)} style={{ flexShrink: 0 }}>
          {event.severity}
        </span>
      </div>
      <div className="alert-card-evidence">{event.evidence}</div>
    </div>
  );
}
