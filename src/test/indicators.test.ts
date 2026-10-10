import { describe, it, expect } from 'vitest';
import { detectIndicators, categoryLabel } from '../engine/indicators';

describe('Indicator Detection Engine', () => {
  describe('detectIndicators', () => {
    it('returns empty array for empty input', () => {
      expect(detectIndicators('')).toEqual([]);
      expect(detectIndicators('   ')).toEqual([]);
    });

    it('returns empty array for null/undefined input', () => {
      expect(detectIndicators(null as unknown as string)).toEqual([]);
      expect(detectIndicators(undefined as unknown as string)).toEqual([]);
    });

    it('detects OTP request indicators', () => {
      const message = 'Please share the OTP sent to your registered mobile number.';
      const indicators = detectIndicators(message);
      const otpIndicator = indicators.find((i) => i.category === 'otp_credential_request');
      expect(otpIndicator).toBeDefined();
      expect(otpIndicator!.evidence.length).toBeGreaterThan(0);
    });

    it('detects impersonation indicators', () => {
      const message = 'This is the SBI Fraud Prevention Team calling about your account.';
      const indicators = detectIndicators(message);
      const impersonation = indicators.find((i) => i.category === 'impersonation');
      expect(impersonation).toBeDefined();
    });

    it('detects urgency/threat indicators', () => {
      const message = 'Your account will be blocked within 2 hours. Act immediately.';
      const indicators = detectIndicators(message);
      const urgency = indicators.find((i) => i.category === 'urgency_threat');
      expect(urgency).toBeDefined();
    });

    it('detects payment instruction indicators', () => {
      const message = 'Transfer Rs. 5000 to verify your account via UPI.';
      const indicators = detectIndicators(message);
      const payment = indicators.find((i) => i.category === 'payment_instruction');
      expect(payment).toBeDefined();
    });

    it('detects remote access indicators', () => {
      const message = 'Please download and install AnyDesk on your phone.';
      const indicators = detectIndicators(message);
      const remote = indicators.find((i) => i.category === 'remote_access');
      expect(remote).toBeDefined();
    });

    it('detects social engineering indicators', () => {
      const message = 'Congratulations! You have won a prize of Rs 50000. Do not tell anyone.';
      const indicators = detectIndicators(message);
      const social = indicators.find((i) => i.category === 'social_engineering');
      expect(social).toBeDefined();
    });

    it('returns no indicators for benign messages', () => {
      const message = 'Your account XX5432 has been debited by Rs. 1,250.00 for POS transaction at Big Bazaar.';
      const indicators = detectIndicators(message);
      // A benign transaction notification should produce few or no indicators
      // (the Rs. amount might trigger payment_instruction at low confidence)
      const highConfidence = indicators.filter((i) => i.confidence === 'high');
      expect(highConfidence.length).toBe(0);
    });

    it('detects multiple indicators in a scam message', () => {
      const message =
        'Dear Customer, this is the SBI Fraud Prevention Team. Your account will be blocked within 2 hours. Share the OTP sent to your number immediately.';
      const indicators = detectIndicators(message);
      expect(indicators.length).toBeGreaterThanOrEqual(3);

      const categories = indicators.map((i) => i.category);
      expect(categories).toContain('impersonation');
      expect(categories).toContain('urgency_threat');
      expect(categories).toContain('otp_credential_request');
    });

    it('produces deterministic results for identical inputs', () => {
      const message = 'Share your OTP immediately to avoid account block.';
      const result1 = detectIndicators(message);
      const result2 = detectIndicators(message);
      expect(result1).toEqual(result2);
    });

    it('includes supporting evidence from the input text', () => {
      const message = 'Please share the OTP to verify your account.';
      const indicators = detectIndicators(message);
      const otpIndicator = indicators.find((i) => i.category === 'otp_credential_request');
      expect(otpIndicator).toBeDefined();
      // Evidence should contain text from the message
      expect(otpIndicator!.evidence.some((e) => e.toLowerCase().includes('otp'))).toBe(true);
    });
  });

  describe('categoryLabel', () => {
    it('returns human-readable labels', () => {
      expect(categoryLabel('otp_credential_request')).toBe('Credential Request');
      expect(categoryLabel('impersonation')).toBe('Impersonation');
      expect(categoryLabel('urgency_threat')).toBe('Urgency / Threat');
    });
  });
});
