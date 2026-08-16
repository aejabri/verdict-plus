import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, VerdictResult } from "@/lib/verdict-plus";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide content of at least 20 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(generateFallback(content, title));
    }

    const isXai = !!process.env.XAI_API_KEY;
    const endpoint = isXai
      ? "https://api.x.ai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = isXai ? "grok-3" : "gpt-4o";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the following content using the full Verdict+ Multi-Scale Orchestration.\n\nTitle (if any): ${title || "Untitled"}\n\nContent:\n"""\n${content.slice(0, 12000)}\n"""\n\nReturn only the JSON object.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("LLM error:", errText);
      return NextResponse.json(
        { error: "LLM request failed", detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let result: VerdictResult;

    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse structured response from model" },
        { status: 500 }
      );
    }

    if (typeof result.composite !== "number") {
      result.composite =
        Math.round((result.content.score * 0.6 + result.motivation.score * 0.4) * 10) / 10;
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}

function generateFallback(content: string, title?: string): VerdictResult {
  const lower = content.toLowerCase();
  const hasStrongClaims = /must|always|never|proven|fact is|clearly|obviously/.test(lower);
  const hasEmotional = /outrage|disgrace|amazing|terrible|shocking|crisis/.test(lower);
  const hasData = /\d+%|\d+\.\d+|study|research|evidence|data shows/.test(lower);
  const length = content.length;

  let contentScore = 5;
  if (hasData && !hasEmotional) contentScore = 3;
  if (hasStrongClaims && hasEmotional) contentScore = 7;
  if (length < 200) contentScore = Math.min(contentScore + 1, 8);

  let motivationScore = 5;
  if (hasEmotional) motivationScore = 7;
  if (hasData && !hasEmotional) motivationScore = 3;

  const mismatchType =
    contentScore >= 6 && motivationScore <= 4
      ? "high-content-low-motivation"
      : contentScore <= 4 && motivationScore >= 6
      ? "low-content-high-motivation"
      : contentScore >= 7 && motivationScore >= 7
      ? "both-low"
      : contentScore <= 3 && motivationScore <= 3
      ? "both-high"
      : "aligned";

  return {
    exactQuestion: title || "What is the main claim being advanced?",
    materialType: "mixed",
    context: "adversarial",
    content: {
      score: contentScore,
      label: contentScore <= 2 ? "Clean Rhetoric" : contentScore <= 4 ? "Honest Rhetoric" : contentScore <= 6 ? "Selective Rhetoric" : "Spin",
      notes: "Heuristic analysis only (no LLM key configured). Add XAI_API_KEY or OPENAI_API_KEY in Vercel environment variables for full agentic analysis.",
      fallacies: hasEmotional ? ["Emotional loading"] : [],
    },
    motivation: {
      score: motivationScore,
      label: motivationScore <= 2 ? "Clean / Transparent" : motivationScore <= 4 ? "Principled Mixed" : "Strategic",
      notes: "Heuristic estimate of intent and source posture.",
      competence: 5,
      trustworthiness: motivationScore <= 4 ? 6 : 4,
      goodwill: motivationScore <= 4 ? 6 : 3,
    },
    mismatch: {
      type: mismatchType as any,
      description: "Fallback mismatch detection based on surface features.",
      riskLevel: mismatchType === "high-content-low-motivation" ? "high" : "moderate",
    },
    composite: Math.round((contentScore * 0.6 + motivationScore * 0.4) * 10) / 10,
    recommendation: "Configure an LLM API key for rigorous multi-agent analysis. Current result is illustrative only.",
    descriptiveNotes: [
      "This is a deterministic fallback. Full Verdict+ engine requires XAI_API_KEY or OPENAI_API_KEY.",
      "Content length: " + length + " characters.",
    ],
  };
}
