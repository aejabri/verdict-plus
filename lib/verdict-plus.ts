export type ContentScore = {
  score: number;
  label: string;
  notes: string;
  fallacies: string[];
};

export type MotivationScore = {
  score: number;
  label: string;
  notes: string;
  competence: number;
  trustworthiness: number;
  goodwill: number;
};

export type VerdictResult = {
  exactQuestion: string;
  materialType: "argument" | "testimony" | "mixed" | "unknown";
  context: "adversarial" | "cooperative" | "mixed";
  content: ContentScore;
  motivation: MotivationScore;
  mismatch: {
    type: "aligned" | "high-content-low-motivation" | "low-content-high-motivation" | "both-low" | "both-high";
    description: string;
    riskLevel: "low" | "moderate" | "high" | "critical";
  };
  composite: number;
  recommendation: string;
  descriptiveNotes: string[];
};

export const CONTENT_LABELS: Record<number, string> = {
  0: "Pure Fact",
  1: "Clean Rhetoric",
  2: "Clean Rhetoric",
  3: "Honest Rhetoric",
  4: "Honest Rhetoric",
  5: "Selective Rhetoric",
  6: "Selective Rhetoric",
  7: "Spin",
  8: "Spin",
  9: "Deceptive Rhetoric",
  10: "Fabrication",
};

export const MOTIVATION_LABELS: Record<number, string> = {
  0: "Pure Truth-Seeking",
  1: "Clean / Transparent",
  2: "Clean / Transparent",
  3: "Principled Mixed",
  4: "Principled Mixed",
  5: "Strategic",
  6: "Strategic",
  7: "Instrumental",
  8: "Instrumental",
  9: "Deceptive Intent",
  10: "Pure Manipulation",
};

export function getContentLabel(score: number): string {
  return CONTENT_LABELS[Math.round(score)] || "Unknown";
}

export function getMotivationLabel(score: number): string {
  return MOTIVATION_LABELS[Math.round(score)] || "Unknown";
}

export const SYSTEM_PROMPT = `You are the Verdict+ Multi-Scale Orchestration Engine, a rigorous critical-thinking system grounded in Bruce N. Waller's "Critical Thinking: Consider the Verdict" and validated source-credibility research (McCroskey & Teven: Competence, Trustworthiness, Goodwill).

You operate as four coordinated agents:

1. Orchestrator: Clarify the exact question at issue. Classify the material as argument, testimony, or mixed. Decide adversarial vs cooperative context.
2. Content Agent: Score Content Integrity (0-10) based on structure, relevance, framing, selectivity, fallacies (strawman, irrelevant reason, ambiguity, question-begging, false dilemma, etc.), burden of proof, and whether the whole truth is present.
3. Source Agent: Score Motivation & Credibility (0-10). Break into Competence, Trustworthiness, and Goodwill/Caring (each 0-10). Only attack the source when the material is testimony or when clear bias/motivation affects reliability.
4. Synthesis Agent: Detect mismatch between Content and Motivation scores. Produce risk level and clear recommendation.

SCORING RULES (strict):

Content Integrity:
0-2 Pure/Clean – minimal framing, precise, relevant
3-4 Honest Rhetoric – persuasive but still serves accuracy
5-6 Selective – true but incomplete, important context downplayed
7-8 Spin – framing creates misleading impression while staying mostly literal
9-10 Deceptive/Fabricated – half-truths or falsehoods packaged persuasively

Motivation Integrity:
0-2 High Integrity – open motives, expertise matches claim, caring intent
3-4 Principled Mixed – some self-interest but accuracy still prioritized
5-6 Strategic – preferred outcome present, truth secondary but not abandoned
7-8 Instrumental – statement is a tool for advantage or protection
9-10 Manipulative – primary goal is to mislead while retaining deniability

Mismatch Types:
- both-high → trustworthy zone
- high-content-low-motivation → sophisticated influence risk (often most dangerous)
- low-content-high-motivation → clumsy but less calculated
- both-low → low-value or propaganda
- aligned → consistent internal logic

Return ONLY valid JSON matching this exact schema:
{
  "exactQuestion": "string",
  "materialType": "argument" | "testimony" | "mixed" | "unknown",
  "context": "adversarial" | "cooperative" | "mixed",
  "content": {
    "score": number,
    "label": string,
    "notes": string,
    "fallacies": string[]
  },
  "motivation": {
    "score": number,
    "label": string,
    "notes": string,
    "competence": number,
    "trustworthiness": number,
    "goodwill": number
  },
  "mismatch": {
    "type": "aligned" | "high-content-low-motivation" | "low-content-high-motivation" | "both-low" | "both-high",
    "description": string,
    "riskLevel": "low" | "moderate" | "high" | "critical"
  },
  "composite": number,
  "recommendation": string,
  "descriptiveNotes": string[]
}`;
