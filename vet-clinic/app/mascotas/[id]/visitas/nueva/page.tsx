import Link from "next/link";
import { notFound } from "next/navigation";
import VisitaForm from "@/components/VisitaForm";
import { getMascota } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NuevaVisita({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mascota = await getMascota(id);
  if (!mascota) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/mascotas/${id}`} className="text-sm text-teal-700 hover:underline">← Volver a {mascota.nombre}</Link>
      <h1 className="text-2xl font-bold">Registrar visita de {mascota.nombre}</h1>
      <VisitaForm mascotaId={id} />
    </div>
  );
}
