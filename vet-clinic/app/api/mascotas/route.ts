import { NextRequest, NextResponse } from "next/server";
import { crearMascota, faltantes, listarMascotas } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json(await listarMascotas(q));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const error = faltantes(body, ["nombre", "especie", "raza", "dueno", "telefono"]);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const edad = Number(body.edad);
  if (body.edad === "" || body.edad == null || !Number.isFinite(edad) || edad < 0) {
    return NextResponse.json({ error: "La edad debe ser un número mayor o igual a 0" }, { status: 400 });
  }

  const mascota = await crearMascota({
    nombre: body.nombre.trim(),
    especie: body.especie.trim(),
    raza: body.raza.trim(),
    edad,
    dueno: body.dueno.trim(),
    telefono: body.telefono.trim(),
  });
  return NextResponse.json(mascota, { status: 201 });
}
