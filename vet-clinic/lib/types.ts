export interface Responsable {
  id: string;
  nombre: string;
  telefono: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  responsableIds: string[];
}

// Los campos antiguos se derivan; nunca se persisten.
export interface MascotaDetalle extends Mascota {
  responsables: Responsable[];
  dueno: string;
  telefono: string;
}

export interface Visita {
  id: string;
  mascotaId: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
}

export interface DB {
  mascotas: Mascota[];
  responsables: Responsable[];
  visitas: Visita[];
}
