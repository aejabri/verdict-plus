"use client";

import { useState, useRef } from "react";
import { ScoreCard } from "@/components/ScoreCard";
import type { VerdictResult } from "@/lib/verdict-plus";
import {
  Upload,
  FileText,
  Loader2,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function Home() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  }

  const riskColor =
    result?.mismatch.riskLevel === "critical"
      ? "rose"
      : result?.mismatch.riskLevel === "high"
      ? "amber"
      : result?.mismatch.riskLevel === "moderate"
      ? "blue"
      : "emerald";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
          <Scale className="h-3.5 w-3.5" />
          Verdict+ Multi-Scale Orchestration
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Critical Thinking Engine
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Upload or paste any content. The agentic system runs dual scales
          (Content Integrity + Source Motivation) grounded in Waller and
          validated credibility research, then returns parametric results with
          descriptive notes.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Op-ed on energy policy, product claim, political statement…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Content to analyze
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json,.html"
              onChange={handleFile}
              className="hidden"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Paste any argument, advertisement, testimony, article excerpt, political claim, product description, or social-media post…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {content.length.toLocaleString()} characters
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || content.trim().length < 20}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running multi-agent analysis…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Analyze with Verdict+
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Orchestrator Summary
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Exact Question</p>
                <p className="mt-0.5 text-sm text-slate-200">{result.exactQuestion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Material Type</p>
                <p className="mt-0.5 text-sm capitalize text-slate-200">
                  {result.materialType}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Context</p>
                <p className="mt-0.5 text-sm capitalize text-slate-200">
                  {result.context}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ScoreCard
              title="Content Integrity"
              score={result.content.score}
              label={result.content.label}
              notes={result.content.notes}
              color="blue"
            >
              {result.content.fallacies?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-400">
                    Detected issues
                  </p>
                  <ul className="space-y-1">
                    {result.content.fallacies.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-amber-300"
                      >
                        <span className="h-1 w-1 rounded-full bg-amber-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ScoreCard>

            <ScoreCard
              title="Source Motivation & Credibility"
              score={result.motivation.score}
              label={result.motivation.label}
              notes={result.motivation.notes}
              color="amber"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500">Competence</p>
                  <p className="text-sm font-medium text-slate-200">
                    {result.motivation.competence}/10
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Trustworthiness</p>
                  <p className="text-sm font-medium text-slate-200">
                    {result.motivation.trustworthiness}/10
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Goodwill</p>
                  <p className="text-sm font-medium text-slate-200">
                    {result.motivation.goodwill}/10
                  </p>
                </div>
              </div>
            </ScoreCard>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div
              className={`rounded-xl border p-5 ${
                riskColor === "rose"
                  ? "border-rose-500/30 bg-rose-500/10"
                  : riskColor === "amber"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : riskColor === "emerald"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-blue-500/30 bg-blue-500/10"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {result.mismatch.riskLevel === "low" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                <h3 className="text-sm font-semibold text-white">
                  Mismatch Analysis
                </h3>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {result.mismatch.type.replace(/-/g, " ")} · Risk:{" "}
                {result.mismatch.riskLevel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {result.mismatch.description}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-white">
                Composite Score
              </h3>
              <p className="mt-1 text-3xl font-bold text-white">
                {result.composite.toFixed(1)}
                <span className="ml-1 text-base font-normal text-slate-400">
                  / 10
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Weighted 60% Content + 40% Motivation (secondary only — always
                inspect the dual scores first)
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Recommendation</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              {result.recommendation}
            </p>
          </div>

          {result.descriptiveNotes?.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-300">
                Descriptive Notes
              </h3>
              <ul className="space-y-2">
                {result.descriptiveNotes.map((note, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-slate-400"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <footer className="mt-16 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
        Verdict+ · Dual-scale critical thinking · Grounded in Waller (2012) +
        McCroskey & Teven source credibility · Built for rigorous evaluation
      </footer>
    </div>
  );
}
