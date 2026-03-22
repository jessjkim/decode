import { NextResponse } from "next/server";
import { lookupCptCode, loadPfsPayload } from "../../../lib/pfsData";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json(
      { error: "Missing CPT code." },
      { status: 400 }
    );
  }

  const record = lookupCptCode(code);
  if (!record) {
    return NextResponse.json(
      { error: "CPT code not found." },
      { status: 404 }
    );
  }

  const payload = loadPfsPayload();
  return NextResponse.json({ source: payload.source, record });
}
