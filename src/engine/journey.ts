/**
 * Scam Journey Builder
 *
 * Constructs a journey (sequence of connected stages) from detected indicators.
 *
 * The journey represents the POTENTIAL progression of a scam workflow.
 * It orders detected indicators into a logical sequence that matches
 * known scam patterns.
 *
 * IMPORTANT:
 * - Only stages supported by evidence are included.
 * - No stages are fabricated.
 * - If only one indicator is found, a single-stage journey is returned
 *   with an explanation that a full sequence cannot be established.
 * - Relationships between stages are INFERRED, not proven.
 */

import { DetectedIndicator, IndicatorCategory } from './indicators';

export interface JourneyStage {
  id: string;
  order: number;
  indicator: DetectedIndicator;
  stageLabel: string;
  whyItMatters: string;
  safetyTip: string;
  uncertainties: string[];
  isInferred: boolean;
}

export interface ScamJourney {
  stages: JourneyStage[];
  summary: string;
  hasMultipleStages: boolean;
  disclaimer: string;
}

/**
 * Defines the canonical order of scam stages.
 * Stages are ordered by their typical position in a scam workflow.
 */
const STAGE_ORDER: Record<IndicatorCategory, number> = {
  impersonation: 1,
  social_engineering: 2,
  urgency_threat: 3,
  sensitive_info_request: 4,
  otp_credential_request: 5,
  suspicious_link: 6,
  payment_instruction: 7,
  remote_access: 8,
};

const STAGE_LABELS: Record<IndicatorCategory, string> = {
  impersonation: 'Identity Claim',
  social_engineering: 'Trust Building',
  urgency_threat: 'Pressure Tactics',
  sensitive_info_request: 'Information Gathering',
  otp_credential_request: 'Credential Extraction',
  suspicious_link: 'Link Deployment',
  payment_instruction: 'Payment Demand',
  remote_access: 'Device Access',
};

const WHY_IT_MATTERS: Record<IndicatorCategory, string> = {
  impersonation:
    'Scammers often impersonate trusted institutions to establish credibility before making requests.',
  social_engineering:
    'Building false trust or excitement lowers the victim\'s guard and makes them more likely to comply with later demands.',
  urgency_threat:
    'Creating artificial time pressure prevents the victim from thinking critically or verifying the request.',
  sensitive_info_request:
    'Collecting personal information enables identity theft or is used to bypass account security.',
  otp_credential_request:
    'OTPs and PINs provide direct access to accounts. No legitimate institution requests these via message.',
  suspicious_link:
    'Malicious links can lead to phishing pages that steal credentials or install malware.',
  payment_instruction:
    'Fraudulent payment demands are the primary way scammers extract money from victims.',
  remote_access:
    'Remote access tools give scammers complete control of the victim\'s device, enabling theft of data and funds.',
};

const SAFETY_TIPS: Record<IndicatorCategory, string> = {
  impersonation:
    'Verify the sender\'s identity by contacting the institution directly using a number from their official website.',
  social_engineering:
    'Be sceptical of unsolicited offers, prizes, or emotional appeals from unknown senders.',
  urgency_threat:
    'Take a pause. Genuine institutions allow reasonable time for verification.',
  sensitive_info_request:
    'Never share personal details through unverified channels. Banks will not ask for this via SMS or call.',
  otp_credential_request:
    'Never share OTPs, PINs, or passwords with anyone. End the conversation immediately.',
  suspicious_link:
    'Do not click links from unknown sources. Manually navigate to the official website instead.',
  payment_instruction:
    'Verify any payment request through the official app or website of the institution.',
  remote_access:
    'Never install remote access software at anyone\'s request unless you initiated the support call through an official channel.',
};

export function buildJourney(indicators: DetectedIndicator[]): ScamJourney {
  const disclaimer =
    'This journey is an analytical reconstruction based on detected text patterns. ' +
    'The connections between stages are inferred, not proven. ' +
    'This visualisation does not constitute evidence of fraud.';

  if (indicators.length === 0) {
    return {
      stages: [],
      summary: 'No warning signs were detected, so no scam journey can be constructed.',
      hasMultipleStages: false,
      disclaimer,
    };
  }

  // Deduplicate by category, keeping the indicator with more evidence
  const bestByCategory = new Map<IndicatorCategory, DetectedIndicator>();
  for (const ind of indicators) {
    const existing = bestByCategory.get(ind.category);
    if (!existing || ind.evidence.length > existing.evidence.length) {
      bestByCategory.set(ind.category, ind);
    }
  }

  // Sort by canonical stage order
  const sorted = Array.from(bestByCategory.values()).sort(
    (a, b) => (STAGE_ORDER[a.category] ?? 99) - (STAGE_ORDER[b.category] ?? 99)
  );

  const stages: JourneyStage[] = sorted.map((ind, index) => ({
    id: `stage-${index}`,
    order: index + 1,
    indicator: ind,
    stageLabel: STAGE_LABELS[ind.category] ?? ind.label,
    whyItMatters: WHY_IT_MATTERS[ind.category] ?? ind.description,
    safetyTip: SAFETY_TIPS[ind.category] ?? 'Verify through official channels.',
    uncertainties: getUncertainties(ind),
    isInferred: index > 0, // First stage is directly observed; connections are inferred
  }));

  const hasMultipleStages = stages.length > 1;

  let summary: string;
  if (!hasMultipleStages) {
    summary =
      `One warning sign was detected: ${stages[0].stageLabel}. ` +
      'A single indicator is insufficient to establish a multi-stage scam pattern. ' +
      'The message may still warrant caution.';
  } else {
    const stageNames = stages.map((s) => s.stageLabel).join(' → ');
    summary =
      `${stages.length} connected warning signs were detected, suggesting a potential multi-stage pattern: ${stageNames}. ` +
      'The connections between these stages are inferred from their co-occurrence in the same message.';
  }

  return { stages, summary, hasMultipleStages, disclaimer };
}

function getUncertainties(indicator: DetectedIndicator): string[] {
  const uncertainties: string[] = [];

  if (indicator.confidence === 'low') {
    uncertainties.push('This pattern has a higher false-positive rate.');
  }
  if (indicator.confidence === 'medium') {
    uncertainties.push('This indicator alone does not confirm a scam.');
  }

  uncertainties.push('The sender\'s true identity has not been verified.');
  uncertainties.push('The full conversation context is not available for analysis.');

  return uncertainties;
}
