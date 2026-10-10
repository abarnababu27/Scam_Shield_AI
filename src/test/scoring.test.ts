import { describe, it, expect } from 'vitest';
import { computeRisk } from '../engine/scoring';
import { detectIndicators } from '../engine/indicators';

describe('Risk Scoring Module', () => {
  it('returns low risk for no indicators', () => {
    const risk = computeRisk([]);
    expect(risk.score).toBe(0);
    expect(risk.level).toBe('low');
    expect(risk.limitations.length).toBeGreaterThan(0);
  });

  it('returns higher risk for multi-category scam messages', () => {
    const message =
      'Dear Customer, this is SBI support. Your account will be blocked within 2 hours. Share the OTP sent to your number immediately. Transfer Rs 5000 processing fee via UPI.';
    const indicators = detectIndicators(message);
    const risk = computeRisk(indicators);
    expect(risk.score).toBeGreaterThanOrEqual(50);
    expect(['high', 'critical']).toContain(risk.level);
  });

  it('returns low risk for benign messages', () => {
    const message = 'Your monthly account statement for September 2026 is now available.';
    const indicators = detectIndicators(message);
    const risk = computeRisk(indicators);
    expect(risk.score).toBeLessThanOrEqual(20);
    expect(risk.level).toBe('low');
  });

  it('produces deterministic scores for identical inputs', () => {
    const message = 'Share your OTP now or your account will be blocked.';
    const ind1 = detectIndicators(message);
    const ind2 = detectIndicators(message);
    const risk1 = computeRisk(ind1);
    const risk2 = computeRisk(ind2);
    expect(risk1.score).toBe(risk2.score);
    expect(risk1.level).toBe(risk2.level);
  });

  it('includes recommendation in the assessment', () => {
    const indicators = detectIndicators('Share your OTP immediately.');
    const risk = computeRisk(indicators);
    expect(risk.recommendation).toBeTruthy();
    expect(risk.recommendation.length).toBeGreaterThan(0);
  });

  it('includes limitations in every assessment', () => {
    const risk = computeRisk([]);
    expect(risk.limitations.length).toBeGreaterThan(0);
    expect(risk.limitations.some((l) => l.includes('does not guarantee'))).toBe(true);
  });
});
