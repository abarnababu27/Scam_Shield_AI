import { describe, it, expect } from 'vitest';
import { groupAlerts, getSyntheticEvents } from '../engine/alerts';

describe('Alert Grouping Engine', () => {
  const events = getSyntheticEvents();

  it('groups events by scenarioId', () => {
    const comparison = groupAlerts(events);
    expect(comparison.totalGroupedCount).toBeLessThan(comparison.totalRawCount);
  });

  it('deduplicates events with the same eventId', () => {
    const comparison = groupAlerts(events);
    expect(comparison.deduplicatedTotal).toBeGreaterThan(0);
  });

  it('calculates correct reduction percentage', () => {
    const comparison = groupAlerts(events);
    expect(comparison.reductionPercentage).toBeGreaterThan(0);
    expect(comparison.reductionPercentage).toBeLessThanOrEqual(100);
  });

  it('escalates alerts when higher severity evidence arrives', () => {
    const comparison = groupAlerts(events);
    const bankingGroup = comparison.groupedAlerts.find(
      (g) => g.scenarioId === 'scenario-banking-impersonation'
    );
    expect(bankingGroup).toBeDefined();
    expect(bankingGroup!.currentSeverity).toBe('critical');
    expect(bankingGroup!.escalationHistory.length).toBeGreaterThan(0);
  });

  it('preserves escalation history', () => {
    const comparison = groupAlerts(events);
    const bankingGroup = comparison.groupedAlerts.find(
      (g) => g.scenarioId === 'scenario-banking-impersonation'
    );
    expect(bankingGroup!.escalationHistory.length).toBeGreaterThanOrEqual(1);
    for (const esc of bankingGroup!.escalationHistory) {
      expect(esc.from).toBeDefined();
      expect(esc.to).toBeDefined();
      expect(esc.reason).toBeTruthy();
    }
  });

  it('handles empty event array', () => {
    const comparison = groupAlerts([]);
    expect(comparison.totalRawCount).toBe(0);
    expect(comparison.totalGroupedCount).toBe(0);
    expect(comparison.reductionPercentage).toBe(0);
  });

  it('counts actual events from synthetic data', () => {
    const comparison = groupAlerts(events);
    expect(comparison.totalRawCount).toBe(events.length);
    // Grouped count should be the number of unique scenarios
    const uniqueScenarios = new Set(events.map((e) => e.scenarioId));
    expect(comparison.totalGroupedCount).toBe(uniqueScenarios.size);
  });

  it('sorts grouped alerts by severity (critical first)', () => {
    const comparison = groupAlerts(events);
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    for (let i = 1; i < comparison.groupedAlerts.length; i++) {
      expect(
        severityOrder[comparison.groupedAlerts[i - 1].currentSeverity]
      ).toBeGreaterThanOrEqual(
        severityOrder[comparison.groupedAlerts[i].currentSeverity]
      );
    }
  });
});
