import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

// Ejecuta los handlers y componentes reales sin servidor ni dependencias nuevas.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = process.cwd();
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const source = readFileSync(filename, "utf8").replace(/(["'])@\//g, `$1${root}/`);
    module._compile(ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    }).outputText, filename);
  };
}

await test("Reto 2: migración, API y páginas con datos temporales", async (t) => {
  const temp = await mkdtemp(path.join(tmpdir(), "vet-reto2-"));
  const file = path.join(temp, "db.json");
  const realBefore = await readFile(path.join(root, "data/db.json"), "utf8");
  const legacy = {
    mascotas: [
      { id: "m1", nombre: "Firulais", especie: "Perro", raza: "Labrador", edad: 5, dueno: "Ana Pérez", telefono: "0300 123" },
      { id: "m2", nombre: "Michi", especie: "Gato", raza: "Siamés", edad: 3, dueno: " ana   pérez ", telefono: "0300-123" },
      { id: "m3", nombre: "Copito", especie: "Conejo", raza: "Belier", edad: 2, dueno: "Ana Pérez", telefono: "999" },
    ],
    visitas: [{ id: "v1", mascotaId: "m1", fecha: "2026-01-01", motivo: "Control", diagnostico: "Sano", tratamiento: "Ninguno" }],
  };
  await writeFile(file, JSON.stringify(legacy));
  process.env.VET_DB_PATH = file;
  const migrate = () => execFileSync(process.execPath, ["scripts/migrate.mjs"], { cwd: root, env: process.env });
  const read = async () => JSON.parse(await readFile(file, "utf8"));
  try {
    await t.test("migra con respaldo, conserva datos y distingue homónimos", async () => {
      migrate();
      const db = await read();
      assert.equal(db.responsables.length, 2);
      assert.deepEqual(db.visitas, legacy.visitas);
      for (const original of legacy.mascotas) {
        const migrated = db.mascotas.find((m) => m.id === original.id);
        const { dueno, telefono, ...base } = original;
        const { responsableIds, ...actual } = migrated;
        assert.deepEqual(actual, base);
        assert.equal(responsableIds.length, 1);
      }
      assert.equal(db.responsables[0].telefono, "0300 123");
      const backup = (await readdir(temp)).find((f) => f.endsWith(".bak"));
      assert.deepEqual(JSON.parse(await readFile(path.join(temp, backup), "utf8")), legacy);
    });
    await t.test("segunda migración no modifica ni duplica", async () => {
      const before = await readFile(file, "utf8");
      migrate();
      assert.equal(await readFile(file, "utf8"), before);
      assert.equal((await readdir(temp)).filter((f) => f.endsWith(".bak")).length, 1);
    });
    const { NextRequest } = require("next/server");
    const mascotas = require(path.join(root, "app/api/mascotas/route.ts"));
    const detalle = require(path.join(root, "app/api/mascotas/[id]/route.ts"));
    const responsables = require(path.join(root, "app/api/responsables/route.ts"));
    const responsable = require(path.join(root, "app/api/responsables/[id]/route.ts"));
    const visitas = require(path.join(root, "app/api/mascotas/[id]/visitas/route.ts"));
    const ctx = (id) => ({ params: Promise.resolve({ id }) });
    const req = (body) => new NextRequest("http://localhost/api/mascotas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const base = { nombre: "Luna", especie: "Perro", raza: "Mestiza", edad: 2 };
    let luna, sol;
    await t.test("registra mascota con dos responsables", async () => {
      const response = await mascotas.POST(req({ ...base, responsables: [{ nombre: "Carlos", telefono: "00123" }, { nombre: "Lucía", telefono: "00456" }] }));
      assert.equal(response.status, 201);
      luna = await response.json();
      assert.equal(luna.responsables.length, 2);
      assert.equal(luna.dueno, "Carlos");
      assert.equal(luna.telefono, "00123");
    });
    await t.test("detalle expone ambos responsables y enlaces en la página", async () => {
      const data = await (await detalle.GET(null, ctx(luna.id))).json();
      assert.deepEqual(data.responsables, luna.responsables);
      const Page = require(path.join(root, "app/mascotas/[id]/page.tsx")).default;
      const { renderToStaticMarkup } = require("react-dom/server");
      const html = renderToStaticMarkup(await Page(ctx(luna.id)));
      for (const r of luna.responsables) {
        assert.ok(html.includes(`href="/responsables/${r.id}"`));
        assert.ok(html.includes(r.nombre));
        assert.ok(html.includes(r.telefono));
      }
    });
    await t.test("reutiliza un responsable y su ficha lista ambas mascotas", async () => {
      const response = await mascotas.POST(req({ ...base, nombre: "Sol", responsables: [{ id: luna.responsables[0].id }] }));
      assert.equal(response.status, 201);
      sol = await response.json();
      assert.equal(sol.responsables.length, 1);
      const data = await (await responsable.GET(null, ctx(luna.responsables[0].id))).json();
      assert.deepEqual(new Set(data.mascotas.map((m) => m.id)), new Set([luna.id, sol.id]));
      const Page = require(path.join(root, "app/responsables/[id]/page.tsx")).default;
      const html = require("react-dom/server").renderToStaticMarkup(await Page(ctx(data.id)));
      for (const id of [luna.id, sol.id]) assert.ok(html.includes(`href="/mascotas/${id}"`));
    });
    await t.test("busca por segundo responsable y por mascota", async () => {
      for (const q of ["lucía", "Luna"]) {
        const response = await mascotas.GET(new NextRequest(`http://localhost/api/mascotas?q=${encodeURIComponent(q)}`));
        assert.deepEqual((await response.json()).map((m) => m.id), [luna.id]);
      }
      assert.ok((await (await responsables.GET()).json()).some((r) => r.id === luna.responsables[0].id));
    });
    await t.test("rechaza entradas inválidas sin escrituras parciales", async () => {
      const before = await readFile(file, "utf8");
      const valid = [{ nombre: "Nuevo", telefono: "123" }];
      for (const body of [
        null, [], {}, { ...base, responsables: [] }, { ...base, responsables: "error" },
        { ...base, responsables: [...valid, { id: "inexistente" }] },
        { ...base, nombre: "  ", responsables: valid },
        { ...base, edad: -1, responsables: valid },
        { ...base, edad: false, responsables: valid },
        { ...base, responsables: [{ nombre: "", telefono: "123" }] },
        { ...base, responsables: [{ id: luna.responsables[0].id }, { id: luna.responsables[0].id }] },
        { ...base, responsables: [...valid, ...valid] },
        { ...base, responsables: valid, dueno: "Antiguo", telefono: "123" },
      ]) assert.equal((await mascotas.POST(req(body))).status, 400);
      const malformed = new NextRequest("http://localhost/api/mascotas", { method: "POST", body: "{" });
      assert.equal((await mascotas.POST(malformed)).status, 400);
      assert.equal(await readFile(file, "utf8"), before);
    });
    await t.test("acepta formato antiguo y reutiliza responsable conocido", async () => {
      const response = await mascotas.POST(req({ ...base, nombre: "Legacy", dueno: "Carlos", telefono: "00123" }));
      assert.equal(response.status, 201);
      assert.deepEqual((await response.json()).responsableIds, [luna.responsables[0].id]);
    });
    await t.test("conserva visitas y registra una nueva en orden descendente", async () => {
      const old = await (await visitas.GET(null, ctx("m1"))).json();
      assert.deepEqual(old, legacy.visitas);
      const response = await visitas.POST(req({ fecha: "2026-10-30", motivo: "Vacuna", diagnostico: "Sano", tratamiento: "Vacunación" }), ctx("m1"));
      assert.equal(response.status, 201);
      const historial = await (await visitas.GET(null, ctx("m1"))).json();
      assert.equal(historial[0].fecha, "2026-10-30");
      assert.deepEqual(historial[1], legacy.visitas[0]);
    });
    await t.test("IDs inexistentes devuelven 404", async () => {
      assert.equal((await detalle.GET(null, ctx("no-existe"))).status, 404);
      assert.equal((await responsable.GET(null, ctx("no-existe"))).status, 404);
      assert.equal((await visitas.GET(null, ctx("no-existe"))).status, 404);
      assert.equal((await visitas.POST(req({}), ctx("no-existe"))).status, 404);
    });
    await t.test("consultas no escriben y la base real permanece intacta", async () => {
      const before = await readFile(file, "utf8");
      await mascotas.GET(new NextRequest("http://localhost/api/mascotas"));
      await responsable.GET(null, ctx(luna.responsables[0].id));
      assert.equal(await readFile(file, "utf8"), before);
      assert.equal(await readFile(path.join(root, "data/db.json"), "utf8"), realBefore);
    });
  } finally {
    delete process.env.VET_DB_PATH;
    await rm(temp, { recursive: true, force: true });
  }
});
