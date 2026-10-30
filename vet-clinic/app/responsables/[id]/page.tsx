import Link from "next/link";
import { notFound } from "next/navigation";
import MascotaCard from "@/components/MascotaCard";
import { getResponsable } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DetalleResponsable({ params }: { params: Promise<{ id: string }> }) {
  const responsable = await getResponsable((await params).id);
  if (!responsable) notFound();
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-teal-700 hover:underline">← Volver a las mascotas</Link>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Responsable</p>
        <h1 className="text-2xl font-bold text-teal-800">{responsable.nombre}</h1>
        <p className="mt-2">Teléfono: {responsable.telefono}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Mascotas ({responsable.mascotas.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2">{responsable.mascotas.map((m) => <MascotaCard key={m.id} mascota={m} />)}</div>
        {!responsable.mascotas.length && <p className="text-slate-500">Sin mascotas asociadas.</p>}
      </section>
    </div>
  );
}
