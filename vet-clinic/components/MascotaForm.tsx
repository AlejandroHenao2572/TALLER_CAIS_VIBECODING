"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Responsable } from "@/lib/types";

const input = "w-full rounded border border-slate-300 px-3 py-2 focus:border-teal-600 focus:outline-none";
type Fila = { key: number; id: string; nombre: string; telefono: string };

export default function MascotaForm({ responsables }: { responsables: Responsable[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [filas, setFilas] = useState<Fila[]>([{ key: 0, id: "", nombre: "", telefono: "" }]);
  const [nextKey, setNextKey] = useState(1);
  function editar(key: number, cambios: Partial<Fila>) {
    setFilas((actuales) => actuales.map((f) => f.key === key ? { ...f, ...cambios } : f));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const campos = Object.fromEntries(new FormData(e.currentTarget));
    if (["nombre", "especie", "raza"].some((c) => !String(campos[c] ?? "").trim())) {
      return setError("Completa nombre, especie y raza");
    }
    if (!String(campos.edad ?? "").trim() || !Number.isFinite(Number(campos.edad)) || Number(campos.edad) < 0) {
      return setError("La edad debe ser un número mayor o igual a 0");
    }
    if (!filas.length || filas.some((f) => f.id ? !responsables.some((r) => r.id === f.id) : !f.nombre.trim() || !f.telefono.trim())) {
      return setError("Selecciona o completa los datos de cada responsable");
    }
    const claves = filas.map((f) => {
      const r = f.id ? responsables.find((r) => r.id === f.id)! : f;
      return `${r.nombre.trim().replace(/\s+/g, " ").toLowerCase()}|${r.telefono.replace(/[\s()+.-]/g, "")}`;
    });
    if (new Set(claves).size !== claves.length) return setError("No repitas el mismo responsable");
    setEnviando(true);
    try {
      const res = await fetch("/api/mascotas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campos, responsables: filas.map((f) => f.id ? { id: f.id } : { nombre: f.nombre.trim(), telefono: f.telefono.trim() }) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo guardar"); return; }
      router.push(`/mascotas/${data.id}`);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <fieldset disabled={enviando} className="space-y-4">
        <legend className="mb-3 font-semibold">Datos de la mascota</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium">Nombre</span><input name="nombre" required className={input} /></label>
          <label className="block"><span className="text-sm font-medium">Especie</span><input name="especie" required placeholder="Perro, Gato..." className={input} /></label>
          <label className="block"><span className="text-sm font-medium">Raza</span><input name="raza" required className={input} /></label>
          <label className="block"><span className="text-sm font-medium">Edad (años)</span><input name="edad" type="number" min={0} step="any" required className={input} /></label>
        </div>
        <h2 className="font-semibold">Responsables</h2>
        <p className="text-sm text-slate-600">Agrega al menos uno. Puedes seleccionar personas existentes o registrar nuevas.</p>
        {filas.map((fila, index) => (
          <fieldset key={fila.key} className="space-y-3 rounded border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium">Responsable {index + 1}</legend>
            <label className="block">
              <span className="text-sm font-medium">Seleccionar responsable</span>
              <select value={fila.id} onChange={(e) => editar(fila.key, { id: e.target.value })} className={input}>
                <option value="">Crear responsable nuevo</option>
                {responsables.map((r) => <option key={r.id} value={r.id} disabled={filas.some((f) => f.key !== fila.key && f.id === r.id)}>{r.nombre} · {r.telefono}</option>)}
              </select>
            </label>
            {!fila.id && <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">Nombre del responsable</span><input required value={fila.nombre} onChange={(e) => editar(fila.key, { nombre: e.target.value })} className={input} /></label>
              <label className="block"><span className="text-sm font-medium">Teléfono del responsable</span><input type="tel" required value={fila.telefono} onChange={(e) => editar(fila.key, { telefono: e.target.value })} className={input} /></label>
            </div>}
            <button type="button" disabled={filas.length === 1} onClick={() => setFilas((actuales) => actuales.filter((f) => f.key !== fila.key))} className="text-sm text-red-700 hover:underline disabled:opacity-40" aria-label={`Quitar responsable ${index + 1}`}>Quitar responsable</button>
          </fieldset>
        ))}
        <button type="button" onClick={() => { setFilas([...filas, { key: nextKey, id: "", nombre: "", telefono: "" }]); setNextKey(nextKey + 1); }} className="rounded border border-teal-700 px-3 py-2 text-sm text-teal-700">+ Agregar responsable</button>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={enviando} className="rounded bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50">{enviando ? "Guardando..." : "Registrar mascota"}</button>
    </form>
  );
}
