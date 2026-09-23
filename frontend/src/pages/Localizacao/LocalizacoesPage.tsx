import { useEffect, useRef, useState } from "react";
import { Monitor, Plus, Search, Trash2, User, Users } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { MainLayout } from "../../layouts/MainLayout";
import { Modal } from "../../components/Modal";
import { LocalizacaoForm } from "../../components/LocalizacaoForm";
import { LocalizacaoTable } from "../../components/LocalizacaoTable";

import {
  localizacaoService,
  type ColaboradorLocalizacao,
  type Localizacao,
} from "../../services/localizacaoService";

import {
  useLocalizacoes,
  type LocalizacaoFormData,
} from "../../hooks/useLocalizacoes";

interface PermissoesLocalizacoes {
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
  podeVerColaboradores: boolean;
}

export function LocalizacoesPage() {
  const { carregando, carregandoPermissoes, temTodasPermissoes } = useAuth();

  if (carregando || carregandoPermissoes) {
    return (
      <MainLayout>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">Verificando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  if (!temTodasPermissoes("localizacoes.visualizar")) {
    return (
      <MainLayout>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Acesso não permitido
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Você não possui permissão para visualizar localizações.
          </p>
        </div>
      </MainLayout>
    );
  }

  const podeCriar = temTodasPermissoes(
    "localizacoes.visualizar",
    "localizacoes.criar",
  );

  const podeEditar = temTodasPermissoes(
    "localizacoes.visualizar",
    "localizacoes.editar",
  );

  const podeExcluir = temTodasPermissoes(
    "localizacoes.visualizar",
    "localizacoes.excluir",
  );

  const podeVerColaboradores = temTodasPermissoes(
    "localizacoes.visualizar",
    "colaboradores.visualizar",
    "equipamentos.visualizar",
    "zabbix.visualizar",
  );

  return (
    <ConteudoLocalizacoes
      key={`${podeCriar}-${podeEditar}-${podeExcluir}-${podeVerColaboradores}`}
      podeCriar={podeCriar}
      podeEditar={podeEditar}
      podeExcluir={podeExcluir}
      podeVerColaboradores={podeVerColaboradores}
    />
  );
}

function ConteudoLocalizacoes({
  podeCriar,
  podeEditar,
  podeExcluir,
  podeVerColaboradores,
}: PermissoesLocalizacoes) {
  const {
    localizacoesFiltradas,
    carregando,

    pesquisa,
    setPesquisa,

    modalAberto,
    modalExcluirAberto,

    localizacaoSelecionada,
    localizacaoExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,

    criarLocalizacao,
    atualizarLocalizacao,
    excluirLocalizacao,
  } = useLocalizacoes();

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const salvandoRef = useRef(false);
  const excluindoRef = useRef(false);
  const montadoRef = useRef(false);

  const [localizacaoColaboradores, setLocalizacaoColaboradores] =
    useState<Localizacao | null>(null);

  const [colaboradores, setColaboradores] = useState<ColaboradorLocalizacao[]>(
    [],
  );

  const [carregandoColaboradores, setCarregandoColaboradores] = useState(false);

  const [erroColaboradores, setErroColaboradores] = useState("");
  const [tentativaColaboradores, setTentativaColaboradores] = useState(0);

  const podeUsarFormulario = localizacaoSelecionada ? podeEditar : podeCriar;

  const localizacaoConsultaId = localizacaoColaboradores?.id;

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!podeVerColaboradores || localizacaoConsultaId === undefined) {
      return;
    }

    let ativo = true;
    const id = localizacaoConsultaId;

    async function carregarColaboradores() {
      setCarregandoColaboradores(true);
      setErroColaboradores("");
      setColaboradores([]);

      try {
        const resultado = await localizacaoService.listarColaboradores(id);

        if (ativo) {
          setColaboradores(resultado.colaboradores);
        }
      } catch (erro) {
        if (!ativo) return;

        console.error("Erro ao buscar colaboradores:", erro);

        setErroColaboradores(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar os colaboradores.",
        );
      } finally {
        if (ativo) {
          setCarregandoColaboradores(false);
        }
      }
    }

    void carregarColaboradores();

    return () => {
      ativo = false;
    };
  }, [localizacaoConsultaId, podeVerColaboradores, tentativaColaboradores]);

  function abrirCriacao() {
    if (!podeCriar) return;

    abrirModalCriacao();
  }

  function abrirEdicao(localizacao: Localizacao) {
    if (!podeEditar) return;

    abrirModalEdicao(localizacao);
  }

  function abrirExclusao(localizacao: Localizacao) {
    if (!podeExcluir) return;

    abrirModalExclusao(localizacao);
  }

  function fecharFormulario() {
    if (salvandoRef.current) return;

    fecharModal();
  }

  function fecharExclusao() {
    if (excluindoRef.current) return;

    fecharModalExclusao();
  }

  async function salvarLocalizacao(dados: LocalizacaoFormData): Promise<void> {
    if (!podeUsarFormulario || salvandoRef.current) return;

    salvandoRef.current = true;
    setSalvando(true);

    try {
      if (localizacaoSelecionada) {
        await atualizarLocalizacao(localizacaoSelecionada.id, dados);

        if (!montadoRef.current) return;

        toast.success("Localização atualizada com sucesso.");
      } else {
        await criarLocalizacao(dados);

        if (!montadoRef.current) return;

        toast.success("Localização cadastrada com sucesso.");
      }

      fecharModal();
    } catch (erro) {
      if (montadoRef.current) {
        toast.error(
          erro instanceof Error
            ? erro.message
            : "Ocorreu um erro ao salvar a localização.",
        );
      }
    } finally {
      salvandoRef.current = false;

      if (montadoRef.current) {
        setSalvando(false);
      }
    }
  }

  async function confirmarExclusao(): Promise<void> {
    if (!podeExcluir || !localizacaoExcluir || excluindoRef.current) {
      return;
    }

    excluindoRef.current = true;
    setExcluindo(true);

    try {
      await excluirLocalizacao(localizacaoExcluir.id);

      if (!montadoRef.current) return;

      toast.success("Localização excluída com sucesso.");
      fecharModalExclusao();
    } catch (erro) {
      if (montadoRef.current) {
        toast.error(
          erro instanceof Error
            ? erro.message
            : "Ocorreu um erro ao excluir a localização.",
        );
      }
    } finally {
      excluindoRef.current = false;

      if (montadoRef.current) {
        setExcluindo(false);
      }
    }
  }

  async function abrirColaboradores(localizacao: Localizacao): Promise<void> {
    if (!podeVerColaboradores) return;

    setColaboradores([]);
    setErroColaboradores("");
    setCarregandoColaboradores(true);
    setLocalizacaoColaboradores(localizacao);
  }

  function fecharModalColaboradores() {
    setLocalizacaoColaboradores(null);
    setColaboradores([]);
    setErroColaboradores("");
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Localizações</h1>

            <p className="mt-1 text-slate-500">
              Gerencie os locais onde os equipamentos estão instalados.
            </p>
          </div>

          {podeCriar && (
            <button
              type="button"
              onClick={abrirCriacao}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={18} />
              Nova localização
            </button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            aria-label="Pesquisar localização"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar localização..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {carregando ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Carregando localizações...</p>
          </div>
        ) : (
          <LocalizacaoTable
            localizacoes={localizacoesFiltradas}
            onEditar={abrirEdicao}
            onExcluir={abrirExclusao}
            onVerColaboradores={abrirColaboradores}
          />
        )}

        {modalAberto && podeUsarFormulario && (
          <Modal
            aberto
            titulo={
              localizacaoSelecionada ? "Editar localização" : "Nova localização"
            }
            onClose={fecharFormulario}
            tamanho="sm"
          >
            <fieldset
              disabled={salvando}
              aria-busy={salvando}
              className="min-w-0"
            >
              <LocalizacaoForm
                localizacao={localizacaoSelecionada}
                onCancelar={fecharFormulario}
                onSalvar={salvarLocalizacao}
              />
            </fieldset>

            {salvando && (
              <p role="status" className="mt-3 text-sm text-slate-500">
                Salvando localização...
              </p>
            )}
          </Modal>
        )}

        {modalExcluirAberto && podeExcluir && localizacaoExcluir && (
          <Modal
            aberto
            titulo="Excluir localização"
            onClose={fecharExclusao}
            tamanho="sm"
          >
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={26} />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Confirmar exclusão
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Tem certeza de que deseja excluir a localização{" "}
                  <strong className="font-semibold text-slate-700">
                    {localizacaoExcluir.nome}
                  </strong>
                  ?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Essa ação não poderá ser desfeita.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={fecharExclusao}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => void confirmarExclusao()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={17} />
                  {excluindo ? "Excluindo..." : "Excluir localização"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {podeVerColaboradores && localizacaoColaboradores && (
          <Modal
            aberto
            titulo={`Colaboradores — ${localizacaoColaboradores.nome}`}
            onClose={fecharModalColaboradores}
            tamanho="sm"
          >
            {carregandoColaboradores ? (
              <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-slate-500">
                  Carregando colaboradores...
                </p>
              </div>
            ) : erroColaboradores ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-sm text-red-600">{erroColaboradores}</p>

                <button
                  type="button"
                  onClick={() =>
                    setTentativaColaboradores((valor) => valor + 1)
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Tentar novamente
                </button>
              </div>
            ) : colaboradores.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Users size={26} />
                </div>

                <h3 className="font-semibold text-slate-900">
                  Nenhum colaborador encontrado
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Nenhum colaborador ativo está registrado nesta localização.
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {colaboradores.map((colaborador) => (
                  <div
                    key={colaborador.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <User size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="min-w-0 break-words font-semibold text-slate-900">
                            {colaborador.nome}
                          </p>

                          {(colaborador.ips?.length ?? 0) > 0 && (
                            <div className="flex flex-col items-end gap-1">
                              {colaborador.ips.map((ip) => {
                                const equipamentosDoIp =
                                  colaborador.equipamentos.filter(
                                    (equipamento) =>
                                      equipamento.ips?.includes(ip),
                                  );

                                const online = equipamentosDoIp.some(
                                  (equipamento) => equipamento.online === true,
                                );

                                const offline =
                                  equipamentosDoIp.length > 0 &&
                                  equipamentosDoIp.every(
                                    (equipamento) =>
                                      equipamento.online === false,
                                  );

                                const classe = online
                                  ? "bg-emerald-50 text-emerald-700"
                                  : offline
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600";

                                const classeIndicador = online
                                  ? "bg-emerald-500"
                                  : offline
                                    ? "bg-red-500"
                                    : "bg-slate-400";

                                const descricao = online
                                  ? "Computador disponível no Zabbix"
                                  : offline
                                    ? "Computador indisponível no Zabbix"
                                    : "Disponibilidade não informada";

                                return (
                                  <span
                                    key={ip}
                                    title={descricao}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-xs font-medium ${classe}`}
                                  >
                                    <span
                                      className={`h-2 w-2 rounded-full ${classeIndicador}`}
                                    />
                                    {ip}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-slate-500">
                          {colaborador.cargo || "Cargo não informado"}
                        </p>

                        {colaborador.email && (
                          <p className="mt-1 break-words text-sm text-slate-500">
                            {colaborador.email}
                          </p>
                        )}

                        {colaborador.setor && (
                          <p className="mt-1 text-xs text-slate-400">
                            Setor: {colaborador.setor.nome}
                          </p>
                        )}
                      </div>
                    </div>

                    {colaborador.equipamentos.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Equipamentos
                        </p>

                        <div className="space-y-2">
                          {colaborador.equipamentos.map((equipamento) => (
                            <div
                              key={equipamento.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Monitor
                                  size={16}
                                  className="shrink-0 text-slate-500"
                                />

                                <span className="break-words text-sm text-slate-700">
                                  {equipamento.nome}
                                </span>
                              </div>

                              <span className="text-xs text-slate-500">
                                {equipamento.patrimonio || equipamento.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
