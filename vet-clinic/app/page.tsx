import Link from "next/link";
import MascotaCard from "@/components/MascotaCard";
import { listarMascotas } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const mascotas = await listarMascotas(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mascotas</h1>
        <Link href="/mascotas/nueva" className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          + Registrar mascota
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre de mascota o dueño..."
          className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 focus:border-teal-600 focus:outline-none"
        />
        <button className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800">Buscar</button>
        {q && <Link href="/" className="self-center text-sm text-slate-600 hover:underline">Limpiar</Link>}
      </form>

      {mascotas.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {mascotas.map((m) => <MascotaCard key={m.id} mascota={m} />)}
        </div>
      ) : (
        <p className="text-center text-slate-500">No se encontraron mascotas.</p>
      )}
    </div>
  );
}
