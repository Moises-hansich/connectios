import { useState } from "react";
import { Monitor, Plus, Search, Trash2, User, Users } from "lucide-react";
import { toast } from "sonner";

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

export function LocalizacoesPage() {
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

  const [modalColaboradoresAberto, setModalColaboradoresAberto] =
    useState(false);

  const [localizacaoColaboradores, setLocalizacaoColaboradores] =
    useState<Localizacao | null>(null);

  const [colaboradores, setColaboradores] = useState<ColaboradorLocalizacao[]>(
    [],
  );

  const [carregandoColaboradores, setCarregandoColaboradores] = useState(false);

  async function salvarLocalizacao(dados: LocalizacaoFormData): Promise<void> {
    try {
      if (localizacaoSelecionada) {
        await atualizarLocalizacao(localizacaoSelecionada.id, dados);

        toast.success("Localização atualizada com sucesso.");
        fecharModal();
        return;
      }

      await criarLocalizacao(dados);

      toast.success("Localização cadastrada com sucesso.");
      fecharModal();
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao salvar a localização.";

      toast.error(mensagem);
    }
  }

  async function confirmarExclusao(): Promise<void> {
    if (!localizacaoExcluir) {
      return;
    }

    try {
      await excluirLocalizacao(localizacaoExcluir.id);

      toast.success("Localização excluída com sucesso.");
      fecharModalExclusao();
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao excluir a localização.";

      toast.error(mensagem);
    }
  }

  async function abrirColaboradores(localizacao: Localizacao): Promise<void> {
    setLocalizacaoColaboradores(localizacao);
    setColaboradores([]);
    setModalColaboradoresAberto(true);
    setCarregandoColaboradores(true);

    try {
      const resultado = await localizacaoService.listarColaboradores(
        localizacao.id,
      );

      setColaboradores(resultado.colaboradores);
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Erro ao buscar os colaboradores.";

      toast.error(mensagem);
    } finally {
      setCarregandoColaboradores(false);
    }
  }

  function fecharModalColaboradores(): void {
    setModalColaboradoresAberto(false);
    setLocalizacaoColaboradores(null);
    setColaboradores([]);
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

          <button
            type="button"
            onClick={abrirModalCriacao}
            className="
              inline-flex items-center justify-center gap-2
              rounded-lg bg-slate-900 px-4 py-2.5
              font-medium text-white transition
              hover:bg-slate-700
            "
          >
            <Plus size={18} />
            Nova localização
          </button>
        </div>

        <div className="relative max-w-md">
          <Search
            size={18}
            className="
              pointer-events-none absolute left-3 top-1/2
              -translate-y-1/2 text-slate-400
            "
          />

          <input
            type="search"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar localização..."
            className="
              w-full rounded-lg border border-slate-300
              bg-white py-2.5 pl-10 pr-4
              text-sm text-slate-900 outline-none transition
              placeholder:text-slate-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            "
          />
        </div>

        {carregando ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Carregando localizações...</p>
          </div>
        ) : (
          <LocalizacaoTable
            localizacoes={localizacoesFiltradas}
            onEditar={abrirModalEdicao}
            onExcluir={abrirModalExclusao}
            onVerColaboradores={abrirColaboradores}
          />
        )}

        <Modal
          aberto={modalAberto}
          titulo={
            localizacaoSelecionada ? "Editar localização" : "Nova localização"
          }
          onClose={fecharModal}
          tamanho="sm"
        >
          <LocalizacaoForm
            localizacao={localizacaoSelecionada}
            onCancelar={fecharModal}
            onSalvar={salvarLocalizacao}
          />
        </Modal>

        <Modal
          aberto={modalExcluirAberto}
          titulo="Excluir localização"
          onClose={fecharModalExclusao}
          tamanho="sm"
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div
                className="
                  mb-4 flex h-14 w-14 items-center justify-center
                  rounded-full bg-red-100 text-red-600
                "
              >
                <Trash2 size={26} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Confirmar exclusão
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tem certeza de que deseja excluir a localização{" "}
                <strong className="font-semibold text-slate-700">
                  {localizacaoExcluir?.nome}
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
                onClick={fecharModalExclusao}
                className="
                  rounded-lg border border-slate-300
                  px-4 py-2.5 font-medium text-slate-700
                  transition hover:bg-slate-100
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-lg bg-red-600 px-4 py-2.5
                  font-medium text-white transition
                  hover:bg-red-700
                "
              >
                <Trash2 size={17} />
                Excluir localização
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          aberto={modalColaboradoresAberto}
          titulo={`Colaboradores — ${
            localizacaoColaboradores?.nome ?? "Localização"
          }`}
          onClose={fecharModalColaboradores}
          tamanho="sm"
        >
          {carregandoColaboradores ? (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-slate-500">
                Carregando colaboradores...
              </p>
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
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate font-semibold text-slate-900">
                          {colaborador.nome}
                        </p>

                        {colaborador.ips.length > 0 && (
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {colaborador.ips.map((ip) => {
                              const estaOnline = colaborador.equipamentos.some(
                                (equipamento) =>
                                  equipamento.ips.includes(ip) &&
                                  equipamento.online === true,
                              );

                              return (
                                <span
                                  key={ip}
                                  title={
                                    estaOnline
                                      ? "Computador disponível no Zabbix"
                                      : "Computador indisponível no Zabbix"
                                  }
                                  className={`
                  inline-flex items-center gap-1.5
                  rounded-full px-2 py-1
                  font-mono text-xs font-medium
                  ${
                    estaOnline
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }
                `}
                                >
                                  <span
                                    className={`
                    h-2 w-2 rounded-full
                    ${estaOnline ? "bg-emerald-500" : "bg-red-500"}
                  `}
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
                        <p className="mt-1 truncate text-sm text-slate-500">
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
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Monitor size={16} className="text-slate-500" />

                              <span className="text-sm text-slate-700">
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
      </div>
    </MainLayout>
  );
}
