import { UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      <h1 className="text-2xl font-bold text-cyan-600">ConnectionJS</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">Bem-vindo</span>

        <div className="flex items-center gap-2">
          <UserCircle size={28} />
          <span>Moisés</span>
        </div>
      </div>
    </header>
  );
}
