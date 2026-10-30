# Clínica Veterinaria 🐾

App web (Next.js App Router + TypeScript + Tailwind) para llevar el control de mascotas y sus visitas.
Los datos se guardan en `data/db.json` (incluye 3 mascotas y visitas de ejemplo).

## Cómo correrla

```bash
cd vet-clinic
npm install
npm run dev
```

Abrir http://localhost:3000

## Funciones
- Registrar mascota (`/mascotas/nueva`)
- Lista con buscador por nombre de mascota o dueño (`/`)
- Detalle con historial de visitas (`/mascotas/[id]`)
- Registrar visita (`/mascotas/[id]/visitas/nueva`)

## API
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mascotas?q=texto` | Lista / busca mascotas |
| POST | `/api/mascotas` | Crea mascota |
| GET | `/api/mascotas/[id]` | Detalle + visitas |
| GET | `/api/mascotas/[id]/visitas` | Historial de visitas |
| POST | `/api/mascotas/[id]/visitas` | Registra visita |
