/**
 * Comprehensive verification script for ScamShield AI
 * Tests: message analysis differentiation, journey construction,
 * alert grouping/escalation, and scenario pipeline consistency.
 */

import { analyseMessage } from '../engine/analyser.ts';
import { detectIndicators } from '../engine/indicators.ts';
// scoring module tested via analyser pipeline
import { buildJourney } from '../engine/journey.ts';
import { groupAlerts, getSyntheticEvents } from '../engine/alerts.ts';
import { SCENARIOS } from '../engine/scenarios.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ═══════════════════════════════════════════════════
// 4. Message analysis uses actual submitted text
// ═══════════════════════════════════════════════════
console.log('\n═══ 4. Message Analysis Uses Actual Text ═══');

const scamMsg = 'Dear Customer, this is SBI support. Your account will be blocked within 2 hours. Share the OTP immediately.';
const benignMsg = 'Your monthly account statement for September 2026 is now available in your net banking portal.';

const scamResult = analyseMessage(scamMsg);
const benignResult = analyseMessage(benignMsg);

assert(scamResult.success === true, 'Scam message analysed successfully');
assert(benignResult.success === true, 'Benign message analysed successfully');

if (scamResult.success && benignResult.success) {
  assert(
    scamResult.result.risk.score > benignResult.result.risk.score,
    `Scam score (${scamResult.result.risk.score}) > benign score (${benignResult.result.risk.score})`
  );
  assert(
    scamResult.result.indicators.length > benignResult.result.indicators.length,
    `Scam indicators (${scamResult.result.indicators.length}) > benign indicators (${benignResult.result.indicators.length})`
  );
  // Evidence references actual text
  for (const ind of scamResult.result.indicators) {
    const hasEvidence = ind.evidence.length > 0;
    assert(hasEvidence, `Indicator "${ind.label}" has supporting evidence`);
    for (const e of ind.evidence) {
      // Evidence should be a substring-like excerpt from the original message
      const lowerMsg = scamMsg.toLowerCase();
      const lowerEvidence = e.toLowerCase();
      const matchesText = lowerMsg.includes(lowerEvidence) || lowerEvidence.split(' ').some(w => w.length > 3 && lowerMsg.includes(w));
      assert(matchesText, `Evidence "${e.substring(0, 50)}..." relates to input text`);
    }
  }
}

// Different messages produce different results
const msg1 = 'Share your OTP now or face account suspension.';
const msg2 = 'Download AnyDesk and share the code with our team for refund processing.';
const r1 = analyseMessage(msg1);
const r2 = analyseMessage(msg2);
if (r1.success && r2.success) {
  const cats1 = r1.result.indicators.map(i => i.category).sort().join(',');
  const cats2 = r2.result.indicators.map(i => i.category).sort().join(',');
  assert(cats1 !== cats2, `Different messages → different indicator categories ("${cats1}" vs "${cats2}")`);
}

// Identical input → identical output (determinism)
const det1 = analyseMessage(scamMsg);
const det2 = analyseMessage(scamMsg);
if (det1.success && det2.success) {
  assert(
    det1.result.risk.score === det2.result.risk.score,
    `Deterministic: same input → same score (${det1.result.risk.score} = ${det2.result.risk.score})`
  );
}

// ═══════════════════════════════════════════════════
// 5. Benign vs suspicious scenarios
// ═══════════════════════════════════════════════════
console.log('\n═══ 5. Scenario Differentiation ═══');

for (const scenario of SCENARIOS) {
  const result = analyseMessage(scenario.message);
  assert(result.success === true, `Scenario "${scenario.title}" analysed successfully`);
  if (result.success) {
    if (scenario.isSuspicious) {
      assert(
        result.result.risk.score > 20,
        `Suspicious "${scenario.title}" → score ${result.result.risk.score} > 20`
      );
      assert(
        result.result.indicators.length > 0,
        `Suspicious "${scenario.title}" → ${result.result.indicators.length} indicator(s)`
      );
    } else {
      assert(
        result.result.risk.level === 'low',
        `Benign "${scenario.title}" → level "${result.result.risk.level}" = "low"`,
        `Got score ${result.result.risk.score}`
      );
    }
  }
}

// ═══════════════════════════════════════════════════
// 6. Scam Journey Explorer
// ═══════════════════════════════════════════════════
console.log('\n═══ 6. Scam Journey Explorer ═══');

// Multi-indicator message → multi-stage journey
const complexMsg = 'Dear Customer, this is HDFC Bank support. Your account will be blocked within 1 hour. Share the OTP sent to your phone immediately. Transfer Rs 2000 processing fee via UPI to secure your account.';
const complexIndicators = detectIndicators(complexMsg);
const complexJourney = buildJourney(complexIndicators);

assert(complexJourney.stages.length >= 3, `Complex message → ${complexJourney.stages.length} journey stages (≥3)`);
assert(complexJourney.hasMultipleStages === true, 'Journey has multiple stages');
assert(complexJourney.disclaimer.length > 0, 'Journey has a disclaimer');

// Each stage has required fields
for (const stage of complexJourney.stages) {
  assert(stage.stageLabel.length > 0, `Stage ${stage.order} has label: "${stage.stageLabel}"`);
  assert(stage.indicator.evidence.length > 0, `Stage ${stage.order} has evidence`);
  assert(stage.whyItMatters.length > 0, `Stage ${stage.order} has "why it matters"`);
  assert(stage.safetyTip.length > 0, `Stage ${stage.order} has safety tip`);
  assert(stage.uncertainties.length > 0, `Stage ${stage.order} has uncertainties`);
}

// Stages are in ascending order
for (let i = 1; i < complexJourney.stages.length; i++) {
  assert(
    complexJourney.stages[i].order > complexJourney.stages[i - 1].order,
    `Stage ${complexJourney.stages[i].order} > Stage ${complexJourney.stages[i - 1].order} (ascending)`
  );
}

// First stage is directly observed, rest are inferred
if (complexJourney.stages.length > 1) {
  assert(complexJourney.stages[0].isInferred === false, 'First stage is directly observed');
  assert(complexJourney.stages[1].isInferred === true, 'Second stage is inferred connection');
}

// Single indicator → single-stage journey, not fabricated
const singleMsg = 'Share your OTP now.';
const singleIndicators = detectIndicators(singleMsg);
const singleJourney = buildJourney(singleIndicators);
assert(
  singleJourney.stages.length <= singleIndicators.length,
  `Single indicator → ${singleJourney.stages.length} stage(s) ≤ ${singleIndicators.length} indicator(s) (no fabrication)`
);
if (singleJourney.stages.length === 1) {
  assert(singleJourney.hasMultipleStages === false, 'Single stage → hasMultipleStages = false');
  assert(singleJourney.summary.includes('single'), 'Summary mentions single indicator');
}

// Benign message → empty or minimal journey
const benignIndicators = detectIndicators(benignMsg);
const benignJourney = buildJourney(benignIndicators);
assert(
  benignJourney.stages.length <= 1,
  `Benign message → ${benignJourney.stages.length} stages (≤1, no fabrication)`
);

// ═══════════════════════════════════════════════════
// 7. Alert Grouping and Escalation
// ═══════════════════════════════════════════════════
console.log('\n═══ 7. Alert Grouping & Escalation ═══');

const events = getSyntheticEvents();
const comparison = groupAlerts(events);

assert(comparison.totalRawCount === events.length, `Raw count = ${comparison.totalRawCount} = ${events.length}`);
assert(comparison.totalGroupedCount < comparison.totalRawCount, `Grouped (${comparison.totalGroupedCount}) < raw (${comparison.totalRawCount})`);
assert(comparison.deduplicatedTotal > 0, `Deduplicated count = ${comparison.deduplicatedTotal} > 0`);
assert(comparison.reductionPercentage > 0, `Reduction = ${comparison.reductionPercentage}% > 0`);

// Banking impersonation scenario should escalate to critical
const bankingGroup = comparison.groupedAlerts.find(g => g.scenarioId === 'scenario-banking-impersonation');
assert(bankingGroup !== undefined, 'Banking impersonation group exists');
if (bankingGroup) {
  assert(bankingGroup.currentSeverity === 'critical', `Banking group severity = "${bankingGroup.currentSeverity}" = "critical"`);
  assert(bankingGroup.escalationHistory.length >= 1, `Escalation history has ${bankingGroup.escalationHistory.length} entries (≥1)`);
  
  // Verify escalation goes up, never down
  for (const esc of bankingGroup.escalationHistory) {
    const sevOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
    assert(
      sevOrder[esc.to] > sevOrder[esc.from],
      `Escalation ${esc.from} → ${esc.to} is an increase`
    );
    assert(esc.reason.length > 0, 'Escalation has a reason');
  }

  // Deduplication within group
  assert(bankingGroup.deduplicatedCount > 0, `Banking group deduplicated ${bankingGroup.deduplicatedCount} events`);
}

// Grouped alerts sorted by severity (critical first)
const sevOrder: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
for (let i = 1; i < comparison.groupedAlerts.length; i++) {
  assert(
    sevOrder[comparison.groupedAlerts[i - 1].currentSeverity] >= sevOrder[comparison.groupedAlerts[i].currentSeverity],
    `Sort: ${comparison.groupedAlerts[i - 1].currentSeverity} ≥ ${comparison.groupedAlerts[i].currentSeverity}`
  );
}

// Unique scenario count matches
const uniqueScenarios = new Set(events.map(e => e.scenarioId));
assert(
  comparison.totalGroupedCount === uniqueScenarios.size,
  `Grouped count (${comparison.totalGroupedCount}) = unique scenarios (${uniqueScenarios.size})`
);

// ═══════════════════════════════════════════════════
// Input validation
// ═══════════════════════════════════════════════════
console.log('\n═══ Input Validation ═══');

const emptyResult = analyseMessage('');
assert(emptyResult.success === false, 'Empty input rejected');
if (!emptyResult.success) assert(emptyResult.error.type === 'empty', 'Error type = "empty"');

const whitespaceResult = analyseMessage('   \n\t  ');
assert(whitespaceResult.success === false, 'Whitespace-only input rejected');

const longResult = analyseMessage('a'.repeat(5001));
assert(longResult.success === false, 'Overlong input rejected');
if (!longResult.success) assert(longResult.error.type === 'too_long', 'Error type = "too_long"');

// Risk assessment always includes limitations
if (scamResult.success) {
  assert(scamResult.result.risk.limitations.length > 0, 'Risk assessment includes limitations');
  assert(
    scamResult.result.risk.limitations.some(l => l.includes('does not guarantee')),
    'Limitations mention no safety guarantee'
  );
  assert(scamResult.result.risk.recommendation.length > 0, 'Risk assessment includes recommendation');
}

// ═══════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════
console.log(`\n${'═'.repeat(50)}`);
console.log(`VERIFICATION COMPLETE: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

if (failed > 0) {
  throw new Error(`${failed} verification(s) failed`);
}
