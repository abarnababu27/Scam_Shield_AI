import { describe, it, expect } from 'vitest';
import { buildJourney } from '../engine/journey';
import { detectIndicators } from '../engine/indicators';

describe('Journey Builder', () => {
  it('returns empty journey for no indicators', () => {
    const journey = buildJourney([]);
    expect(journey.stages).toHaveLength(0);
    expect(journey.hasMultipleStages).toBe(false);
  });

  it('returns single-stage journey for one indicator', () => {
    const indicators = detectIndicators('Share the OTP sent to your phone.');
    const journey = buildJourney(indicators);
    // May have 1 indicator
    if (indicators.length === 1) {
      expect(journey.stages).toHaveLength(1);
      expect(journey.hasMultipleStages).toBe(false);
      expect(journey.summary).toContain('single indicator');
    }
  });

  it('returns multi-stage journey for complex scam message', () => {
    const message =
      'Dear Customer, this is SBI support. Your account will be blocked within 2 hours. Share the OTP immediately.';
    const indicators = detectIndicators(message);
    const journey = buildJourney(indicators);
    expect(journey.stages.length).toBeGreaterThanOrEqual(2);
    expect(journey.hasMultipleStages).toBe(true);
  });

  it('orders stages by canonical scam sequence', () => {
    const message =
      'This is SBI support. Your account will be blocked immediately. Share the OTP now. Transfer Rs 5000 via UPI.';
    const indicators = detectIndicators(message);
    const journey = buildJourney(indicators);

    // Stages should be in ascending order
    for (let i = 1; i < journey.stages.length; i++) {
      expect(journey.stages[i].order).toBeGreaterThan(journey.stages[i - 1].order);
    }
  });

  it('marks connections as inferred after first stage', () => {
    const message =
      'Dear Customer, this is SBI. Your account will be blocked within 2 hours. Share the OTP.';
    const indicators = detectIndicators(message);
    const journey = buildJourney(indicators);

    if (journey.stages.length > 1) {
      expect(journey.stages[0].isInferred).toBe(false);
      expect(journey.stages[1].isInferred).toBe(true);
    }
  });

  it('includes disclaimer in every journey', () => {
    const journey = buildJourney([]);
    expect(journey.disclaimer).toBeTruthy();
    expect(journey.disclaimer.length).toBeGreaterThan(0);
  });

  it('includes safety tips for each stage', () => {
    const message = 'This is SBI. Share the OTP immediately.';
    const indicators = detectIndicators(message);
    const journey = buildJourney(indicators);
    for (const stage of journey.stages) {
      expect(stage.safetyTip).toBeTruthy();
    }
  });

  it('does not fabricate stages for benign messages', () => {
    const message = 'Your monthly account statement is now available in the app.';
    const indicators = detectIndicators(message);
    const journey = buildJourney(indicators);
    expect(journey.stages.length).toBeLessThanOrEqual(indicators.length);
  });
});
