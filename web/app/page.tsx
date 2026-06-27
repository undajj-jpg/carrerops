import Link from "next/link";
import { getCandidates, getStats, getRole } from "@/lib/store";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500">—</span>;
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

function RecBadge({ rec }: { rec: string }) {
  const color =
    rec === "Strong Yes"
      ? "text-green-400"
      : rec === "Yes"
        ? "text-emerald-400"
        : rec === "Maybe"
          ? "text-yellow-400"
          : "text-red-400";
  return <span className={`text-xs font-medium ${color}`}>{rec}</span>;
}

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const stats = getStats();
  const candidates = getCandidates().slice(0, 10);
  const role = getRole();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        {role ? (
          <p className="text-gray-400 mt-1">
            Hiring: <span className="text-white">{role.title}</span> —{" "}
            {role.department}
          </p>
        ) : (
          <p className="text-gray-500 mt-1">
            No role configured.{" "}
            <Link href="/role" className="text-cyan-400 hover:underline">
              Set up your open role
            </Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: stats.total, color: "text-white" },
          { label: "Evaluated", value: stats.evaluated, color: "text-cyan-400" },
          { label: "Strong Yes", value: stats.strongYes, color: "text-green-400" },
          { label: "Avg Score", value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—", color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Strong Yes", count: stats.strongYes, color: "bg-green-500" },
          { label: "Yes", count: stats.yes, color: "bg-emerald-500" },
          { label: "Maybe", count: stats.maybe, color: "bg-yellow-500" },
          { label: "No", count: stats.no, color: "bg-red-500" },
        ].map((b) => (
          <div key={b.label} className="text-center">
            <div className={`h-2 rounded ${b.color}`} style={{ opacity: b.count > 0 ? 1 : 0.2 }} />
            <div className="text-xs text-gray-500 mt-1">{b.label}: {b.count}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Top Candidates</h2>
          <Link href="/candidates" className="text-sm text-cyan-400 hover:underline">
            View all
          </Link>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
            <p className="text-gray-400">No candidates yet.</p>
            <Link href="/upload" className="text-cyan-400 hover:underline text-sm mt-2 block">
              Upload CVs to get started
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                  <th className="text-left px-4 py-2">#</th>
                  <th className="text-left px-4 py-2">Candidate</th>
                  <th className="text-left px-4 py-2">Current Role</th>
                  <th className="text-left px-4 py-2">Score</th>
                  <th className="text-left px-4 py-2">Rec</th>
                  <th className="text-left px-4 py-2">Must-Haves</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{c.name}</td>
                    <td className="px-4 py-2 text-gray-400">{c.currentRole}</td>
                    <td className="px-4 py-2"><ScoreBadge score={c.score} /></td>
                    <td className="px-4 py-2"><RecBadge rec={c.recommendation} /></td>
                    <td className="px-4 py-2 text-gray-400">{c.mustHavesMet}/{c.mustHavesTotal}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/upload" className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-cyan-800 transition-colors group">
          <div className="text-cyan-400 text-lg mb-1 group-hover:text-cyan-300">Upload CVs</div>
          <p className="text-gray-500 text-sm">Upload PDF resumes for evaluation</p>
        </Link>
        <Link href="/role" className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-purple-800 transition-colors group">
          <div className="text-purple-400 text-lg mb-1 group-hover:text-purple-300">Configure Role</div>
          <p className="text-gray-500 text-sm">Set JD, requirements, and scoring weights</p>
        </Link>
        <Link href="/candidates" className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-green-800 transition-colors group">
          <div className="text-green-400 text-lg mb-1 group-hover:text-green-300">All Candidates</div>
          <p className="text-gray-500 text-sm">View rankings, reports, and comparisons</p>
        </Link>
      </div>
    </div>
  );
}
