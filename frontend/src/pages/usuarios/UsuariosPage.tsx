import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FilterX,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import {
  usuarioService,
  type AtualizarUsuarioDTO,
  type CriarUsuarioDTO,
  type Usuario,
} from "../../services/usuarioService";
import { UsuarioPermissoesModal } from "./UsuarioPermissoesModal";
import { UsuarioFormModal } from "./UsuarioFormModal";

const perfis = [
  { valor: "ADMIN", nome: "Administrador" },
  { valor: "TECNICO", nome: "Técnico" },
  { valor: "CONSULTA", nome: "Consulta" },
  { valor: "USUARIO", nome: "Usuário" },
];

const campoClasse =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const botaoClasse =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

function mensagemErro(error: unknown, padrao: string) {
  if (
    axios.isAxiosError<{
      mensagem?: string;
      message?: string;
    }>(error)
  ) {
    return (
      error.response?.data?.mensagem || error.response?.data?.message || padrao
    );
  }

  return padrao;
}

function nomePerfil(perfil: string) {
  return perfis.find((item) => item.valor === perfil)?.nome ?? perfil;
}

export function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth();
  const administrador = usuarioLogado?.perfil === "ADMIN";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("");
  const [situacao, setSituacao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuarioPermissoes, setUsuarioPermissoes] = useState<Usuario | null>(
    null,
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null,
  );
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const operacaoEmCurso = useRef(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await usuarioService.listar();
      setUsuarios(dados);
    } catch (error) {
      setErro(mensagemErro(error, "Não foi possível carregar os usuários."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarUsuarios();
  }, [carregarUsuarios]);

  const totalAtivos = usuarios.filter((usuario) => usuario.ativo).length;

  const administradoresAtivos = usuarios.filter(
    (usuario) => usuario.ativo && usuario.perfil === "ADMIN",
  ).length;

  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  const usuariosFiltrados = usuarios
    .filter((usuario) => {
      const correspondeBusca =
        !termo ||
        [usuario.nome, usuario.email].some((valor) =>
          valor.toLocaleLowerCase("pt-BR").includes(termo),
        );

      const correspondePerfil = !perfil || usuario.perfil === perfil;

      const correspondeSituacao =
        !situacao ||
        (situacao === "ATIVOS" && usuario.ativo) ||
        (situacao === "INATIVOS" && !usuario.ativo);

      return correspondeBusca && correspondePerfil && correspondeSituacao;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const ocupado = salvando || processandoId !== null;

  function abrirFormulario(usuario: Usuario | null) {
    if (!administrador || operacaoEmCurso.current) return;

    setUsuarioSelecionado(usuario);
    setErroModal("");
    setModalAberto(true);
  }

  function fecharFormulario() {
    if (operacaoEmCurso.current) return;

    setModalAberto(false);
    setUsuarioSelecionado(null);
    setErroModal("");
  }

  async function salvarUsuario(dados: CriarUsuarioDTO | AtualizarUsuarioDTO) {
    if (!administrador || operacaoEmCurso.current) return;

    operacaoEmCurso.current = true;
    setSalvando(true);
    setErroModal("");

    try {
      if (usuarioSelecionado) {
        const atualizado = await usuarioService.atualizar(
          usuarioSelecionado.id,
          dados as AtualizarUsuarioDTO,
        );

        setUsuarios((anteriores) =>
          anteriores.map((usuario) =>
            usuario.id === atualizado.id ? atualizado : usuario,
          ),
        );

        toast.success("Usuário atualizado com sucesso.");
      } else {
        const criado = await usuarioService.criar(dados as CriarUsuarioDTO);

        setUsuarios((anteriores) => [criado, ...anteriores]);
        toast.success("Usuário cadastrado com sucesso.");
      }

      setModalAberto(false);
      setUsuarioSelecionado(null);
    } catch (error) {
      setErroModal(mensagemErro(error, "Não foi possível salvar o usuário."));
    } finally {
      operacaoEmCurso.current = false;
      setSalvando(false);
    }
  }

  async function alterarStatus(usuario: Usuario) {
    if (!administrador || operacaoEmCurso.current) return;

    if (usuario.id === usuarioLogado?.id) {
      toast.error("Você não pode desativar a própria conta.");
      return;
    }

    const acao = usuario.ativo ? "desativar" : "ativar";

    if (!window.confirm(`Deseja ${acao} "${usuario.nome}"?`)) return;

    operacaoEmCurso.current = true;
    setProcessandoId(usuario.id);

    try {
      const atualizado = await usuarioService.alterarStatus(
        usuario.id,
        !usuario.ativo,
      );

      setUsuarios((anteriores) =>
        anteriores.map((item) =>
          item.id === atualizado.id ? atualizado : item,
        ),
      );

      toast.success(
        atualizado.ativo ? "Usuário ativado." : "Usuário desativado.",
      );
    } catch (error) {
      toast.error(mensagemErro(error, "Não foi possível alterar a situação."));
    } finally {
      operacaoEmCurso.current = false;
      setProcessandoId(null);
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    if (!administrador || operacaoEmCurso.current) return;

    if (usuario.id === usuarioLogado?.id) {
      toast.error("Você não pode excluir a própria conta.");
      return;
    }

    const confirmou = window.confirm(
      `Excluir "${usuario.nome}"?\n\nSe houver histórico vinculado, a exclusão será bloqueada. Nesse caso, desative a conta.`,
    );

    if (!confirmou) return;

    operacaoEmCurso.current = true;
    setProcessandoId(usuario.id);

    try {
      await usuarioService.excluir(usuario.id);

      setUsuarios((anteriores) =>
        anteriores.filter((item) => item.id !== usuario.id),
      );

      toast.success("Usuário excluído.");
    } catch (error) {
      toast.error(mensagemErro(error, "Não foi possível excluir o usuário."));
    } finally {
      operacaoEmCurso.current = false;
      setProcessandoId(null);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Users size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
              <p className="mt-1 text-sm text-slate-500">
                Gerencie as contas e o acesso ao sistema.
              </p>
            </div>
          </div>

          {administrador && (
            <button
              type="button"
              onClick={() => abrirFormulario(null)}
              disabled={ocupado || carregando}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              <Plus size={18} />
              Novo usuário
            </button>
          )}
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { nome: "Total", valor: usuarios.length },
            { nome: "Ativos", valor: totalAtivos },
            { nome: "Inativos", valor: usuarios.length - totalAtivos },
            { nome: "Administradores ativos", valor: administradoresAtivos },
          ].map((item) => (
            <div
              key={item.nome}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.nome}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {carregando || erro ? "—" : item.valor}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm text-slate-700">
              <span>Pesquisar</span>
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Nome ou e-mail"
                className={campoClasse}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Perfil</span>
              <select
                value={perfil}
                onChange={(event) => setPerfil(event.target.value)}
                className={campoClasse}
              >
                <option value="">Todos os perfis</option>
                {perfis.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Situação</span>
              <select
                value={situacao}
                onChange={(event) => setSituacao(event.target.value)}
                className={campoClasse}
              >
                <option value="">Todas</option>
                <option value="ATIVOS">Ativos</option>
                <option value="INATIVOS">Inativos</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-slate-500">
              {carregando
                ? "Carregando..."
                : erro
                  ? "Listagem indisponível."
                  : `${usuariosFiltrados.length} usuário(s) encontrado(s)`}
            </p>

            <button
              type="button"
              className={botaoClasse}
              disabled={!busca && !perfil && !situacao}
              onClick={() => {
                setBusca("");
                setPerfil("");
                setSituacao("");
              }}
            >
              <FilterX size={16} />
              Limpar filtros
            </button>
          </div>
        </div>

        {erro ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <p className="mb-3 text-sm text-red-700">{erro}</p>
            <button
              type="button"
              className={botaoClasse}
              onClick={() => void carregarUsuarios()}
              disabled={carregando || ocupado}
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        ) : carregando ? (
          <p className="py-10 text-center text-slate-500">
            Carregando usuários...
          </p>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4">Usuário</th>
                  <th className="px-5 py-4">Perfil</th>
                  <th className="px-5 py-4">Situação</th>
                  <th className="px-5 py-4">Cadastro</th>
                  {administrador && (
                    <th className="px-5 py-4 text-right">Ações</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.map((usuario) => {
                  const propriaConta = usuario.id === usuarioLogado?.id;
                  const ultimoAdmin =
                    usuario.perfil === "ADMIN" &&
                    usuario.ativo &&
                    administradoresAtivos === 1;

                  const protegido = propriaConta || ultimoAdmin;

                  return (
                    <tr key={usuario.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {usuario.nome}
                          {propriaConta && (
                            <span className="ml-2 text-xs font-normal text-blue-600">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-slate-500">{usuario.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {nomePerfil(usuario.perfil)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            usuario.ativo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}
                      </td>

                      {administrador && (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className={botaoClasse}
                              disabled={ocupado}
                              onClick={() => abrirFormulario(usuario)}
                              aria-label={`Editar ${usuario.nome}`}
                              title="Editar usuário"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className={botaoClasse}
                              disabled={ocupado || protegido}
                              onClick={() => void alterarStatus(usuario)}
                              aria-label={`${usuario.ativo ? "Desativar" : "Ativar"} ${usuario.nome}`}
                              title={
                                protegido
                                  ? "Sua conta ou último administrador ativo"
                                  : usuario.ativo
                                    ? "Desativar usuário"
                                    : "Ativar usuário"
                              }
                            >
                              <Power size={17} />
                            </button>

                            <button
                              type="button"
                              className={`${botaoClasse} text-red-600`}
                              disabled={ocupado || protegido}
                              onClick={() => void excluirUsuario(usuario)}
                              aria-label={`Excluir ${usuario.nome}`}
                              title={
                                protegido
                                  ? "Sua conta ou último administrador ativo"
                                  : "Excluir usuário"
                              }
                            >
                              <Trash2 size={17} />
                            </button>

                            <button
                              type="button"
                              className={botaoClasse}
                              disabled={ocupado}
                              onClick={() => setUsuarioPermissoes(usuario)}
                              aria-label={`Permissões de ${usuario.nome}`}
                              title="Configurar permissões"
                            >
                              <ShieldCheck size={17} />
                            </button>
                          </div>

                          {processandoId === usuario.id && (
                            <p
                              role="status"
                              className="mt-2 text-right text-xs text-slate-500"
                            >
                              Processando...
                            </p>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {administrador && (
          <UsuarioFormModal
            aberto={modalAberto}
            usuario={usuarioSelecionado}
            carregando={salvando}
            erro={erroModal}
            onFechar={fecharFormulario}
            onSalvar={salvarUsuario}
          />
        )}

        {administrador && usuarioPermissoes && (
          <UsuarioPermissoesModal
            key={usuarioPermissoes.id}
            usuario={usuarioPermissoes}
            onFechar={() => setUsuarioPermissoes(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
