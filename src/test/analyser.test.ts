import { describe, it, expect } from 'vitest';
import { analyseMessage, MAX_MESSAGE_LENGTH } from '../engine/analyser';
import { SCENARIOS } from '../engine/scenarios';

describe('Analyser (full pipeline)', () => {
  it('rejects empty input', () => {
    const result = analyseMessage('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('empty');
    }
  });

  it('rejects whitespace-only input', () => {
    const result = analyseMessage('   \n\t  ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('empty');
    }
  });

  it('rejects input exceeding max length', () => {
    const longMessage = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
    const result = analyseMessage(longMessage);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('too_long');
    }
  });

  it('successfully analyses a valid suspicious message', () => {
    const result = analyseMessage(
      'Dear Customer, share the OTP to verify your account immediately or it will be blocked.'
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.indicators.length).toBeGreaterThan(0);
      expect(result.result.risk.score).toBeGreaterThan(0);
      expect(result.result.journey.stages.length).toBeGreaterThan(0);
      expect(result.result.timestamp).toBeTruthy();
    }
  });

  it('successfully analyses a benign message', () => {
    const result = analyseMessage(
      'Your monthly account statement for September is available in the app.'
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.risk.level).toBe('low');
    }
  });

  it('produces different results for different inputs', () => {
    const r1 = analyseMessage('Share your OTP immediately or face account block.');
    const r2 = analyseMessage('Your monthly account statement is ready.');
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    if (r1.success && r2.success) {
      expect(r1.result.risk.score).not.toBe(r2.result.risk.score);
    }
  });
});

describe('Scenario Pipeline Consistency', () => {
  for (const scenario of SCENARIOS) {
    it(`analyses scenario: ${scenario.title}`, () => {
      const result = analyseMessage(scenario.message);
      expect(result.success).toBe(true);
      if (result.success) {
        if (scenario.isSuspicious) {
          expect(result.result.risk.score).toBeGreaterThan(0);
          expect(result.result.indicators.length).toBeGreaterThan(0);
        } else {
          // Benign scenarios should have low risk
          expect(result.result.risk.level).toBe('low');
        }
      }
    });
  }
});
