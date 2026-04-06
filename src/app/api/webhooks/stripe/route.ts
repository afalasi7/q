import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhook scaffolded for Phase 3 billing work." },
    { status: 501 },
  );
}
