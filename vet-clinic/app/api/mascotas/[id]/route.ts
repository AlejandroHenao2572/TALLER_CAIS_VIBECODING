import { NextResponse } from "next/server";
import { getMascota, visitasDe } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mascota = await getMascota(id);
  if (!mascota) return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });
  return NextResponse.json({ ...mascota, visitas: await visitasDe(id) });
}
