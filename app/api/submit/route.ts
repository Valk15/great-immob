import { NextRequest, NextResponse } from "next/server";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwV6xAtGW-GZ4Yl5kHDne8-uVXcaPgDqDBE5Xz4IkvyilpPQZajxjS-OLyyfixd50wnmg/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}