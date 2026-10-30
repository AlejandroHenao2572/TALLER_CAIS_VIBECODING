"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const input = "w-full rounded border border-slate-300 px-3 py-2 focus:border-teal-600 focus:outline-none";

export default function VisitaForm({ mascotaId }: { mascotaId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const hoy = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD en hora local

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const res = await fetch(`/api/mascotas/${mascotaId}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) return setError(data.error ?? "No se pudo guardar");
    router.push(`/mascotas/${mascotaId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <label className="block">
        <span className="text-sm font-medium">Fecha</span>
        <input name="fecha" type="date" defaultValue={hoy} required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Motivo</span>
        <input name="motivo" required className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Diagnóstico</span>
        <textarea name="diagnostico" required rows={3} className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Tratamiento</span>
        <textarea name="tratamiento" required rows={3} className={input} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={enviando}
        className="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Registrar visita"}
      </button>
    </form>
  );
}
