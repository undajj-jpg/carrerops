"use client";

import { useEffect, useState } from "react";
import type { RoleConfig } from "@/lib/types";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleConfig[]>([]);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then(setRoles);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this role and all its candidates?")) return;
    await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        <a
          href="/roles/new"
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-sm"
        >
          + New Position
        </a>
      </div>

      {roles.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center text-gray-500">
          No positions yet. Create one to start evaluating candidates.
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-gray-900 rounded-lg border border-gray-800 p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <a href={`/roles/${role.id}`} className="text-lg font-semibold hover:text-cyan-400 transition-colors">
                    {role.title || "Untitled Role"}
                  </a>
                  <div className="text-sm text-gray-400 mt-1 flex gap-3">
                    {role.department && <span>{role.department}</span>}
                    {role.team && <span>· {role.team}</span>}
                    {role.seniority && <span>· {role.seniority}</span>}
                    {role.locationType && (
                      <span>· {role.locationType === "remote" ? "Remote" : role.locationType === "hybrid" ? "Hybrid" : "On-site"}</span>
                    )}
                    {role.location && <span>· {role.location}</span>}
                  </div>
                  {role.compBand && (
                    <div className="text-sm text-green-400/70 mt-1">{role.compBand}</div>
                  )}
                  {role.mustHave.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {role.mustHave.slice(0, 4).map((req, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {req}
                        </span>
                      ))}
                      {role.mustHave.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500">
                          +{role.mustHave.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/candidates?roleId=${role.id}`}
                    className="text-xs px-3 py-1.5 rounded bg-gray-800 text-cyan-400 hover:bg-gray-700"
                  >
                    Candidates
                  </a>
                  <a
                    href={`/upload?roleId=${role.id}`}
                    className="text-xs px-3 py-1.5 rounded bg-gray-800 text-green-400 hover:bg-gray-700"
                  >
                    Upload CVs
                  </a>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-xs px-3 py-1.5 rounded bg-gray-800 text-red-400 hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
