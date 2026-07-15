import { menuItems } from "./menu";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h2 className="text-xl font-bold">ConnectionJS</h2>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-slate-800"
            >
              <Icon size={20} />
              {item.title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
