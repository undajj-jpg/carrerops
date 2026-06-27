"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { RoleConfig } from "@/lib/types";

export default function UploadPage() {
  return (
    <Suspense>
      <UploadContent />
    </Suspense>
  );
}

function UploadContent() {
  const searchParams = useSearchParams();
  const initialRoleId = searchParams.get("roleId") || "";
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ingested: number; candidates: { name: string; id: string }[] } | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedCV, setPastedCV] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [roleId, setRoleId] = useState(initialRoleId);

  useEffect(() => {
    fetch("/api/roles").then((r) => r.json()).then(setRoles);
  }, []);

  async function handleUpload() {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    if (roleId) formData.append("roleId", roleId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setResult(data);
    setUploading(false);
  }

  async function handlePaste() {
    if (!pastedCV.trim()) return;
    setUploading(true);
    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: candidateName || "Pasted CV", cvText: pastedCV, roleId }),
    });
    const data = await res.json();
    setResult({ ingested: 1, candidates: [{ name: data.name, id: data.id }] });
    setUploading(false);
    setPastedCV("");
    setCandidateName("");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload Candidates</h1>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setPasteMode(false)}
            className={`px-4 py-2 rounded text-sm ${!pasteMode ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setPasteMode(true)}
            className={`px-4 py-2 rounded text-sm ${pasteMode ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Paste CV
          </button>
        </div>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 focus:border-cyan-600 focus:outline-none"
        >
          <option value="">No position selected</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.title || "Untitled"}</option>
          ))}
        </select>
      </div>

      {!roleId && roles.length > 0 && (
        <div className="text-yellow-400/70 text-sm bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2">
          Select a position above to associate candidates with a role.
        </div>
      )}

      {!pasteMode ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <label className="block">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-cyan-800 transition-colors cursor-pointer">
              <p className="text-gray-400 mb-2">Drop CV files here or click to select</p>
              <p className="text-gray-600 text-sm">Supports PDF, TXT, MD files</p>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
          </label>
          {files && files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">{files.length} file(s) selected</p>
              <ul className="text-sm text-gray-500 mt-1">
                {Array.from(files).map((f, i) => (
                  <li key={i}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!files || files.length === 0 || uploading}
            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload & Ingest"}
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <input
            type="text"
            placeholder="Candidate name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:border-cyan-600 focus:outline-none"
          />
          <textarea
            placeholder="Paste CV text here..."
            value={pastedCV}
            onChange={(e) => setPastedCV(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm font-mono focus:border-cyan-600 focus:outline-none"
          />
          <button
            onClick={handlePaste}
            disabled={!pastedCV.trim() || uploading}
            className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Adding..." : "Add Candidate"}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
          <p className="text-green-400 font-medium">{result.ingested} candidate(s) ingested</p>
          <ul className="text-sm text-green-300/70 mt-2">
            {result.candidates.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
          <a href={roleId ? `/candidates?roleId=${roleId}` : "/candidates"} className="text-cyan-400 text-sm hover:underline mt-2 block">
            View candidates
          </a>
        </div>
      )}
    </div>
  );
}
