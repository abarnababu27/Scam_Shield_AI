/**
 * Risk Scoring Module
 *
 * Computes a risk score from detected indicators.
 *
 * SCORING METHOD (documented):
 * 1. Each indicator has a weight (0.0–1.0) representing its significance.
 * 2. Weights are summed but capped at 1.0.
 * 3. A combination bonus is applied when multiple categories are present,
 *    because multi-stage scams are more dangerous than isolated signals.
 * 4. The final score is normalised to 0–100.
 *
 * Risk levels:
 *   0–20:  Low — Few or no warning signs detected.
 *  21–50:  Moderate — Some warning signs. Verify independently.
 *  51–75:  High — Multiple warning signs. Exercise extreme caution.
 *  76–100: Critical — Strong indicators of a potential scam.
 *
 * LIMITATIONS:
 * - This is a heuristic score, NOT a probability of fraud.
 * - A low score does NOT guarantee the message is safe.
 * - A high score does NOT prove criminal intent.
 * - The scoring does not account for message context beyond text patterns.
 */

import { DetectedIndicator } from './indicators';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskAssessment {
  score: number;          // 0–100
  level: RiskLevel;
  label: string;
  explanation: string;
  indicators: DetectedIndicator[];
  limitations: string[];
  recommendation: string;
}

/**
 * Combination bonus: having indicators from multiple distinct categories
 * increases risk because scams typically involve several coordinated tactics.
 */
function combinationBonus(categories: Set<string>): number {
  const n = categories.size;
  if (n <= 1) return 0;
  if (n === 2) return 0.08;
  if (n === 3) return 0.15;
  if (n === 4) return 0.22;
  return Math.min(0.30, 0.08 * (n - 1));
}

export function computeRisk(indicators: DetectedIndicator[]): RiskAssessment {
  const limitations = [
    'This assessment is based on text pattern matching, not comprehensive fraud analysis.',
    'A low risk score does not guarantee the message is safe.',
    'A high risk score does not prove that the sender has criminal intent.',
    'Context beyond the submitted text (sender identity, transaction history) is not analysed.',
    'Always verify suspicious requests independently through official channels.',
  ];

  if (indicators.length === 0) {
    return {
      score: 0,
      level: 'low',
      label: 'No Warning Signs Detected',
      explanation:
        'No known scam indicators were detected in this message. However, the absence of detected patterns does not guarantee safety. New scam techniques may not match current detection rules.',
      indicators: [],
      limitations,
      recommendation:
        'If you have any doubts about this message, verify the sender through an official channel before taking action.',
    };
  }

  // Sum weights, deduplicating by category (take max weight per category)
  const categoryMaxWeight = new Map<string, number>();
  for (const ind of indicators) {
    const current = categoryMaxWeight.get(ind.category) ?? 0;
    categoryMaxWeight.set(ind.category, Math.max(current, ind.weight));
  }

  let rawScore = 0;
  for (const w of categoryMaxWeight.values()) {
    rawScore += w;
  }

  const bonus = combinationBonus(new Set(categoryMaxWeight.keys()));
  rawScore = Math.min(1.0, rawScore + bonus);
  const score = Math.round(rawScore * 100);

  let level: RiskLevel;
  let label: string;
  let explanation: string;
  let recommendation: string;

  if (score <= 20) {
    level = 'low';
    label = 'Low Risk';
    explanation = `Minor warning sign(s) detected. The message contains ${indicators.length} indicator(s), but they may be benign in context.`;
    recommendation =
      'Exercise normal caution. Verify the sender if the message was unexpected.';
  } else if (score <= 50) {
    level = 'moderate';
    label = 'Moderate Risk';
    explanation = `Several warning signs were detected (${indicators.length} indicator(s) across ${categoryMaxWeight.size} categories). This combination warrants careful review.`;
    recommendation =
      'Do not share sensitive information or make payments based on this message alone. Contact the purported sender through an independently verified channel.';
  } else if (score <= 75) {
    level = 'high';
    label = 'High Risk';
    explanation = `Multiple significant warning signs were detected (${indicators.length} indicator(s) across ${categoryMaxWeight.size} categories). The combination of these indicators is commonly associated with financial scam patterns.`;
    recommendation =
      'Do not respond to this message. Do not share any personal information, OTPs, or PINs. Report it to your bank or the relevant authority. If money has been sent, contact your bank immediately.';
  } else {
    level = 'critical';
    label = 'Critical Risk';
    explanation = `Strong and numerous warning signs were detected (${indicators.length} indicator(s) across ${categoryMaxWeight.size} categories). This message exhibits multiple hallmarks of known scam workflows.`;
    recommendation =
      'Do not engage with this message under any circumstances. Report it immediately to your bank and local cyber-crime helpline (1930 in India). If you have already shared information, change your passwords and contact your bank.';
  }

  return {
    score,
    level,
    label,
    explanation,
    indicators,
    limitations,
    recommendation,
  };
}
