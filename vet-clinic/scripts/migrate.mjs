import { promises as fs, constants } from "node:fs";
import path from "node:path";

const file = process.env.VET_DB_PATH || path.join(process.cwd(), "data", "db.json");
const original = await fs.readFile(file, "utf8");
const db = JSON.parse(original);
const key = (nombre, telefono) => `${nombre.trim().replace(/\s+/g, " ").toLowerCase()}|${telefono.replace(/[\s()+.-]/g, "")}`;
let changed = !Array.isArray(db.responsables);
db.responsables ??= [];
for (const mascota of db.mascotas) {
  if (!Array.isArray(mascota.responsableIds)) {
    if (typeof mascota.dueno !== "string" || !mascota.dueno.trim() || typeof mascota.telefono !== "string" || !mascota.telefono.trim()) {
      throw new Error(`Datos antiguos incompletos en ${mascota.id}; no se modificó el archivo`);
    }
    let responsable = db.responsables.find((r) => key(r.nombre, r.telefono) === key(mascota.dueno, mascota.telefono));
    if (!responsable) {
      responsable = { id: crypto.randomUUID(), nombre: mascota.dueno.trim(), telefono: mascota.telefono.trim() };
      db.responsables.push(responsable);
    }
    mascota.responsableIds = [responsable.id];
    changed = true;
  }
  if (!mascota.responsableIds.length || new Set(mascota.responsableIds).size !== mascota.responsableIds.length || mascota.responsableIds.some((id) => !db.responsables.some((r) => r.id === id))) {
    throw new Error(`Relación inválida en ${mascota.id}; no se modificó el archivo`);
  }
  if ("dueno" in mascota || "telefono" in mascota) {
    delete mascota.dueno;
    delete mascota.telefono;
    changed = true;
  }
}
if (changed) {
  // COPYFILE_EXCL impide sobrescribir un respaldo anterior.
  const backup = `${file}.pre-reto2.${crypto.randomUUID()}.bak`;
  await fs.copyFile(file, backup, constants.COPYFILE_EXCL);
  const temp = `${file}.migration.tmp`;
  try {
    await fs.writeFile(temp, JSON.stringify(db, null, 2) + "\n", { flag: "wx" });
    await fs.rename(temp, file);
  } finally {
    await fs.rm(temp, { force: true });
  }
  console.log(`Migración completada. Respaldo: ${backup}`);
} else {
  console.log("La base de datos ya está migrada; sin cambios.");
}
