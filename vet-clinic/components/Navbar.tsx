import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-teal-700 text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          🐾 Clínica Veterinaria
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">Mascotas</Link>
          <Link href="/mascotas/nueva" className="hover:underline">Registrar mascota</Link>
        </div>
      </div>
    </nav>
  );
}
