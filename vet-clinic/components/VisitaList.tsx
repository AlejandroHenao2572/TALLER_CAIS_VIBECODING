import type { Visita } from "@/lib/types";

function formatoFecha(fecha: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

export default function VisitaList({ visitas }: { visitas: Visita[] }) {
  if (!visitas.length) {
    return <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">Sin visitas registradas</p>;
  }
  return (
    <ul className="space-y-3">
      {visitas.map((v) => (
        <li key={v.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold">{v.motivo}</h3>
            <time className="text-sm text-slate-500">{formatoFecha(v.fecha)}</time>
          </div>
          <dl className="mt-2 space-y-1 text-sm">
            <div><dt className="inline font-medium">Diagnóstico: </dt><dd className="inline">{v.diagnostico}</dd></div>
            <div><dt className="inline font-medium">Tratamiento: </dt><dd className="inline">{v.tratamiento}</dd></div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
