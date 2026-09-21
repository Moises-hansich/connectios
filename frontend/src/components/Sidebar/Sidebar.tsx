import { LogOut, Menu, RefreshCw, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { menuItems } from "./menu";

interface SidebarProps {
  aberta: boolean;
  mobileAberta: boolean;
  onAlternar: () => void;
  onFecharMobile: () => void;
}

export function Sidebar({
  aberta,
  mobileAberta,
  onAlternar,
  onFecharMobile,
}: SidebarProps) {
  const {
    usuario,
    carregando,
    carregandoPermissoes,
    erroPermissoes,
    temTodasPermissoes,
    atualizarPermissoes,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const itensVisiveis = menuItems.filter((item) => {
    if (!usuario || carregando || erroPermissoes) {
      return false;
    }

    if (item.somenteAdmin) {
      return usuario.perfil === "ADMIN";
    }

    return temTodasPermissoes(...item.permissoes);
  });

  function handleLogout() {
    logout();
    onFecharMobile();
    navigate("/login", { replace: true });
  }

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
            flex h-16 shrink-0 items-center
            border-b border-slate-800 px-4
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

        <nav
          aria-label="Menu principal"
          aria-busy={carregando || carregandoPermissoes}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
        >
          {itensVisiveis.map((item) => {
            const Icone = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onFecharMobile}
                aria-label={item.title}
                title={!aberta ? item.title : undefined}
                className={({ isActive }) => `
                  flex items-center rounded-lg px-3 py-3
                  transition-colors

                  ${
                    isActive
                      ? "bg-slate-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }

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
                  {item.title}
                </span>
              </NavLink>
            );
          })}

          {erroPermissoes && (
            <div className="rounded-lg bg-slate-800 p-2">
              <p
                role="alert"
                className={`
                  mb-2 text-sm text-amber-200
                  ${aberta ? "" : "md:sr-only"}
                `}
              >
                {erroPermissoes}
              </p>

              <button
                type="button"
                onClick={() => void atualizarPermissoes()}
                disabled={carregandoPermissoes}
                aria-label="Tentar carregar permissões novamente"
                title="Tentar novamente"
                className={`
                  flex w-full items-center justify-center
                  gap-2 rounded-lg p-2 text-sm text-white
                  hover:bg-slate-700 disabled:opacity-50
                `}
              >
                <RefreshCw
                  size={18}
                  className={
                    carregandoPermissoes ? "shrink-0 animate-spin" : "shrink-0"
                  }
                />

                <span className={aberta ? "" : "md:hidden"}>
                  Tentar novamente
                </span>
              </button>
            </div>
          )}

          {!carregando &&
            !carregandoPermissoes &&
            !erroPermissoes &&
            itensVisiveis.length === 0 && (
              <p
                role="status"
                className={`
                  px-3 py-2 text-sm text-slate-400
                  ${aberta ? "" : "md:sr-only"}
                `}
              >
                Nenhum módulo disponível para seu usuário.
              </p>
            )}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className={`
              flex w-full items-center gap-3 rounded-lg px-3 py-3
              text-red-300 transition-colors
              hover:bg-red-500/10 hover:text-red-200

              ${aberta ? "" : "md:justify-center md:gap-0"}
            `}
            title="Sair"
          >
            <LogOut size={21} className="shrink-0" />

            <span
              className={`
                whitespace-nowrap
                ${aberta ? "" : "md:hidden"}
              `}
            >
              Sair
            </span>
          </button>

          <button
            type="button"
            onClick={onAlternar}
            aria-label={aberta ? "Recolher menu" : "Expandir menu"}
            className={`
              hidden w-full items-center rounded-lg px-3 py-3 md:flex
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
