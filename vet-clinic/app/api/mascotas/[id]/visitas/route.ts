import { NextResponse } from "next/server";
import { crearVisita, faltantes, getMascota, visitasDe } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await getMascota(id))) {
    return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });
  }
  return NextResponse.json(await visitasDe(id));
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await getMascota(id))) {
    return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const error = faltantes(body, ["fecha", "motivo", "diagnostico", "tratamiento"]);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.fecha)) {
    return NextResponse.json({ error: "Fecha inválida (formato AAAA-MM-DD)" }, { status: 400 });
  }

  const visita = await crearVisita({
    mascotaId: id,
    fecha: body.fecha,
    motivo: body.motivo.trim(),
    diagnostico: body.diagnostico.trim(),
    tratamiento: body.tratamiento.trim(),
  });
  return NextResponse.json(visita, { status: 201 });
}
