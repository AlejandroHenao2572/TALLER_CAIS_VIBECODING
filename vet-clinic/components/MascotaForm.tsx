"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const input = "w-full rounded border border-slate-300 px-3 py-2 focus:border-teal-600 focus:outline-none";

export default function MascotaForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const res = await fetch("/api/mascotas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) return setError(data.error ?? "No se pudo guardar");
    router.push(`/mascotas/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input name="nombre" required className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Especie</span>
          <input name="especie" required placeholder="Perro, Gato..." className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Raza</span>
          <input name="raza" required className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Edad (años)</span>
          <input name="edad" type="number" min={0} required className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Nombre del dueño</span>
          <input name="dueno" required className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Teléfono del dueño</span>
          <input name="telefono" type="tel" required className={input} />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={enviando}
        className="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Registrar mascota"}
      </button>
    </form>
  );
}
