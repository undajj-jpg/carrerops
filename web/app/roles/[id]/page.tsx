"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { RoleConfig } from "@/lib/types";

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [team, setTeam] = useState("");
  const [seniority, setSeniority] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [compBand, setCompBand] = useState("");
  const [mustHave, setMustHave] = useState("");
  const [niceToHave, setNiceToHave] = useState("");
  const [jdText, setJdText] = useState("");
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/roles/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data: RoleConfig | null) => {
        if (!data) return;
        setTitle(data.title);
        setDepartment(data.department);
        setTeam(data.team);
        setSeniority(data.seniority);
        setLocation(data.location);
        setLocationType(data.locationType);
        setCompBand(data.compBand);
        setMustHave(data.mustHave?.join("\n") || "");
        setNiceToHave(data.niceToHave?.join("\n") || "");
        setJdText(data.jdText);
      });
  }, [id]);

  async function handleSave() {
    await fetch(`/api/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, department, team, seniority, location, locationType, compBand,
        mustHave: mustHave.split("\n").filter(Boolean),
        niceToHave: niceToHave.split("\n").filter(Boolean),
        jdText,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (notFound) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-gray-500">
        Role not found. <a href="/roles" className="text-cyan-400 hover:underline">Back to positions</a>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:border-cyan-600 focus:outline-none";
  const labelClass = "block text-sm text-gray-400 mb-1";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Position</h1>
        <div className="flex gap-2">
          <a href={`/candidates?roleId=${id}`} className="text-sm px-3 py-1.5 rounded bg-gray-800 text-cyan-400 hover:bg-gray-700">
            View Candidates
          </a>
          <a href={`/upload?roleId=${id}`} className="text-sm px-3 py-1.5 rounded bg-gray-800 text-green-400 hover:bg-gray-700">
            Upload CVs
          </a>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Job Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Senior Backend Engineer" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} placeholder="Engineering" />
          </div>
          <div>
            <label className={labelClass}>Team</label>
            <input value={team} onChange={(e) => setTeam(e.target.value)} className={inputClass} placeholder="Platform" />
          </div>
          <div>
            <label className={labelClass}>Seniority</label>
            <select value={seniority} onChange={(e) => setSeniority(e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {["Junior", "Mid", "Senior", "Staff", "Principal", "Lead", "Manager", "Director"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="New York, NY" />
          </div>
          <div>
            <label className={labelClass}>Location Type</label>
            <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className={inputClass}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Compensation Band</label>
            <input value={compBand} onChange={(e) => setCompBand(e.target.value)} className={inputClass} placeholder="$150K-$200K" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Must-Have Requirements (one per line)</label>
          <textarea value={mustHave} onChange={(e) => setMustHave(e.target.value)} rows={5} className={inputClass}
            placeholder="3+ years backend development&#10;Experience with distributed systems" />
        </div>
        <div>
          <label className={labelClass}>Nice-to-Have (one per line)</label>
          <textarea value={niceToHave} onChange={(e) => setNiceToHave(e.target.value)} rows={3} className={inputClass}
            placeholder="Kubernetes/Docker&#10;GraphQL" />
        </div>
        <div>
          <label className={labelClass}>Full Job Description</label>
          <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={10} className={inputClass + " font-mono"}
            placeholder="Paste the full job description here..." />
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500">
          Save Changes
        </button>
        {saved && <span className="text-green-400 text-sm ml-3">Saved</span>}
      </div>
    </div>
  );
}
