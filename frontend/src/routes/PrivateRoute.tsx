import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw, ShieldAlert } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "../layouts/MainLayout";

interface PrivateRouteProps {
  children: ReactNode;
  permissoes?: string[];
  somenteAdmin?: boolean;
}

export function PrivateRoute({
  children,
  permissoes = [],
  somenteAdmin = false,
}: PrivateRouteProps) {
  const {
    usuario,
    autenticado,
    carregando,
    carregandoPermissoes,
    erroPermissoes,
    temTodasPermissoes,
    atualizarPermissoes,
  } = useAuth();

  const location = useLocation();

  if (carregando) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center bg-slate-100"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-600">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (erroPermissoes) {
    return (
      <MainLayout>
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm"
        >
          <ShieldAlert size={40} className="mx-auto mb-4 text-amber-600" />

          <h1 className="text-xl font-bold text-slate-900">
            Não foi possível verificar seu acesso
          </h1>

          <p className="mt-2 text-sm text-slate-600">{erroPermissoes}</p>

          <button
            type="button"
            disabled={carregandoPermissoes}
            onClick={() => void atualizarPermissoes()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={carregandoPermissoes ? "animate-spin" : ""}
            />
            Tentar novamente
          </button>
        </div>
      </MainLayout>
    );
  }

  const perfilPermitido = !somenteAdmin || usuario?.perfil === "ADMIN";

  const permissoesPermitidas =
    permissoes.length === 0 || temTodasPermissoes(...permissoes);

  if (!perfilPermitido || !permissoesPermitidas) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert size={40} className="mx-auto mb-4 text-amber-600" />

          <h1 className="text-xl font-bold text-slate-900">
            Acesso não permitido
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Seu usuário não possui acesso a esta página. Selecione uma opção
            disponível no menu ou solicite acesso ao administrador.
          </p>

          <button
            type="button"
            disabled={carregandoPermissoes}
            onClick={() => void atualizarPermissoes()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={carregandoPermissoes ? "animate-spin" : ""}
            />

            {carregandoPermissoes
              ? "Verificando..."
              : "Verificar acesso novamente"}
          </button>
        </div>
      </MainLayout>
    );
  }

  return children;
}
