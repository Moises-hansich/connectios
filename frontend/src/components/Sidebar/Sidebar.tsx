import { LayoutDashboard, Menu, Package, Settings, X } from "lucide-react";

interface SidebarProps {
  aberta: boolean;
  mobileAberta: boolean;
  onAlternar: () => void;
  onFecharMobile: () => void;
}

const itensMenu = [
  {
    nome: "Dashboard",
    icone: LayoutDashboard,
    href: "/",
  },
  {
    nome: "Equipamentos",
    icone: Package,
    href: "/equipamentos",
  },
  {
    nome: "Configurações",
    icone: Settings,
    href: "/configuracoes",
  },
];

export function Sidebar({
  aberta,
  mobileAberta,
  onAlternar,
  onFecharMobile,
}: SidebarProps) {
  return (
    <>
      {mobileAberta && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onFecharMobile}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-slate-900 text-white shadow-xl
          transition-all duration-300

          ${aberta ? "md:w-64" : "md:w-20"}

          ${
            mobileAberta
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full md:translate-x-0"
          }
        `}
      >
        <div
          className={`
            flex h-16 items-center border-b border-slate-800 px-4
            ${aberta ? "justify-between" : "md:justify-center"}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/bg-logo.png"
              alt="ConnectionJS"
              className="h-9 w-9 shrink-0 object-contain"
            />

            <span
              className={`
                whitespace-nowrap text-lg font-bold
                ${aberta ? "md:block" : "md:hidden"}
              `}
            >
              ConnectionJS
            </span>
          </div>

          <button
            type="button"
            onClick={onFecharMobile}
            className="rounded-lg p-2 hover:bg-slate-800 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-3">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <a
                key={item.nome}
                href={item.href}
                title={!aberta ? item.nome : undefined}
                className={`
                  flex items-center rounded-lg px-3 py-3
                  text-slate-300 transition-colors
                  hover:bg-slate-800 hover:text-white

                  ${aberta ? "gap-3" : "md:justify-center"}
                `}
              >
                <Icone size={21} className="shrink-0" />

                <span
                  className={`
                    whitespace-nowrap
                    ${aberta ? "md:block" : "md:hidden"}
                  `}
                >
                  {item.nome}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="hidden border-t border-slate-800 p-3 md:block">
          <button
            type="button"
            onClick={onAlternar}
            className={`
              flex w-full items-center rounded-lg px-3 py-3
              text-slate-300 transition-colors
              hover:bg-slate-800 hover:text-white

              ${aberta ? "gap-3" : "justify-center"}
            `}
            title={aberta ? "Recolher menu" : "Expandir menu"}
          >
            <Menu size={21} />

            {aberta && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
