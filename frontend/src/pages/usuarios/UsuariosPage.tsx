import { useEffect, useState } from "react";
import {
  CirclePlus,
  Pencil,
  Power,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";

import {
  usuarioService,
  type AtualizarUsuarioDTO,
  type CriarUsuarioDTO,
  type Usuario,
} from "../../services/usuarioService";

import { UsuarioFormModal } from "./UsuarioFormModal";

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null,
  );

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await usuarioService.listar();

      setUsuarios(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    return (
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.perfil.toLowerCase().includes(termo)
    );
  });

  function abrirNovoUsuario() {
    setUsuarioSelecionado(null);
    setErroModal("");
    setModalAberto(true);
  }

  function abrirEdicaoUsuario(usuario: Usuario) {
    setUsuarioSelecionado(usuario);
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setUsuarioSelecionado(null);
    setErroModal("");
  }

  async function salvarUsuario(dados: CriarUsuarioDTO | AtualizarUsuarioDTO) {
    try {
      setSalvando(true);
      setErroModal("");

      if (usuarioSelecionado) {
        const usuarioAtualizado = await usuarioService.atualizar(
          usuarioSelecionado.id,
          dados as AtualizarUsuarioDTO,
        );

        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.map((usuario) =>
            usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario,
          ),
        );
      } else {
        const novoUsuario = await usuarioService.criar(
          dados as CriarUsuarioDTO,
        );

        setUsuarios((usuariosAtuais) => [novoUsuario, ...usuariosAtuais]);
      }

      setModalAberto(false);
      setUsuarioSelecionado(null);
    } catch (error: unknown) {
      console.error(error);

      let mensagem = "Não foi possível salvar o usuário.";

      if (typeof error === "object" && error !== null && "response" in error) {
        const erroAxios = error as {
          response?: {
            data?: {
              mensagem?: string;
            };
          };
        };

        mensagem =
          erroAxios.response?.data?.mensagem ??
          "Não foi possível salvar o usuário.";
      }

      setErroModal(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(usuario: Usuario) {
    try {
      setErro("");

      const usuarioAtualizado = await usuarioService.alterarStatus(
        usuario.id,
        !usuario.ativo,
      );

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((item) =>
          item.id === usuario.id ? usuarioAtualizado : item,
        ),
      );
    } catch (error: unknown) {
      console.error(error);

      let mensagem = "Não foi possível alterar o status do usuário.";

      if (typeof error === "object" && error !== null && "response" in error) {
        const erroAxios = error as {
          response?: {
            data?: {
              mensagem?: string;
            };
          };
        };

        mensagem =
          erroAxios.response?.data?.mensagem ??
          "Não foi possível alterar o status do usuário.";
      }

      setErro(mensagem);
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o usuário "${usuario.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");

      await usuarioService.excluir(usuario.id);

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.filter((item) => item.id !== usuario.id),
      );
    } catch (error: unknown) {
      console.error(error);

      let mensagem = "Não foi possível excluir o usuário.";

      if (typeof error === "object" && error !== null && "response" in error) {
        const erroAxios = error as {
          response?: {
            data?: {
              mensagem?: string;
            };
          };
        };

        mensagem =
          erroAxios.response?.data?.mensagem ??
          "Não foi possível excluir o usuário.";
      }

      setErro(mensagem);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <UserRound className="h-7 w-7 text-blue-600" />
              Gerenciamento de usuários
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre, edite e controle o acesso dos usuários do sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNovoUsuario}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            <CirclePlus className="h-5 w-5" />
            Novo usuário
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Pesquisar por nome, e-mail ou perfil"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {erro && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="p-10 text-center text-slate-500">
              Carregando usuários...
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="font-medium text-slate-700">
                Nenhum usuário encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tente alterar a pesquisa ou cadastre um novo usuário.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Usuário
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Perfil
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Criado em
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {usuariosFiltrados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {usuario.nome}
                            </p>

                            <p className="text-sm text-slate-500">
                              {usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {usuario.perfil}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            usuario.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar usuário"
                            onClick={() => abrirEdicaoUsuario(usuario)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title={
                              usuario.ativo
                                ? "Inativar usuário"
                                : "Ativar usuário"
                            }
                            onClick={() => alterarStatus(usuario)}
                            className={`rounded-lg p-2 transition ${
                              usuario.ativo
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <Power className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Excluir usuário"
                            onClick={() => excluirUsuario(usuario)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <UsuarioFormModal
          aberto={modalAberto}
          usuario={usuarioSelecionado}
          carregando={salvando}
          erro={erroModal}
          onFechar={fecharModal}
          onSalvar={salvarUsuario}
        />
      </div>
    </MainLayout>
  );
}
