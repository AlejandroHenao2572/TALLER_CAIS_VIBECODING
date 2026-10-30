# Clínica Veterinaria 🐾

App web con Next.js App Router, TypeScript y Tailwind para registrar mascotas, sus responsables y sus visitas. Conserva la persistencia JSON y las dependencias del reto 1.

## Cómo correrla

```bash
cd vet-clinic
npm ci
npm run migrate
npm run dev
```

Abrir http://localhost:3000. La base incluida ya está migrada y conserva las cuatro mascotas existentes (Firulais, Michi, Copito y Volcan) y las cuatro visitas.

## Funciones y pantallas

- `/`: listado y búsqueda por nombre de mascota o cualquiera de sus responsables, sin duplicar resultados.
- `/mascotas/nueva`: registro con uno o varios responsables. Permite elegir personas existentes, crear nuevas y quitar filas antes de guardar.
- `/mascotas/[id]`: datos de la mascota, todos sus responsables con teléfono y enlace a su ficha, e historial de visitas.
- `/responsables/[id]`: datos de un responsable y todas sus mascotas con enlaces a sus detalles.
- `/mascotas/[id]/visitas/nueva`: registro de visitas.

## Modelo y migración del reto 2

`vet-clinic/data/db.json` contiene:

- `mascotas`: `id`, `nombre`, `especie`, `raza`, `edad` y `responsableIds` (uno o más IDs, sin repeticiones).
- `responsables`: `id`, `nombre` y `telefono` como texto.
- `visitas`: conserva el modelo anterior y su vínculo `mascotaId`.

Una persona puede ser responsable de varias mascotas y una mascota puede tener varios responsables. Los vínculos se consultan por ID. Los datos del contacto se guardan una sola vez.

Con la app detenida, ejecutar `npm run migrate` desde `vet-clinic` convierte el formato antiguo (`dueno`/`telefono`) y crea **antes de escribir** un respaldo `data/db.json.pre-reto2.<UUID>.bak`. Los respaldos no se versionan. Repetir la migración sobre datos ya migrados no escribe ni crea duplicados. Las consultas normales tampoco escriben.

Se reutiliza un responsable cuando coinciden el nombre normalizado (espacios y mayúsculas) y el teléfono sin espacios, paréntesis, puntos, guiones ni signo `+`. No se fusionan personas solo por nombre. Esta misma regla se aplica al crear contactos nuevos; el teléfono original permanece como texto, incluidos ceros iniciales. Si existen datos antiguos incompletos o relaciones inválidas, la migración se detiene sin reemplazar la base.

Para recuperar el formato anterior, detener la app, conservar una copia del estado actual y restaurar el respaldo junto con la versión anterior del código. Para seguir usando el código del reto 2, ejecutar nuevamente la migración sobre el respaldo restaurado.

Las escrituras de mascota y responsables se validan completas y se guardan juntas mediante reemplazo atómico del JSON. Se serializan en un único proceso. Esta solución local no admite varios procesos escritores simultáneos; detener la app antes de migrar. `VET_DB_PATH` permite usar otro archivo, principalmente para pruebas.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mascotas?q=texto` | Lista/busca mascotas con todos sus responsables |
| POST | `/api/mascotas` | Crea mascota y asocia/crea responsables conjuntamente |
| GET | `/api/mascotas/[id]` | Detalle, responsables e historial de visitas |
| GET | `/api/responsables` | Responsables disponibles para selección |
| GET | `/api/responsables/[id]` | Responsable y todas sus mascotas |
| GET | `/api/mascotas/[id]/visitas` | Historial, ordenado de más reciente a más antiguo |
| POST | `/api/mascotas/[id]/visitas` | Registra visita |

Ejemplo nuevo de `POST /api/mascotas`:

```json
{
  "nombre": "Luna",
  "especie": "Perro",
  "raza": "Mestiza",
  "edad": 2,
  "responsables": [
    { "nombre": "Ana", "telefono": "3001234567" },
    { "nombre": "Luis", "telefono": "3101234567" }
  ]
}
```

Para reutilizar un responsable, sustituir una entrada por `{ "id": "ID_OBTENIDO_DE_API_RESPONSABLES" }`. Se pueden combinar entradas nuevas y existentes. Cada entrada debe contener un ID o nombre y teléfono, sin mezclar ambas formas.

Se acepta el formato anterior:

```json
{
  "nombre": "Luna",
  "especie": "Perro",
  "raza": "Mestiza",
  "edad": 2,
  "dueno": "Ana",
  "telefono": "3001234567"
}
```

Mezclar `responsables` con `dueno` o `telefono` devuelve 400. También se rechazan JSON mal formado, campos vacíos, edad negativa/no numérica, responsables repetidos, listas vacías e IDs seleccionados inexistentes. No se guardan contactos parciales si falla la solicitud.

Las respuestas de mascotas conservan `dueno` y `telefono` por compatibilidad, derivados del primer responsable. Estos campos no se persisten ni representan a todos los responsables: usar `responsables` para mostrar la lista completa. Las creaciones devuelven 201, las validaciones 400 y las consultas de mascotas/responsables inexistentes 404.

## Verificación

Desde `vet-clinic`:

```bash
npx tsc --noEmit
npm test
npm run build
```

Las pruebas usan el ejecutor incorporado de Node, TypeScript y React ya instalados. Ejecutan los handlers reales y renderizan las páginas de detalle con una base temporal; no cambian la base real. Cubren migración con respaldo, repetibilidad, homónimos, dos responsables, responsable compartido, enlaces, búsqueda por segundo responsable, registro con uno solo, validaciones, compatibilidad antigua, visitas, 404 y consultas sin escrituras.

Comprobación manual:

1. Registrar una mascota con dos responsables nuevos; abrirla y comprobar nombres, teléfonos y enlaces.
2. Registrar otra mascota seleccionando uno de esos responsables; abrir su ficha y comprobar que aparecen ambas mascotas.
3. Buscar por el nombre del segundo responsable y encontrar la primera mascota.
4. Agregar y quitar filas; intentar enviar campos vacíos y repetir responsables.
5. Abrir una mascota anterior y registrar una visita; comprobar el historial y su orden.
6. Repetir la migración con la app detenida y comprobar que informa que no hay cambios.

En entornos restringidos, la compilación necesita permisos para subprocesos y puertos locales. Si Turbopack falla por el entorno, se puede comprobar la compilación con `npm run build -- --webpack`, sin cambiar dependencias.

## Cierre del taller

- [ ] Registrar los minutos reales del reto en `BITACORA.md`.
- [ ] Revisar/guardar la entrega y crear el tag `reto2` sobre su commit.
- [ ] Realizar el check en Miro.
