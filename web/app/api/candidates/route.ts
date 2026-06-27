import { NextResponse } from "next/server";
import { getCandidates, addCandidate, updateCandidate, deleteCandidate } from "@/lib/store";
import type { Candidate } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getCandidates());
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = crypto.randomUUID();
  const candidate: Candidate = {
    id,
    name: body.name || "Unknown",
    currentRole: body.currentRole || "",
    score: null,
    recommendation: "Pending",
    mustHavesMet: 0,
    mustHavesTotal: 0,
    topStrengths: [],
    keyConcerns: [],
    interviewPriority: "Pending",
    cvText: body.cvText || "",
    reportPath: null,
    evaluatedAt: null,
    status: "New",
  };
  addCandidate(candidate);
  return NextResponse.json(candidate, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const updated = updateCandidate(body.id, body);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const deleted = deleteCandidate(id);
  return NextResponse.json({ deleted });
}
