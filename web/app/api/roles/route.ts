import { NextResponse } from "next/server";
import { getRoles, addRole, deleteRole } from "@/lib/store";
import type { RoleConfig } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getRoles());
}

export async function POST(request: Request) {
  const body = await request.json();
  const role: RoleConfig = {
    id: crypto.randomUUID(),
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
    createdAt: new Date().toISOString(),
  };
  addRole(role);
  return NextResponse.json(role, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const deleted = deleteRole(id);
  return NextResponse.json({ deleted });
}
