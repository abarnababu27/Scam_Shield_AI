/**
 * Indicator Detection Engine
 *
 * Detects warning signs in financial messages using pattern matching.
 * Each indicator has a category, patterns, weight, and description.
 *
 * IMPORTANT: This is a rule-based heuristic engine for demonstration.
 * It does NOT use trained ML models. It does NOT guarantee detection
 * of real-world scams.
 */

export type IndicatorCategory =
  | 'otp_credential_request'
  | 'impersonation'
  | 'urgency_threat'
  | 'payment_instruction'
  | 'remote_access'
  | 'suspicious_link'
  | 'sensitive_info_request'
  | 'social_engineering';

export interface DetectedIndicator {
  id: string;
  category: IndicatorCategory;
  label: string;
  description: string;
  evidence: string[];
  weight: number;
  confidence: 'high' | 'medium' | 'low';
}

interface IndicatorPattern {
  category: IndicatorCategory;
  label: string;
  description: string;
  patterns: RegExp[];
  weight: number;
  confidence: 'high' | 'medium' | 'low';
}

const INDICATOR_PATTERNS: IndicatorPattern[] = [
  // OTP / Credential Requests
  {
    category: 'otp_credential_request',
    label: 'OTP or Password Request',
    description: 'The message asks for a one-time password, PIN, CVV, or login credentials. Legitimate institutions never request these via message.',
    patterns: [
      /\b(share|send|provide|enter|give|tell|verify|confirm)\b.{0,30}\b(otp|one[- ]?time[- ]?password|pin|cvv|password|passcode|secret[- ]?code|security[- ]?code|verification[- ]?code|mpin|upi[- ]?pin)\b/i,
      /\b(otp|pin|cvv|password|passcode|mpin|upi[- ]?pin|security[- ]?code)\b.{0,30}\b(share|send|provide|enter|give|tell|verify|confirm|required|needed)\b/i,
      /\benter\s+(your|the)\s+(otp|pin|password|cvv|mpin)\b/i,
      /\botp\s+(is|was|has been)\s+(sent|generated)\b.{0,50}\b(share|enter|provide|verify)\b/i,
    ],
    weight: 0.35,
    confidence: 'high',
  },
  // Impersonation
  {
    category: 'impersonation',
    label: 'Possible Impersonation',
    description: 'The message appears to claim affiliation with a known institution, authority, or service provider. This does not prove the claim is false, but it is a common scam tactic.',
    patterns: [
      /\b(this is|i am|calling from|representative of|team at|department of|officer from|agent from|support team)\b.{0,40}\b(bank|rbi|reserve bank|sbi|hdfc|icici|axis|paytm|phonepe|google pay|gpay|amazon|flipkart|police|cyber cell|income tax|it department|customs|court|government)\b/i,
      /\b(bank|rbi|sbi|hdfc|icici|axis|paytm|phonepe|google pay|gpay|amazon|income tax)\b.{0,30}\b(official|helpdesk|support|customer care|representative|agent|team|department)\b/i,
      /\bdear\s+(customer|user|account\s*holder|sir|madam|valued)\b/i,
      /\b(share|verify|confirm|update)\b.{0,30}\b(your\s+)?(account|a\/c)\s+(number|no\.?|#)\s*[\w\*]+\b/i,
    ],
    weight: 0.20,
    confidence: 'medium',
  },
  // Urgency / Threats
  {
    category: 'urgency_threat',
    label: 'Artificial Urgency or Threat',
    description: 'The message creates pressure to act immediately through threats of account closure, legal action, or time-limited demands.',
    patterns: [
      /\b(immediately|urgent|urgently|right now|right away|within\s+\d+\s*(hours?|minutes?|mins?)|today itself|asap|at once|without delay)\b/i,
      /\b(will be|shall be|going to be|about to be)\s+(blocked|suspended|frozen|closed|terminated|deactivated|locked|cancelled|seized|disabled)\b/i,
      /\b(legal|police|fir|arrest|warrant|court|prosecution|penalty|fine|jail)\s+(action|notice|complaint|case|proceedings)\b/i,
      /\b(last|final)\s+(chance|warning|notice|reminder|opportunity)\b/i,
      /\b(failure|failing)\s+to\s+(comply|respond|verify|complete|act)\b/i,
      /\b(do not|don'?t)\s+(ignore|delay|neglect)\b/i,
      /\b(expire|expiring|expires|expired|lapse|lapsing)\s+(today|soon|shortly|within|in\s+\d+)\b/i,
    ],
    weight: 0.20,
    confidence: 'medium',
  },
  // Payment Instructions
  {
    category: 'payment_instruction',
    label: 'Suspicious Payment Instruction',
    description: 'The message contains instructions to transfer money, pay fees, or complete a financial transaction that may be fraudulent.',
    patterns: [
      /\b(transfer|send|pay|deposit|remit)\b.{0,30}\b(rs\.?|inr|₹|\$|amount|fee|charge|fine|penalty|tax)\s*\d/i,
      /\b(pay|send|transfer|deposit)\b.{0,20}\b(rs\.?|inr|₹)\s*\d[\d,]*\b/i,
      /\b(upi|neft|rtgs|imps|bank\s*transfer|wire\s*transfer|money\s*order)\b.{0,30}\b(to|into|at)\b/i,
      /\b(collect|payment)\s*(request|link)\b/i,
      /\b(pay|send)\s+(to|via|through|using)\s+(upi|paytm|phonepe|gpay|google pay|bhim)\b/i,
      /\brefund\b.{0,40}\b(process|claim|collect|receive)\b.{0,40}\b(pay|fee|charge|amount)\b/i,
    ],
    weight: 0.25,
    confidence: 'medium',
  },
  // Remote Access
  {
    category: 'remote_access',
    label: 'Remote Access Software Request',
    description: 'The message asks to install or use remote access software, which can give scammers full control of the device.',
    patterns: [
      /\b(install|download|open|run|start|use)\b.{0,30}\b(anydesk|teamviewer|quicksupport|quick support|ammyy|ultraviewer|airdroid|remote\s*desktop|screen\s*share|screen\s*sharing)\b/i,
      /\b(anydesk|teamviewer|quicksupport|quick support|ammyy|ultraviewer)\b.{0,30}\b(install|download|open|code|id|number)\b/i,
      /\b(remote|screen)\s*(access|control|sharing|share|view)\b.{0,20}\b(app|application|software|tool)\b/i,
    ],
    weight: 0.30,
    confidence: 'high',
  },
  // Suspicious Links
  {
    category: 'suspicious_link',
    label: 'Suspicious Link Detected',
    description: 'The message contains a URL that may lead to a phishing page or malicious site. The link has not been verified.',
    patterns: [
      /https?:\/\/(?!(?:www\.)?(?:google\.com|facebook\.com|twitter\.com|linkedin\.com|youtube\.com|wikipedia\.org|github\.com)\b)[a-zA-Z0-9][\w.-]*\.[a-z]{2,}(?:\/\S*)?/i,
      /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|is\.gd|cutt\.ly|shorturl\.at)\b/i,
      /\b(click|tap|open|visit|go\s+to)\b.{0,20}\b(link|url|website|page|portal|site)\b/i,
    ],
    weight: 0.15,
    confidence: 'low',
  },
  // Sensitive Info Requests
  {
    category: 'sensitive_info_request',
    label: 'Request for Sensitive Information',
    description: 'The message asks for personal or financial details such as account numbers, Aadhaar, PAN, or card details.',
    patterns: [
      /\b(share|send|provide|enter|give|verify|confirm|update)\b.{0,30}\b(aadhaar|aadhar|pan\s*(card|number)?|account\s*(number|details|no\.?)|card\s*(number|details)|bank\s*details|ifsc|routing\s*number|ssn|social\s*security)\b/i,
      /\b(aadhaar|pan|account|card)\s*(number|no\.?|details)\b.{0,30}\b(share|send|provide|enter|give|verify|confirm|update|required|needed)\b/i,
      /\bkyc\b.{0,30}\b(update|verify|complete|pending|expired|mandatory|required)\b/i,
    ],
    weight: 0.20,
    confidence: 'medium',
  },
  // Social Engineering
  {
    category: 'social_engineering',
    label: 'Social Engineering Tactics',
    description: 'The message uses social engineering techniques such as prize notifications, lottery wins, or emotional manipulation.',
    patterns: [
      /\b(won|winner|congratulations|congrats|selected|chosen|lucky)\b.{0,30}\b(prize|reward|lottery|gift|cashback|offer|amount|money)\b/i,
      /\b(prize|reward|lottery|gift|cashback)\b.{0,30}\b(claim|collect|receive|redeem|won)\b/i,
      /\b(do not|don'?t)\s+(tell|inform|share|discuss)\s+(anyone|anybody|others|family|friends)\b/i,
      /\b(keep|maintain)\s+(this|it)\s+(secret|confidential|private|between us)\b/i,
    ],
    weight: 0.15,
    confidence: 'medium',
  },
];

/**
 * Detect indicators in a message.
 * Returns an array of detected indicators with supporting evidence.
 */
export function detectIndicators(message: string): DetectedIndicator[] {
  if (!message || typeof message !== 'string') return [];

  const normalised = message.trim();
  if (normalised.length === 0) return [];

  const detected: DetectedIndicator[] = [];
  let idCounter = 0;

  for (const pattern of INDICATOR_PATTERNS) {
    const evidenceSet = new Set<string>();

    for (const regex of pattern.patterns) {
      // Reset lastIndex for global-flagged regexes
      const r = new RegExp(regex.source, regex.flags);
      let match: RegExpExecArray | null;

      // Use exec for single matches per pattern
      match = r.exec(normalised);
      if (match) {
        // Extract surrounding context (up to 80 chars around match)
        const start = Math.max(0, match.index - 20);
        const end = Math.min(normalised.length, match.index + match[0].length + 20);
        const context = normalised.slice(start, end).trim();
        evidenceSet.add(context);
      }
    }

    if (evidenceSet.size > 0) {
      detected.push({
        id: `ind-${idCounter++}`,
        category: pattern.category,
        label: pattern.label,
        description: pattern.description,
        evidence: Array.from(evidenceSet),
        weight: pattern.weight,
        confidence: pattern.confidence,
      });
    }
  }

  return detected;
}

/**
 * Returns a human-readable category label.
 */
export function categoryLabel(category: IndicatorCategory): string {
  const labels: Record<IndicatorCategory, string> = {
    otp_credential_request: 'Credential Request',
    impersonation: 'Impersonation',
    urgency_threat: 'Urgency / Threat',
    payment_instruction: 'Payment Instruction',
    remote_access: 'Remote Access',
    suspicious_link: 'Suspicious Link',
    sensitive_info_request: 'Sensitive Information',
    social_engineering: 'Social Engineering',
  };
  return labels[category] || category;
}
