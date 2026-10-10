/**
 * Alert Grouping Engine
 *
 * Groups, deduplicates, and escalates alerts from synthetic events.
 *
 * GROUPING RULES (documented):
 * 1. Events with the same scenarioId are grouped into a single alert.
 * 2. Events with the same eventId are deduplicated (not shown twice).
 * 3. If new evidence arrives for an existing alert, the alert is updated.
 * 4. If the new evidence has higher severity, the alert is escalated.
 * 5. The grouping history is preserved so users can see what changed.
 *
 * ESCALATION RULES:
 *   low → medium → high → critical
 *   An alert can only escalate (never downgrade) within a scenario.
 */

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertEvent {
  eventId: string;
  scenarioId: string;
  timestamp: string;
  category: string;
  severity: AlertSeverity;
  evidence: string;
  description: string;
}

export interface GroupedAlert {
  scenarioId: string;
  title: string;
  currentSeverity: AlertSeverity;
  events: AlertEvent[];
  deduplicatedCount: number;
  escalationHistory: EscalationRecord[];
  lastUpdated: string;
  groupingReason: string;
}

export interface EscalationRecord {
  from: AlertSeverity;
  to: AlertSeverity;
  reason: string;
  timestamp: string;
}

export interface AlertComparison {
  rawAlerts: AlertEvent[];
  groupedAlerts: GroupedAlert[];
  totalRawCount: number;
  totalGroupedCount: number;
  deduplicatedTotal: number;
  reductionPercentage: number;
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/**
 * Groups an array of alert events and returns the comparison result.
 */
export function groupAlerts(events: AlertEvent[]): AlertComparison {
  const groupMap = new Map<string, GroupedAlert>();
  const seenEventIds = new Set<string>();
  let deduplicatedTotal = 0;

  // Sort by timestamp to process events in order
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const event of sorted) {
    // Deduplication: skip events with duplicate eventId
    if (seenEventIds.has(event.eventId)) {
      deduplicatedTotal++;
      // Still count in the group's deduplicated count
      const group = groupMap.get(event.scenarioId);
      if (group) {
        group.deduplicatedCount++;
      }
      continue;
    }
    seenEventIds.add(event.eventId);

    if (!groupMap.has(event.scenarioId)) {
      // Create new group
      groupMap.set(event.scenarioId, {
        scenarioId: event.scenarioId,
        title: `Alert: ${event.description.split('.')[0]}`,
        currentSeverity: event.severity,
        events: [event],
        deduplicatedCount: 0,
        escalationHistory: [],
        lastUpdated: event.timestamp,
        groupingReason: `Grouped under scenario "${event.scenarioId}".`,
      });
    } else {
      // Update existing group
      const group = groupMap.get(event.scenarioId)!;
      group.events.push(event);
      group.lastUpdated = event.timestamp;

      // Escalation check
      if (SEVERITY_ORDER[event.severity] > SEVERITY_ORDER[group.currentSeverity]) {
        group.escalationHistory.push({
          from: group.currentSeverity,
          to: event.severity,
          reason: `New evidence: "${event.evidence}" (${event.category}) escalated severity.`,
          timestamp: event.timestamp,
        });
        group.currentSeverity = event.severity;
        group.groupingReason = `Escalated to ${event.severity} due to new evidence.`;
      } else {
        group.groupingReason = `Updated with additional evidence (${event.category}).`;
      }
    }
  }

  const groupedAlerts = Array.from(groupMap.values());

  // Sort grouped alerts by severity (critical first)
  groupedAlerts.sort(
    (a, b) => SEVERITY_ORDER[b.currentSeverity] - SEVERITY_ORDER[a.currentSeverity]
  );

  return {
    rawAlerts: sorted,
    groupedAlerts,
    totalRawCount: events.length,
    totalGroupedCount: groupedAlerts.length,
    deduplicatedTotal,
    reductionPercentage:
      events.length > 0
        ? Math.round((1 - groupedAlerts.length / events.length) * 100)
        : 0,
  };
}

/**
 * Synthetic alert events for demonstration.
 * These are clearly labelled as synthetic / simulated data.
 */
export function getSyntheticEvents(): AlertEvent[] {
  return [
    // Scenario A: Banking impersonation (5 events, escalating)
    {
      eventId: 'evt-a1',
      scenarioId: 'scenario-banking-impersonation',
      timestamp: '2026-10-09T10:00:00Z',
      category: 'Impersonation',
      severity: 'medium',
      evidence: 'Message claims to be from "SBI Official Support Team"',
      description: 'Possible bank impersonation detected. Sender claims SBI affiliation.',
    },
    {
      eventId: 'evt-a2',
      scenarioId: 'scenario-banking-impersonation',
      timestamp: '2026-10-09T10:02:00Z',
      category: 'Urgency',
      severity: 'medium',
      evidence: 'Message states account "will be blocked within 2 hours"',
      description: 'Urgency tactic detected in banking impersonation scenario.',
    },
    {
      eventId: 'evt-a3',
      scenarioId: 'scenario-banking-impersonation',
      timestamp: '2026-10-09T10:05:00Z',
      category: 'Credential Request',
      severity: 'high',
      evidence: 'Message requests OTP: "share the OTP sent to your number"',
      description: 'OTP request detected. Escalation from urgency to credential theft attempt.',
    },
    {
      eventId: 'evt-a1', // Duplicate!
      scenarioId: 'scenario-banking-impersonation',
      timestamp: '2026-10-09T10:06:00Z',
      category: 'Impersonation',
      severity: 'medium',
      evidence: 'Message claims to be from "SBI Official Support Team"',
      description: 'Possible bank impersonation detected. Sender claims SBI affiliation.',
    },
    {
      eventId: 'evt-a4',
      scenarioId: 'scenario-banking-impersonation',
      timestamp: '2026-10-09T10:10:00Z',
      category: 'Payment',
      severity: 'critical',
      evidence: 'Message instructs to transfer ₹5,000 "processing fee"',
      description: 'Payment demand detected. Full scam pattern now visible.',
    },

    // Scenario B: Fake customer support (3 events)
    {
      eventId: 'evt-b1',
      scenarioId: 'scenario-fake-support',
      timestamp: '2026-10-09T11:00:00Z',
      category: 'Social Engineering',
      severity: 'low',
      evidence: 'Message offers "special refund" for recent purchase',
      description: 'Possible social engineering through fake refund offer.',
    },
    {
      eventId: 'evt-b2',
      scenarioId: 'scenario-fake-support',
      timestamp: '2026-10-09T11:03:00Z',
      category: 'Remote Access',
      severity: 'high',
      evidence: 'Requests installation of AnyDesk for "verification"',
      description: 'Remote access tool request detected in support scam pattern.',
    },
    {
      eventId: 'evt-b1', // Duplicate!
      scenarioId: 'scenario-fake-support',
      timestamp: '2026-10-09T11:05:00Z',
      category: 'Social Engineering',
      severity: 'low',
      evidence: 'Message offers "special refund" for recent purchase',
      description: 'Possible social engineering through fake refund offer.',
    },

    // Scenario C: Payment link scam (3 events, 1 duplicate)
    {
      eventId: 'evt-c1',
      scenarioId: 'scenario-payment-link',
      timestamp: '2026-10-09T12:00:00Z',
      category: 'Suspicious Link',
      severity: 'medium',
      evidence: 'Message contains shortened URL: bit.ly/pay-verify-now',
      description: 'Suspicious payment link detected.',
    },
    {
      eventId: 'evt-c2',
      scenarioId: 'scenario-payment-link',
      timestamp: '2026-10-09T12:02:00Z',
      category: 'Urgency',
      severity: 'medium',
      evidence: 'Claims payment link "expires in 30 minutes"',
      description: 'Time pressure applied to suspicious payment link.',
    },
    {
      eventId: 'evt-c1', // Duplicate!
      scenarioId: 'scenario-payment-link',
      timestamp: '2026-10-09T12:04:00Z',
      category: 'Suspicious Link',
      severity: 'medium',
      evidence: 'Message contains shortened URL: bit.ly/pay-verify-now',
      description: 'Suspicious payment link detected.',
    },

    // Scenario D: Benign notification (2 events)
    {
      eventId: 'evt-d1',
      scenarioId: 'scenario-benign-notification',
      timestamp: '2026-10-09T13:00:00Z',
      category: 'Notification',
      severity: 'low',
      evidence: 'Standard transaction confirmation message',
      description: 'Routine bank notification. No suspicious patterns detected.',
    },
    {
      eventId: 'evt-d2',
      scenarioId: 'scenario-benign-notification',
      timestamp: '2026-10-09T13:30:00Z',
      category: 'Notification',
      severity: 'low',
      evidence: 'Monthly statement available notification',
      description: 'Account statement reminder. Routine communication.',
    },
  ];
}
