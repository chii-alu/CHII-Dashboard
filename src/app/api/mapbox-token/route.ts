import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  console.log("[API] Mapbox token request - token exists:", !!token);

  if (!token) {
    console.error("[API] NEXT_PUBLIC_MAPBOX_TOKEN environment variable is not set");
    return NextResponse.json(
      { error: "Mapbox token not configured", details: "NEXT_PUBLIC_MAPBOX_TOKENenv var missing" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token });
}
