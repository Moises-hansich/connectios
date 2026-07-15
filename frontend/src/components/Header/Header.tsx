export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      <h1 className="text-2xl font-bold text-cyan-600">ConnectionJS</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">Bem-vindo</span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-white font-bold">
          M
        </div>
      </div>
    </header>
  );
}
