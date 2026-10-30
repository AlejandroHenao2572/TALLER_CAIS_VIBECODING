import Link from "next/link";
import { notFound } from "next/navigation";
import VisitaList from "@/components/VisitaList";
import { getMascota, visitasDe } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DetalleMascota({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mascota = await getMascota(id);
  if (!mascota) notFound();
  const visitas = await visitasDe(id);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-teal-700 hover:underline">← Volver a la lista</Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-teal-800">{mascota.nombre}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Especie</dt><dd className="font-medium">{mascota.especie}</dd></div>
          <div><dt className="text-slate-500">Raza</dt><dd className="font-medium">{mascota.raza}</dd></div>
          <div><dt className="text-slate-500">Edad</dt><dd className="font-medium">{mascota.edad} {mascota.edad === 1 ? "año" : "años"}</dd></div>
        </dl>
        <h2 className="mt-5 font-semibold">Responsables ({mascota.responsables.length})</h2>
        <ul className="mt-2 space-y-2">
          {mascota.responsables.map((r) => <li key={r.id}>
            <Link href={`/responsables/${r.id}`} className="font-medium text-teal-700 hover:underline">{r.nombre}</Link>
            <span className="text-sm text-slate-600"> · {r.telefono}</span>
          </li>)}
        </ul>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Historial de visitas ({visitas.length})</h2>
          <Link
            href={`/mascotas/${id}/visitas/nueva`}
            className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            + Registrar visita
          </Link>
        </div>
        <VisitaList visitas={visitas} />
      </section>
    </div>
  );
}
