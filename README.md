# ScamShield AI

**See the Pattern. Understand the Risk. Act Before It's Too Late.**

ScamShield AI is a client-side web application for analysing suspicious financial messages, identifying scam warning signs, and visualising how those indicators connect into potential scam workflows.

> **Hackathon Prototype** — All data is synthetic. This is not a production fraud-detection system.

---

## Problem Statement

**AI-Driven Scam Pattern Recognition** — Detect emerging scam workflows in UPI, banking, and wallet contexts and deliver timely, useful alerts without creating alert fatigue.

Scams rarely happen in a single step. They typically involve coordinated tactics: impersonation, urgency, credential requests, and payment instructions. ScamShield AI analyses available evidence, connects related warning signs, explains potential risks, and helps users decide what to do next.

### Core Principles

1. **Scam Journey Intelligence** — Connect warning signs into a visual, interactive workflow.
2. **Explainable Risk Assessment** — Every score is backed by specific evidence and a documented method.
3. **Alert Fatigue Reduction** — Group related alerts, deduplicate, and escalate only when justified.

---

## Features

### 1. Overview Dashboard
- Project introduction with headline and call-to-action buttons
- Illustrative scam journey preview (Impersonation → Urgency → Info Request → Payment)
- Core capabilities summary

### 2. Message Analysis Workspace
- Paste any suspicious message for analysis
- Character count, input validation (empty, too-long)
- Load pre-built example scenarios with one click
- Loading and error states
- Results show: risk score, risk level, detected indicators with evidence, recommendation, limitations
- Each indicator is expandable with description, evidence excerpts, and confidence level
- Link to view the Scam Journey for the current analysis

### 3. Scam Journey Explorer *(Signature Feature)*
- Interactive timeline of detected warning stages
- Click any stage to see: warning sign, supporting evidence, why it matters, contribution to assessment, uncertainties, safety recommendation
- Marks inferred connections vs. directly observed evidence
- Only shows stages supported by evidence — never fabricates missing stages
- Responsive layout (stacks on mobile)

### 4. Alert Intelligence
- Synthetic event simulation with 14 events across 4 scenarios
- **Consolidated View**: grouped alerts with escalation history, deduplication counts
- **Individual View**: all raw alert events
- Stats dashboard: total events, consolidated count, deduplicated count, reduction percentage
- All counts are computed from the actual synthetic data

### 5. Scenario Lab
- 7 synthetic scenarios (5 suspicious, 2 benign)
- Each card shows: title, description, message preview, expected warnings, expected assessment
- "Analyse This Example" button runs the real detection pipeline
- Results use the same engine as manual input

### 6. Methodology & Privacy
- Complete documentation of the detection engine, indicator categories, weights
- Risk scoring formula explained step by step
- Alert grouping rules documented
- Capability classification table (all rule-based, no ML)
- Known limitations listed honestly
- Privacy commitments with badges

---

## Architecture

```
ScamShield_AI/
├── index.html                  # Entry point with SEO meta tags
├── vite.config.ts              # Vite + React + Vitest config
├── tsconfig.json               # TypeScript strict config with JSX
├── package.json                # Dependencies and scripts
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Main app with navigation state
│   ├── index.css               # Complete design system (CSS custom properties)
│   ├── vite-env.d.ts           # Vite type declarations
│   ├── engine/                 # Analysis engine (no external dependencies)
│   │   ├── indicators.ts       # Pattern-based indicator detection
│   │   ├── scoring.ts          # Weighted risk scoring
│   │   ├── journey.ts          # Journey stage construction
│   │   ├── alerts.ts           # Alert grouping, deduplication, escalation
│   │   ├── analyser.ts         # Pipeline facade (validation → detection → scoring → journey)
│   │   └── scenarios.ts        # 7 synthetic example scenarios
│   ├── components/             # React UI components
│   │   ├── Logo.tsx            # Custom SVG shield + nodes logo
│   │   ├── Sidebar.tsx         # Navigation (desktop sidebar, mobile hamburger)
│   │   ├── OverviewPage.tsx    # Landing / overview
│   │   ├── AnalysePage.tsx     # Message input + results display
│   │   ├── JourneyPage.tsx     # Interactive scam journey timeline
│   │   ├── AlertsPage.tsx      # Alert consolidation comparison
│   │   ├── ScenariosPage.tsx   # Scenario library
│   │   └── MethodologyPage.tsx # Documentation + privacy
│   └── test/                   # Vitest test suite
│       ├── setup.ts            # jest-dom setup
│       ├── indicators.test.ts  # 13 tests for indicator detection
│       ├── scoring.test.ts     # 6 tests for risk scoring
│       ├── journey.test.ts     # 8 tests for journey builder
│       ├── alerts.test.ts      # 8 tests for alert grouping
│       ├── analyser.test.ts    # 13 tests for full pipeline + all scenarios
│       └── verify.ts           # Comprehensive engine verification script (90 checks)
```

**All analysis runs client-side in the browser.** No backend server, no external API calls, no data transmission. This was a deliberate architectural choice for the prototype — it simplifies deployment and eliminates privacy concerns about message data leaving the user's device.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 | UI components and state management |
| Language | TypeScript (strict) | Type safety across engine and UI |
| Build | Vite 6 | Development server and production bundling |
| Icons | Lucide React | Consistent icon library |
| Testing | Vitest + jsdom | Unit tests for engine modules |
| Testing Utils | Testing Library (jest-dom) | DOM assertion matchers |
| Styling | Vanilla CSS (custom properties) | Design system with responsive breakpoints |

**No backend. No external AI APIs. No machine learning models.** The detection engine is entirely rule-based (regex pattern matching with weighted scoring).

---

## Installation

```bash
# Clone or navigate to the project directory
cd ScamShield_AI

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests (48 tests across 5 suites) |
| `npm run test:watch` | Run tests in watch mode |

---

## Testing

48 tests across 5 test suites:

| Suite | Tests | Covers |
|-------|-------|--------|
| `indicators.test.ts` | 13 | Pattern detection, false positives, determinism, evidence extraction |
| `scoring.test.ts` | 6 | Risk levels, determinism, limitations, recommendations |
| `journey.test.ts` | 8 | Stage ordering, fabrication prevention, disclaimers, safety tips |
| `alerts.test.ts` | 8 | Grouping, deduplication, escalation, severity sorting |
| `analyser.test.ts` | 13 | Full pipeline, input validation, all 7 scenarios |

```bash
npm test
```

All 48 tests pass as of the latest run.

---

## Privacy Considerations

- **No data leaves the browser.** All text analysis runs locally in JavaScript.
- **No data persistence.** Submitted text is held only in React component state and discarded on navigation.
- **No external API calls.** The app makes zero network requests during analysis.
- **No real credentials.** The app never requests OTPs, PINs, passwords, or card details.
- **No live banking connections.** The app does not connect to any financial systems.
- **Safe rendering.** User input is rendered as text content, never as HTML, preventing XSS.
- **No link execution.** Suspicious URLs in submitted text are never opened or followed.

---

## Known Limitations

1. **Rule-based only.** Detection relies on regex pattern matching — no trained ML models. Novel scam patterns that don't match current rules will be missed.
2. **English text only.** Pattern matching works primarily with English. Other languages have limited or no support.
3. **No context awareness.** The engine analyses individual messages in isolation. It cannot consider sender identity, conversation history, or transaction patterns.
4. **Heuristic scoring.** The risk score is a weighted heuristic, not a calibrated probability. It should not be interpreted as "X% chance of fraud."
5. **No real-world validation.** The system has been tested only against synthetic scenarios, not real scam data at scale.
6. **Alert grouping is simulated.** The demo uses synthetic events with predefined scenario IDs. Real-world alert correlation would require more sophisticated techniques.
7. **Single-message analysis.** The system cannot track multi-message conversations or analyse call recordings.

---

## Two-Minute Demo Guide

1. **Overview** — Read the headline and see the illustrative scam journey flow.
2. **Analyse a Message** — Click "Analyse a Message", then click "Bank OTP Impersonation" to load an example. Click "Analyse". Review the risk score, indicators (expand them), and recommendation.
3. **Scam Journey** — Click "View Journey" in the results, or navigate via sidebar. Click each stage to see evidence and safety tips.
4. **Alert Intelligence** — Navigate to "Alert Intelligence". Note the 4 consolidated alerts from 14 raw events. Toggle between views. Expand the banking impersonation alert to see escalation history.
5. **Scenario Lab** — Navigate to "Scenario Lab". Click "Analyse This Example" on the benign notification — note the low risk score. Compare with any suspicious scenario.
6. **Methodology** — Navigate to "Methodology & Privacy" to see how scoring works and privacy commitments.

---

## Future Improvements

- Multi-language support (Hindi, Tamil, and other Indian languages)
- NLP-based semantic analysis for context-aware detection
- Multi-message conversation threading
- Real-time UPI transaction monitoring integration
- User feedback loop for continuous improvement
- Accessibility audit (WCAG 2.1 AA compliance)
- Browser extension for in-context message scanning
- Mobile-native app with push notifications

---

## License

This project was created for hackathon demonstration purposes.
