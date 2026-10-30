import Link from "next/link";
import type { MascotaDetalle } from "@/lib/types";

export default function MascotaCard({ mascota }: { mascota: MascotaDetalle }) {
  return (
    <Link
      href={`/mascotas/${mascota.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-500 hover:shadow"
    >
      <h2 className="text-lg font-semibold text-teal-800">{mascota.nombre}</h2>
      <p className="text-sm text-slate-600">
        {mascota.especie} · {mascota.raza} · {mascota.edad} {mascota.edad === 1 ? "año" : "años"}
      </p>
      <p className="mt-2 text-sm">
        Responsables: <span className="font-medium">{mascota.responsables.map((r) => `${r.nombre} · ${r.telefono}`).join("; ")}</span>
      </p>
    </Link>
  );
}
