import { NextResponse } from "next/server";
import { getRole, setRole } from "@/lib/store";

export async function GET() {
  const role = getRole();
  if (!role) return NextResponse.json({ configured: false });
  return NextResponse.json({ configured: true, role });
}

export async function POST(request: Request) {
  const body = await request.json();
  setRole({
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
  return NextResponse.json({ saved: true });
}
