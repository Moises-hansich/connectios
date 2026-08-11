import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Wrench,
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

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
            <Wrench size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manutenções</h1>

            <p className="text-sm text-slate-500">
              Acompanhe o histórico de manutenção dos equipamentos.
            </p>
          </div>
        </div>
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
