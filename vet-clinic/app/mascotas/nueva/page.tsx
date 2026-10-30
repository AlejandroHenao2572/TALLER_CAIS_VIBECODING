import MascotaForm from "@/components/MascotaForm";
import { listarResponsables } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NuevaMascota() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrar mascota</h1>
      <MascotaForm responsables={await listarResponsables()} />
    </div>
  );
}
