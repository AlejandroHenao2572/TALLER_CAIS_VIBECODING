import { NextRequest, NextResponse } from "next/server";
import { crearMascota, listarMascotas, ValidacionError } from "@/lib/db";

export async function GET(req: NextRequest) {
  return NextResponse.json(await listarMascotas(req.nextUrl.searchParams.get("q") ?? ""));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  try {
    return NextResponse.json(await crearMascota(body), { status: 201 });
  } catch (error) {
    if (error instanceof ValidacionError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
