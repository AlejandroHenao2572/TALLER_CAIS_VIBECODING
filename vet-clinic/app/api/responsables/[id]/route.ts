import { NextResponse } from "next/server";
import { getResponsable } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const responsable = await getResponsable((await params).id);
  return responsable ? NextResponse.json(responsable) : NextResponse.json({ error: "Responsable no encontrado" }, { status: 404 });
}
