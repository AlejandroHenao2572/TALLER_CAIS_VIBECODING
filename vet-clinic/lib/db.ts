import { promises as fs } from "fs";
import path from "path";
import type { DB, Mascota, MascotaDetalle, Visita } from "./types";

const DB_PATH = process.env.VET_DB_PATH || path.join(process.cwd(), "data", "db.json");

export async function readDB(): Promise<DB> {
  const db = JSON.parse(await fs.readFile(DB_PATH, "utf-8"));
  if (!Array.isArray(db.responsables)) throw new Error("Ejecuta npm run migrate antes de iniciar la aplicación");
  return db;
}

// Serializa las escrituras en este proceso y reemplaza el JSON de forma atómica.
// La app local debe ejecutarse en un único proceso escritor.
const state = globalThis as typeof globalThis & { vetWriteQueue?: Promise<unknown> };
async function actualizar<T>(change: (db: DB) => T): Promise<T> {
  const pending = (state.vetWriteQueue ?? Promise.resolve()).then(async () => {
    const db = await readDB();
    const result = change(db);
    const temp = `${DB_PATH}.${crypto.randomUUID()}.tmp`;
    try {
      await fs.writeFile(temp, JSON.stringify(db, null, 2) + "\n");
      await fs.rename(temp, DB_PATH);
    } finally {
      await fs.rm(temp, { force: true });
    }
    return result;
  });
  state.vetWriteQueue = pending.catch(() => undefined);
  return pending;
}

function detalle(db: DB, mascota: Mascota): MascotaDetalle {
  const responsables = mascota.responsableIds.map((id) => {
    const responsable = db.responsables.find((r) => r.id === id);
    if (!responsable) throw new Error(`Responsable inexistente: ${id}`);
    return responsable;
  });
  return { ...mascota, responsables, dueno: responsables[0]?.nombre ?? "", telefono: responsables[0]?.telefono ?? "" };
}

export async function listarMascotas(q = ""): Promise<MascotaDetalle[]> {
  const db = await readDB();
  const t = q.trim().toLowerCase();
  return db.mascotas.map((m) => detalle(db, m)).filter((m) =>
    !t || m.nombre.toLowerCase().includes(t) || m.responsables.some((r) => r.nombre.toLowerCase().includes(t))
  );
}

export async function getMascota(id: string) {
  const db = await readDB();
  const mascota = db.mascotas.find((m) => m.id === id);
  return mascota ? detalle(db, mascota) : null;
}

export async function listarResponsables() {
  return (await readDB()).responsables;
}

export async function getResponsable(id: string) {
  const db = await readDB();
  const responsable = db.responsables.find((r) => r.id === id);
  if (!responsable) return null;
  return { ...responsable, mascotas: db.mascotas.filter((m) => m.responsableIds.includes(id)).map((m) => detalle(db, m)) };
}

export class ValidacionError extends Error {}
export function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function faltantes(body: unknown, campos: string[]) {
  if (!esObjeto(body)) return "El cuerpo debe ser un objeto JSON";
  const malos = campos.filter((c) => typeof body[c] !== "string" || !(body[c] as string).trim());
  return malos.length ? `Campos obligatorios: ${malos.join(", ")}` : null;
}
const clave = (nombre: string, telefono: string) =>
  `${nombre.trim().replace(/\s+/g, " ").toLowerCase()}|${telefono.replace(/[\s()+.-]/g, "")}`;

export async function crearMascota(body: unknown) {
  if (!esObjeto(body)) throw new ValidacionError("El cuerpo debe ser un objeto JSON");
  const error = faltantes(body, ["nombre", "especie", "raza"]);
  if (error) throw new ValidacionError(error);
  const edad = Number(body.edad);
  if (!["string", "number"].includes(typeof body.edad) || String(body.edad).trim() === "" || !Number.isFinite(edad) || edad < 0) {
    throw new ValidacionError("La edad debe ser un número mayor o igual a 0");
  }
  const antiguo = "dueno" in body || "telefono" in body;
  if (antiguo && "responsables" in body) throw new ValidacionError("No mezcles dueno/telefono con responsables");
  let entradas: unknown = body.responsables;
  if (antiguo) {
    const error = faltantes(body, ["dueno", "telefono"]);
    if (error) throw new ValidacionError(error);
    entradas = [{ nombre: body.dueno, telefono: body.telefono }];
  }
  if (!Array.isArray(entradas) || entradas.length === 0) throw new ValidacionError("Agrega al menos un responsable");
  const seleccion = entradas.map((r: unknown) => {
    if (!esObjeto(r)) throw new ValidacionError("Responsable inválido");
    if ("id" in r) {
      if (typeof r.id !== "string" || !r.id.trim() || "nombre" in r || "telefono" in r) throw new ValidacionError("Selecciona un responsable por ID o crea uno con nombre y teléfono");
      return { id: r.id.trim() };
    }
    const error = faltantes(r, ["nombre", "telefono"]);
    if (error) throw new ValidacionError(error);
    return { nombre: (r.nombre as string).trim(), telefono: (r.telefono as string).trim() };
  });
  return actualizar((db) => {
    const ids: string[] = [];
    for (const entrada of seleccion) {
      let responsable;
      if ("id" in entrada) {
        responsable = db.responsables.find((r) => r.id === entrada.id);
        if (!responsable) throw new ValidacionError("El responsable seleccionado no existe");
      } else {
        responsable = db.responsables.find((r) => clave(r.nombre, r.telefono) === clave(entrada.nombre, entrada.telefono));
        if (!responsable) {
          responsable = { id: crypto.randomUUID(), ...entrada };
          db.responsables.push(responsable);
        }
      }
      if (ids.includes(responsable.id)) throw new ValidacionError("No repitas el mismo responsable");
      ids.push(responsable.id);
    }
    const mascota: Mascota = { id: crypto.randomUUID(), nombre: (body.nombre as string).trim(), especie: (body.especie as string).trim(), raza: (body.raza as string).trim(), edad, responsableIds: ids };
    db.mascotas.push(mascota);
    return detalle(db, mascota);
  });
}

export async function visitasDe(mascotaId: string) {
  return (await readDB()).visitas.filter((v) => v.mascotaId === mascotaId).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function crearVisita(data: Omit<Visita, "id">) {
  return actualizar((db) => {
    const visita = { id: crypto.randomUUID(), ...data };
    db.visitas.push(visita);
    return visita;
  });
}
