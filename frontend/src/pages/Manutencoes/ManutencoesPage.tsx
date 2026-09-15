import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";

import { manutencaoService } from "../../services/manutencaoService";
import {
  ManutencaoTable,
  FinalizarManutencaoModal,
  DetalhesManutencaoModal,
} from "../../components/Manutencoes";
import type { Manutencao, StatusManutencao } from "../../types/manutencao";
import { equipamentoService } from "../../services/equipamentoService";
import type { Equipamento } from "../../types/equipamento";

import { AbrirManutencaoModal } from "../../components/Manutencoes/AbrirManutencaoModal";
interface FiltrosFormulario {
  status: "" | StatusManutencao;
  dataInicio: string;
  dataFim: string;
}

const filtrosIniciais: FiltrosFormulario = {
  status: "",
  dataInicio: "",
  dataFim: "",
};

export function ManutencoesPage() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  const [filtrosFormulario, setFiltrosFormulario] =
    useState<FiltrosFormulario>(filtrosIniciais);

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrosFormulario>(filtrosIniciais);
  const [selecaoEquipamentoAberta, setSelecaoEquipamentoAberta] =
    useState(false);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(false);
  const [erroEquipamentos, setErroEquipamentos] = useState(false);
  const [equipamentoIdSelecionado, setEquipamentoIdSelecionado] = useState("");

  const [equipamentoCadastro, setEquipamentoCadastro] =
    useState<Equipamento | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [manutencaoFinalizacao, setManutencaoFinalizacao] =
    useState<Manutencao | null>(null);
  const [manutencaoDetalhes, setManutencaoDetalhes] =
    useState<Manutencao | null>(null);
  const carregarManutencoes = useCallback(async () => {
    try {
      await Promise.resolve();
      setCarregando(true);

      const resultado = await manutencaoService.listar({
        status: filtrosAplicados.status || undefined,

        dataInicio: filtrosAplicados.dataInicio
          ? `${filtrosAplicados.dataInicio}T00:00:00`
          : undefined,

        dataFim: filtrosAplicados.dataFim
          ? `${filtrosAplicados.dataFim}T23:59:59.999`
          : undefined,

        page: pagina,
        limit: 10,
      });

      setManutencoes(resultado.manutencoes);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPages);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);

      toast.error("Não foi possível carregar as manutenções.");

      setManutencoes([]);
      setTotal(0);
      setTotalPaginas(0);
    } finally {
      setCarregando(false);
    }
  }, [filtrosAplicados, pagina]);

  useEffect(() => {
    void carregarManutencoes();
  }, [carregarManutencoes]);

  function aplicarFiltros(event: FormEvent) {
    event.preventDefault();

    if (
      filtrosFormulario.dataInicio &&
      filtrosFormulario.dataFim &&
      filtrosFormulario.dataInicio > filtrosFormulario.dataFim
    ) {
      toast.error("A data inicial não pode ser posterior à data final.");

      return;
    }

    setPagina(1);
    setFiltrosAplicados({
      ...filtrosFormulario,
    });
  }

  function limparFiltros() {
    setPagina(1);
    setFiltrosFormulario(filtrosIniciais);
    setFiltrosAplicados(filtrosIniciais);
  }

  function abrirModalFinalizacao(manutencao: Manutencao) {
    setManutencaoFinalizacao(manutencao);
  }

  function fecharModalFinalizacao() {
    setManutencaoFinalizacao(null);
  }
  function abrirModalDetalhes(manutencao: Manutencao) {
    setManutencaoDetalhes(manutencao);
  }

  function fecharModalDetalhes() {
    setManutencaoDetalhes(null);
  }
  useEffect(() => {
    if (!selecaoEquipamentoAberta) {
      return;
    }

    let ativo = true;

    async function carregarEquipamentos() {
      try {
        setCarregandoEquipamentos(true);
        setErroEquipamentos(false);

        const dados = await equipamentoService.listar();

        if (ativo) {
          setEquipamentos(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);

        if (ativo) {
          setEquipamentos([]);
          setErroEquipamentos(true);
          toast.error("Não foi possível carregar os equipamentos.");
        }
      } finally {
        if (ativo) {
          setCarregandoEquipamentos(false);
        }
      }
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelecaoEquipamentoAberta(false);
      }
    }

    void carregarEquipamentos();
    window.addEventListener("keydown", fecharComEscape);

    return () => {
      ativo = false;
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [selecaoEquipamentoAberta]);

  function abrirCadastroManutencao() {
    setEquipamentoIdSelecionado("");
    setEquipamentos([]);
    setErroEquipamentos(false);
    setCarregandoEquipamentos(true);
    setSelecaoEquipamentoAberta(true);
  }

  function continuarCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const equipamento = equipamentos.find(
      (item) => item.id === Number(equipamentoIdSelecionado),
    );

    if (!equipamento) {
      toast.error("Selecione um equipamento.");
      return;
    }

    setSelecaoEquipamentoAberta(false);
    setEquipamentoCadastro(equipamento);
  }

  function fecharCadastroManutencao() {
    setEquipamentoCadastro(null);
  }

  async function finalizarCadastroManutencao() {
    await carregarManutencoes();
  }
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-3 text-slate-800">
            <Wrench size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manutenções</h1>

            <p className="text-sm text-slate-500">
              Acompanhe o histórico de manutenção dos equipamentos.
            </p>
          </div>
        </div>

        <Button type="button" onClick={abrirCadastroManutencao}>
          <Plus size={18} />
          Cadastrar manutenção
        </Button>
      </div>

      <Card className="mb-6">
        <form
          className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4"
          onSubmit={aplicarFiltros}
        >
          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="status"
              value={filtrosFormulario.status}
              onChange={(event) =>
                setFiltrosFormulario((anterior) => ({
                  ...anterior,
                  status: event.target.value as FiltrosFormulario["status"],
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dataInicio"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Data inicial
            </label>

            <input
              id="dataInicio"
              type="date"
              value={filtrosFormulario.dataInicio}
              onChange={(event) =>
                setFiltrosFormulario((anterior) => ({
                  ...anterior,
                  dataInicio: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="dataFim"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Data final
            </label>

            <input
              id="dataFim"
              type="date"
              value={filtrosFormulario.dataFim}
              onChange={(event) =>
                setFiltrosFormulario((anterior) => ({
                  ...anterior,
                  dataFim: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit">
              <Search size={18} />
              Filtrar
            </Button>

            <Button type="button" variant="secondary" onClick={limparFiltros}>
              <RotateCcw size={18} />
              Limpar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Histórico de manutenções
          </h2>

          <p className="text-sm text-slate-500">
            {total}{" "}
            {total === 1 ? "manutenção encontrada" : "manutenções encontradas"}
          </p>
        </div>

        {carregando ? (
          <div className="p-5">
            <Skeleton />
          </div>
        ) : (
          <ManutencaoTable
            manutencoes={manutencoes}
            onDetalhes={abrirModalDetalhes}
            onFinalizar={abrirModalFinalizacao}
          />
        )}

        {!carregando && totalPaginas > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Página {pagina} de {totalPaginas}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                type="button"
                variant="secondary"
                disabled={pagina <= 1}
                onClick={() =>
                  setPagina((anterior) => Math.max(1, anterior - 1))
                }
              >
                <ChevronLeft size={18} />
                Anterior
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={pagina >= totalPaginas}
                onClick={() =>
                  setPagina((anterior) => Math.min(totalPaginas, anterior + 1))
                }
              >
                Próxima
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {selecaoEquipamentoAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelecaoEquipamentoAberta(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-selecionar-equipamento"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2
                  id="titulo-selecionar-equipamento"
                  className="text-lg font-semibold text-slate-900"
                >
                  Cadastrar manutenção
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selecione o equipamento que receberá a manutenção.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelecaoEquipamentoAberta(false)}
                aria-label="Fechar seleção de equipamento"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={continuarCadastro}>
              <div className="p-5">
                <label
                  htmlFor="equipamento-manutencao"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Equipamento *
                </label>

                <select
                  id="equipamento-manutencao"
                  autoFocus
                  required
                  value={equipamentoIdSelecionado}
                  disabled={carregandoEquipamentos || erroEquipamentos}
                  onChange={(event) =>
                    setEquipamentoIdSelecionado(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {carregandoEquipamentos
                      ? "Carregando equipamentos..."
                      : "Selecione um equipamento"}
                  </option>

                  {equipamentos.map((equipamento) => (
                    <option key={equipamento.id} value={equipamento.id}>
                      {equipamento.nome}
                      {equipamento.patrimonio
                        ? ` — ${equipamento.patrimonio}`
                        : ` — ID ${equipamento.id}`}
                    </option>
                  ))}
                </select>

                {erroEquipamentos && (
                  <p className="mt-2 text-sm text-red-600">
                    Não foi possível carregar os equipamentos. Feche e abra
                    novamente para tentar outra vez.
                  </p>
                )}

                {!carregandoEquipamentos &&
                  !erroEquipamentos &&
                  equipamentos.length === 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      Nenhum equipamento encontrado.
                    </p>
                  )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelecaoEquipamentoAberta(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={
                    carregandoEquipamentos ||
                    erroEquipamentos ||
                    !equipamentoIdSelecionado
                  }
                >
                  Continuar
                  <ChevronRight size={18} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {equipamentoCadastro && (
        <AbrirManutencaoModal
          aberto
          equipamento={equipamentoCadastro}
          onFechar={fecharCadastroManutencao}
          onSucesso={finalizarCadastroManutencao}
        />
      )}

      <FinalizarManutencaoModal
        aberto={manutencaoFinalizacao !== null}
        manutencao={manutencaoFinalizacao}
        onFechar={fecharModalFinalizacao}
        onSucesso={carregarManutencoes}
      />

      <DetalhesManutencaoModal
        aberto={manutencaoDetalhes !== null}
        manutencao={manutencaoDetalhes}
        onFechar={fecharModalDetalhes}
      />
    </MainLayout>
  );
}
