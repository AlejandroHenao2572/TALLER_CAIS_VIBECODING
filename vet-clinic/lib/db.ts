import { promises as fs } from "fs";
import path from "path";
import type { DB, Mascota, Visita } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// ponytail: lectura/escritura completa sin lock; suficiente para una clínica local. Con concurrencia real → SQLite.
export async function readDB(): Promise<DB> {
  return JSON.parse(await fs.readFile(DB_PATH, "utf-8"));
}

export async function writeDB(db: DB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function listarMascotas(q = ""): Promise<Mascota[]> {
  const { mascotas } = await readDB();
  const t = q.trim().toLowerCase();
  if (!t) return mascotas;
  return mascotas.filter(
    (m) => m.nombre.toLowerCase().includes(t) || m.dueno.toLowerCase().includes(t)
  );
}

export async function getMascota(id: string) {
  const { mascotas } = await readDB();
  return mascotas.find((m) => m.id === id) ?? null;
}

export async function crearMascota(data: Omit<Mascota, "id">) {
  const db = await readDB();
  const mascota = { id: crypto.randomUUID(), ...data };
  db.mascotas.push(mascota);
  await writeDB(db);
  return mascota;
}

export async function visitasDe(mascotaId: string) {
  const { visitas } = await readDB();
  return visitas
    .filter((v) => v.mascotaId === mascotaId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function crearVisita(data: Omit<Visita, "id">) {
  const db = await readDB();
  const visita = { id: crypto.randomUUID(), ...data };
  db.visitas.push(visita);
  await writeDB(db);
  return visita;
}

// Valida que los campos indicados sean strings no vacíos. Devuelve el mensaje de error o null.
export function faltantes(body: Record<string, unknown>, campos: string[]) {
  const malos = campos.filter((c) => typeof body[c] !== "string" || !(body[c] as string).trim());
  return malos.length ? `Campos obligatorios: ${malos.join(", ")}` : null;
}
