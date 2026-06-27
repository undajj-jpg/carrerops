import { NextResponse } from "next/server";
import { addCandidate } from "@/lib/store";
import type { Candidate } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const roleId = (formData.get("roleId") as string) || "";

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const results: { name: string; id: string; status: string }[] = [];

  for (const file of files) {
    const text = await file.text();
    const nameFromFile = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");

    const id = crypto.randomUUID();
    const candidate: Candidate = {
      id,
      roleId,
      name: nameFromFile,
      currentRole: "",
      score: null,
      recommendation: "Pending",
      mustHavesMet: 0,
      mustHavesTotal: 0,
      topStrengths: [],
      keyConcerns: [],
      interviewPriority: "Pending",
      cvText: text,
      reportPath: null,
      evaluatedAt: null,
      status: "New",
    };

    addCandidate(candidate);
    results.push({ name: nameFromFile, id, status: "ingested" });
  }

  return NextResponse.json({
    ingested: results.length,
    candidates: results,
  });
}
