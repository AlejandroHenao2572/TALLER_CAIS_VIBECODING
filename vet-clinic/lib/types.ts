export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  dueno: string;
  telefono: string;
}

export interface Visita {
  id: string;
  mascotaId: string;
  fecha: string; // YYYY-MM-DD
  motivo: string;
  diagnostico: string;
  tratamiento: string;
}

export interface DB {
  mascotas: Mascota[];
  visitas: Visita[];
}
