import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const { login, autenticado, carregando } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const destino = state?.from?.pathname || "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    try {
      setErro("");
      setEnviando(true);

      await login({
        email: email.trim().toLowerCase(),
        senha,
      });

      navigate(destino, {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErro(
          error.response?.data?.mensagem ||
            "Não foi possível realizar o login.",
        );
      } else {
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (!carregando && autenticado) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen bg-slate-100">
      <section className="hidden flex-1 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <img
            src="/bg-logo.png"
            alt="ConnectionJS"
            className="h-12 w-12 object-contain"
          />

          <span className="text-2xl font-bold">ConnectionJS</span>
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Gestão de equipamentos
          </p>

          <h1 className="text-5xl font-bold leading-tight">
            Controle seus ativos de tecnologia em um único lugar.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Organize equipamentos, acompanhe status, localizações e informações
            importantes da infraestrutura da empresa.
          </p>
        </div>

        <p className="text-sm text-slate-400">© 2026 ConnectionJS</p>
      </section>

      <section className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/bg-logo.png"
                alt="ConnectionJS"
                className="h-11 w-11 object-contain"
              />

              <span className="text-2xl font-bold text-slate-900">
                ConnectionJS
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Bem-vindo</h2>

            <p className="mt-2 text-slate-500">
              Entre com sua conta para acessar o sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@connectionjs.com"
                  autoComplete="email"
                  disabled={enviando}
                  className="
                    w-full rounded-lg border border-slate-300
                    py-3 pl-10 pr-4 outline-none transition
                    placeholder:text-slate-400
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    disabled:cursor-not-allowed disabled:bg-slate-100
                  "
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  disabled={enviando}
                  className="
                    w-full rounded-lg border border-slate-300
                    py-3 pl-10 pr-12 outline-none transition
                    placeholder:text-slate-400
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                    disabled:cursor-not-allowed disabled:bg-slate-100
                  "
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((estado) => !estado)}
                  disabled={enviando}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    rounded p-1 text-slate-400
                    hover:text-slate-700
                  "
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {erro && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="
                flex w-full items-center justify-center gap-2
                rounded-lg bg-blue-600 px-4 py-3
                font-semibold text-white transition
                hover:bg-blue-700
                focus:outline-none focus:ring-4 focus:ring-blue-200
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {enviando && <LoaderCircle size={20} className="animate-spin" />}

              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
