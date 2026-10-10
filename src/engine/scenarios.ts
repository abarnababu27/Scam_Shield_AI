/**
 * Scenario Library
 *
 * Contains synthetic example scenarios for demonstration.
 * ALL scenarios are synthetic test content and do not represent real messages.
 */

export interface Scenario {
  id: string;
  title: string;
  description: string;
  message: string;
  expectedWarnings: string[];
  expectedAssessment: string;
  isSuspicious: boolean;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-otp-impersonation',
    title: 'Bank OTP Impersonation',
    description:
      'A message impersonating a bank representative, creating urgency about account suspension, and requesting an OTP.',
    message:
      'Dear Customer, this is the SBI Fraud Prevention Team. Your account has been flagged for suspicious activity and will be blocked within 2 hours. To prevent this, please share the OTP sent to your registered mobile number immediately. Failure to comply will result in permanent account suspension. Do not ignore this message.',
    expectedWarnings: [
      'Impersonation — claims SBI affiliation',
      'Urgency — "blocked within 2 hours", "immediately"',
      'OTP request — asks to "share the OTP"',
      'Threat — "permanent account suspension"',
    ],
    expectedAssessment:
      'High to critical risk. Multi-stage pattern: impersonation → urgency → credential request.',
    isSuspicious: true,
  },
  {
    id: 'scenario-fake-support',
    title: 'Fake Customer Support Refund',
    description:
      'A message posing as customer support offering a refund and requesting installation of remote access software.',
    message:
      'Congratulations! You have been selected for a refund of Rs. 2,500 on your recent Amazon order. To process your refund, please download and install AnyDesk on your phone and share the 9-digit code with our support team. Keep this confidential and do not tell anyone about this process.',
    expectedWarnings: [
      'Social engineering — "Congratulations", "selected for a refund"',
      'Payment — mentions refund amount Rs. 2,500',
      'Remote access — asks to install AnyDesk',
      'Secrecy — "keep this confidential", "do not tell anyone"',
    ],
    expectedAssessment:
      'High risk. Combines social engineering, remote access request, and secrecy demands.',
    isSuspicious: true,
  },
  {
    id: 'scenario-urgent-collect',
    title: 'Urgent UPI Collect Request',
    description:
      'An urgent message about an incoming UPI payment that requires approval and threatens reversal.',
    message:
      'URGENT: You have a pending UPI collect request of Rs. 15,000 from RBI_REFUND@ybl. This is your last chance to accept. If not accepted within 10 minutes, the amount will be reversed and a penalty of Rs. 500 will be charged. Accept the payment request on your UPI app right now.',
    expectedWarnings: [
      'Urgency — "URGENT", "last chance", "within 10 minutes"',
      'Impersonation — fake UPI ID impersonating RBI',
      'Payment instruction — accept collect request',
      'Threat — penalty if not accepted',
    ],
    expectedAssessment:
      'High risk. UPI collect requests from unknown sources should never be accepted without verification.',
    isSuspicious: true,
  },
  {
    id: 'scenario-phishing-link',
    title: 'Suspicious KYC Update Link',
    description:
      'A message urging the user to update KYC details through a suspicious link or face account deactivation.',
    message:
      'Dear valued customer, your bank account KYC verification is pending and will expire today. Update your KYC immediately by clicking on this link: http://sbi-kyc-update.fakesecure.com/verify. Your account will be deactivated if not completed by end of day. — HDFC Bank Support',
    expectedWarnings: [
      'Impersonation — claims to be HDFC Bank',
      'Sensitive info request — KYC verification',
      'Suspicious link — non-official domain',
      'Urgency — "expire today", "immediately"',
    ],
    expectedAssessment:
      'High risk. The link leads to a non-official domain. Banks never send KYC links via SMS.',
    isSuspicious: true,
  },
  {
    id: 'scenario-remote-access',
    title: 'Tech Support Remote Access Scam',
    description:
      'A call script claiming to be from a tech company requesting remote access to fix a fictitious problem.',
    message:
      'This is Microsoft Support calling about a security breach detected on your computer. Your personal data and banking information are at risk. Please install TeamViewer immediately and give us the access code so we can secure your system. If you delay, hackers will steal your bank details within the next hour. Send Rs. 3,000 via UPI to secure@techsupport for the security service fee.',
    expectedWarnings: [
      'Impersonation — claims Microsoft affiliation',
      'Remote access — requests TeamViewer installation',
      'Urgency — "immediately", "within the next hour"',
      'Payment instruction — Rs. 3,000 via UPI',
      'Threat — "hackers will steal your bank details"',
    ],
    expectedAssessment:
      'Critical risk. Combines impersonation, remote access, payment demand, and fear tactics.',
    isSuspicious: true,
  },
  {
    id: 'scenario-benign',
    title: 'Legitimate Transaction Notification',
    description:
      'A standard bank notification for a completed transaction. This example should NOT trigger high risk alerts.',
    message:
      'Your account XX5432 has been debited by Rs. 1,250.00 for POS transaction at Big Bazaar, Mumbai on 09-Oct-2026. Available balance: Rs. 45,320.50. If you did not make this transaction, call 1800-XXX-XXXX.',
    expectedWarnings: [],
    expectedAssessment:
      'Low risk. Standard transaction notification with no suspicious indicators.',
    isSuspicious: false,
  },
  {
    id: 'scenario-benign-2',
    title: 'Monthly Statement Reminder',
    description:
      'A routine notification about a monthly account statement. Should not trigger warning signs.',
    message:
      'Your monthly account statement for September 2026 is now available. You can view it in your net banking portal or the mobile banking app. For any queries, visit your nearest branch.',
    expectedWarnings: [],
    expectedAssessment:
      'Low risk. Routine bank communication with no suspicious patterns.',
    isSuspicious: false,
  },
];
