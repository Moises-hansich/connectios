export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h2 className="text-xl font-bold">ConnectionJS</h2>
      </div>

      <nav className="mt-6 flex flex-col">
        <button className="px-6 py-4 text-left transition hover:bg-slate-800">
          📊 Dashboard
        </button>

        <button className="bg-slate-800 px-6 py-4 text-left">
          💻 Equipamentos
        </button>

        <button className="px-6 py-4 text-left transition hover:bg-slate-800">
          📍 Localizações
        </button>

        <button className="px-6 py-4 text-left transition hover:bg-slate-800">
          👤 Usuários
        </button>

        <button className="px-6 py-4 text-left transition hover:bg-slate-800">
          ⚙ Configurações
        </button>
      </nav>
    </aside>
  );
}
