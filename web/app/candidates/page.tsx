"use client";

import { useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500">Pending</span>;
  const color =
    score >= 4.5
      ? "bg-green-900 text-green-300"
      : score >= 4.0
        ? "bg-emerald-900 text-emerald-300"
        : score >= 3.5
          ? "bg-yellow-900 text-yellow-300"
          : "bg-red-900 text-red-300";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono ${color}`}>
      {score.toFixed(1)}/5
    </span>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then(setCandidates);
  }, []);

  const filtered = candidates.filter((c) => {
    if (filter === "all") return true;
    if (filter === "strong-yes") return (c.score ?? 0) >= 4.5;
    if (filter === "yes") return (c.score ?? 0) >= 4.0 && (c.score ?? 0) < 4.5;
    if (filter === "maybe") return (c.score ?? 0) >= 3.5 && (c.score ?? 0) < 4.0;
    if (filter === "no") return c.score !== null && (c.score ?? 0) < 3.5;
    if (filter === "pending") return c.score === null;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <div className="flex gap-2 text-sm">
          {["all", "strong-yes", "yes", "maybe", "no", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded ${filter === f ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              {f.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center text-gray-500">
              {candidates.length === 0
                ? "No candidates yet. Upload CVs to get started."
                : "No candidates match this filter."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left bg-gray-900 rounded-lg border p-4 hover:border-cyan-800 transition-colors ${
                    selected?.id === c.id ? "border-cyan-600" : "border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 text-sm mr-2">#{i + 1}</span>
                      <span className="font-medium">{c.name}</span>
                      {c.currentRole && (
                        <span className="text-gray-500 text-sm ml-2">{c.currentRole}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={c.score} />
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {c.status}
                      </span>
                    </div>
                  </div>
                  {c.topStrengths.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {c.topStrengths.slice(0, 3).map((s, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-green-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="w-96 bg-gray-900 rounded-lg border border-gray-800 p-4 sticky top-4 h-fit">
            <h2 className="text-lg font-semibold mb-3">{selected.name}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Current Role:</span>{" "}
                <span>{selected.currentRole || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Score:</span>{" "}
                <ScoreBadge score={selected.score} />
              </div>
              <div>
                <span className="text-gray-500">Recommendation:</span>{" "}
                <span>{selected.recommendation}</span>
              </div>
              <div>
                <span className="text-gray-500">Must-Haves:</span>{" "}
                <span>{selected.mustHavesMet}/{selected.mustHavesTotal}</span>
              </div>
              <div>
                <span className="text-gray-500">Interview Priority:</span>{" "}
                <span>{selected.interviewPriority}</span>
              </div>
              {selected.topStrengths.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1">Strengths:</span>
                  <ul className="list-disc list-inside text-green-400/80">
                    {selected.topStrengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {selected.keyConcerns.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1">Concerns:</span>
                  <ul className="list-disc list-inside text-red-400/80">
                    {selected.keyConcerns.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {selected.cvText && (
                <details className="mt-2">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-300">
                    View CV text
                  </summary>
                  <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap max-h-64 overflow-y-auto bg-gray-800 rounded p-2">
                    {selected.cvText.slice(0, 2000)}
                    {selected.cvText.length > 2000 && "\n\n... (truncated)"}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
