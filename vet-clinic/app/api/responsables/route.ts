import { NextResponse } from "next/server";
import { listarResponsables } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listarResponsables());
}
