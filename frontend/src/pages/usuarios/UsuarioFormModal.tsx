import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Save, UserPlus, X } from "lucide-react";

import type {
  AtualizarUsuarioDTO,
  CriarUsuarioDTO,
  Usuario,
} from "../../services/usuarioService";

interface UsuarioFormModalProps {
  aberto: boolean;
  usuario?: Usuario | null;
  carregando?: boolean;
  erro?: string;
  onFechar: () => void;
  onSalvar: (dados: CriarUsuarioDTO | AtualizarUsuarioDTO) => Promise<void>;
}

interface FormularioUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
  ativo: boolean;
}

const formularioInicial: FormularioUsuario = {
  nome: "",
  email: "",
  senha: "",
  perfil: "USUARIO",
  ativo: true,
};

export function UsuarioFormModal({
  aberto,
  usuario,
  carregando = false,
  erro = "",
  onFechar,
  onSalvar,
}: UsuarioFormModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  const [erroFormulario, setErroFormulario] = useState("");

  const modoEdicao = Boolean(usuario);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    setErroFormulario("");

    if (usuario) {
      setFormulario({
        nome: usuario.nome,
        email: usuario.email,
        senha: "",
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      });

      return;
    }

    setFormulario(formularioInicial);
  }, [aberto, usuario]);

  function atualizarCampo(
    campo: keyof FormularioUsuario,
    valor: string | boolean,
  ) {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErroFormulario("");

    const nome = formulario.nome.trim();
    const email = formulario.email.trim().toLowerCase();

    if (!nome) {
      setErroFormulario("Informe o nome do usuário.");
      return;
    }

    if (!email) {
      setErroFormulario("Informe o e-mail do usuário.");
      return;
    }

    if (!modoEdicao && formulario.senha.length < 6) {
      setErroFormulario("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (
      modoEdicao &&
      formulario.senha.length > 0 &&
      formulario.senha.length < 6
    ) {
      setErroFormulario("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (modoEdicao) {
      const dados: AtualizarUsuarioDTO = {
        nome,
        email,
        perfil: formulario.perfil,
        ativo: formulario.ativo,
      };

      if (formulario.senha) {
        dados.senha = formulario.senha;
      }

      await onSalvar(dados);
      return;
    }

    const dados: CriarUsuarioDTO = {
      nome,
      email,
      senha: formulario.senha,
      perfil: formulario.perfil,
    };

    await onSalvar(dados);
  }

  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {modoEdicao ? "Editar usuário" : "Novo usuário"}
              </h2>

              <p className="text-sm text-slate-500">
                {modoEdicao
                  ? "Atualize as informações do usuário."
                  : "Preencha os dados para cadastrar um usuário."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={carregando}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="space-y-5 p-6">
            {(erroFormulario || erro) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erroFormulario || erro}
              </div>
            )}

            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nome
              </label>

              <input
                id="nome"
                type="text"
                value={formulario.nome}
                onChange={(event) => atualizarCampo("nome", event.target.value)}
                disabled={carregando}
                placeholder="Nome completo"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  atualizarCampo("email", event.target.value)
                }
                disabled={carregando}
                placeholder="usuario@empresa.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {modoEdicao ? "Nova senha" : "Senha"}
              </label>

              <input
                id="senha"
                type="password"
                value={formulario.senha}
                onChange={(event) =>
                  atualizarCampo("senha", event.target.value)
                }
                disabled={carregando}
                placeholder={
                  modoEdicao
                    ? "Deixe em branco para manter a senha atual"
                    : "Mínimo de 6 caracteres"
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              {modoEdicao && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Preencha somente quando desejar alterar a senha.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="perfil"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Perfil
                </label>

                <select
                  id="perfil"
                  value={formulario.perfil}
                  onChange={(event) =>
                    atualizarCampo("perfil", event.target.value)
                  }
                  disabled={carregando}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="USUARIO">Usuário</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {modoEdicao && (
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </span>

                  <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-3">
                    <input
                      type="checkbox"
                      checked={formulario.ativo}
                      onChange={(event) =>
                        atualizarCampo("ativo", event.target.checked)
                      }
                      disabled={carregando}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span className="text-sm text-slate-700">
                      Usuário ativo
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onFechar}
              disabled={carregando}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {carregando
                ? "Salvando..."
                : modoEdicao
                  ? "Salvar alterações"
                  : "Cadastrar usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
