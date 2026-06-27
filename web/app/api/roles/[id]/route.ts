import { NextResponse } from "next/server";
import { getRole, updateRole } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const role = getRole(id);
  if (!role) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(role);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateRole(id, {
    title: body.title || "",
    department: body.department || "",
    team: body.team || "",
    seniority: body.seniority || "",
    location: body.location || "",
    locationType: body.locationType || "remote",
    mustHave: body.mustHave || [],
    niceToHave: body.niceToHave || [],
    compBand: body.compBand || "",
    jdText: body.jdText || "",
  });
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
