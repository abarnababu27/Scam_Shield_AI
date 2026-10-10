/**
 * Analyser — Facade for the detection pipeline
 *
 * Orchestrates indicator detection → risk scoring → journey building.
 * This ensures that all analysis paths (manual input, scenarios)
 * use the same pipeline.
 */

import { detectIndicators, DetectedIndicator } from './indicators';
import { computeRisk, RiskAssessment } from './scoring';
import { buildJourney, ScamJourney } from './journey';

export interface AnalysisResult {
  message: string;
  timestamp: string;
  indicators: DetectedIndicator[];
  risk: RiskAssessment;
  journey: ScamJourney;
}

export interface AnalysisError {
  type: 'empty' | 'too_long' | 'invalid';
  message: string;
}

const MAX_MESSAGE_LENGTH = 5000;

/**
 * Validates input and runs the full analysis pipeline.
 */
export function analyseMessage(
  message: string
): { success: true; result: AnalysisResult } | { success: false; error: AnalysisError } {
  // Validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      success: false,
      error: {
        type: 'empty',
        message: 'Please enter a message to analyse. The input cannot be empty.',
      },
    };
  }

  const trimmed = message.trim();

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: {
        type: 'too_long',
        message: `The message is too long (${trimmed.length} characters). Maximum allowed: ${MAX_MESSAGE_LENGTH} characters.`,
      },
    };
  }

  // Detection pipeline
  const indicators = detectIndicators(trimmed);
  const risk = computeRisk(indicators);
  const journey = buildJourney(indicators);

  return {
    success: true,
    result: {
      message: trimmed,
      timestamp: new Date().toISOString(),
      indicators,
      risk,
      journey,
    },
  };
}

export { MAX_MESSAGE_LENGTH };
