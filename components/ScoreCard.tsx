"use client";

import { clsx } from "clsx";

interface ScoreCardProps {
  title: string;
  score: number;
  label: string;
  notes: string;
  color?: "blue" | "amber" | "emerald" | "rose";
  children?: React.ReactNode;
}

const colorMap = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
};

const barMap = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

export function ScoreCard({
  title,
  score,
  label,
  notes,
  color = "blue",
  children,
}: ScoreCardProps) {
  const pct = Math.min(100, Math.max(0, score * 10));

  return (
    <div
      className={clsx(
        "rounded-xl border bg-gradient-to-br p-5",
        colorMap[color]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {score.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-400">/ 10</span>
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-200">{label}</p>
        </div>
        <div className="w-24 pt-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx("score-bar h-full rounded-full", barMap[color])}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{notes}</p>

      {children && <div className="mt-4 border-t border-white/10 pt-4">{children}</div>}
    </div>
  );
}
