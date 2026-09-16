import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";
import { MainLayout } from "../../layouts/MainLayout";

import { movimentacaoService } from "../../services/movimentacaoService";

import type {
  Movimentacao,
  MovimentacaoFilters,
  TipoMovimentacao,
} from "../../types/movimentacao";

interface FiltrosFormulario {
  equipamentoId: string;
  tipo: "" | TipoMovimentacao;
  dataInicio: string;
  dataFim: string;
}

interface AlteracaoMovimentacao {
  origem: string;
  destino: string;
}

const filtrosIniciais: FiltrosFormulario = {
  equipamentoId: "",
  tipo: "",
  dataInicio: "",
  dataFim: "",
};

const tiposMovimentacao: Array<{
  valor: TipoMovimentacao;
  texto: string;
}> = [
  {
    valor: "ENTREGA",
    texto: "Entrega",
  },
  {
    valor: "TROCA",
    texto: "Troca",
  },
  {
    valor: "DEVOLUCAO",
    texto: "Devolução",
  },
  {
    valor: "MUDANCA_SETOR",
    texto: "Mudança de setor",
  },
  {
    valor: "MUDANCA_LOCALIZACAO",
    texto: "Mudança de localização",
  },
  {
    valor: "ENTRADA_MANUTENCAO",
    texto: "Entrada em manutenção",
  },
  {
    valor: "RETORNO_MANUTENCAO",
    texto: "Retorno da manutenção",
  },
  {valor: "INSTALACAO_PECA", texto: "Instalação de peça"},
  {valor: "RETIRADA_PECA", texto: "Retirada de peça"},
  {
    valor: "BAIXA",
    texto: "Baixa",
  },
];

export function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  const [filtrosFormulario, setFiltrosFormulario] =
    useState<FiltrosFormulario>(filtrosIniciais);

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrosFormulario>(filtrosIniciais);

  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const carregarMovimentacoes = useCallback(async () => {
    try {
      setCarregando(true);

      const filtros: MovimentacaoFilters = {
        page: pagina,
        limit: 10,
      };

      if (filtrosAplicados.equipamentoId) {
        filtros.equipamentoId = Number(filtrosAplicados.equipamentoId);
      }

      if (filtrosAplicados.tipo) {
        filtros.tipo = filtrosAplicados.tipo;
      }

      if (filtrosAplicados.dataInicio) {
        filtros.dataInicio = `${filtrosAplicados.dataInicio}T00:00:00`;
      }

      if (filtrosAplicados.dataFim) {
        filtros.dataFim = `${filtrosAplicados.dataFim}T23:59:59.999`;
      }

      const resultado = await movimentacaoService.listar(filtros);

      setMovimentacoes(resultado.movimentacoes);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPages);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);

      toast.error("Não foi possível carregar as movimentações.");

      setMovimentacoes([]);
      setTotal(0);
      setTotalPaginas(0);
    } finally {
      setCarregando(false);
    }
  }, [filtrosAplicados, pagina]);

  useEffect(() => {
    void carregarMovimentacoes();
  }, [carregarMovimentacoes]);

  function aplicarFiltros(event: FormEvent) {
    event.preventDefault();

    if (filtrosFormulario.equipamentoId) {
      const equipamentoId = Number(filtrosFormulario.equipamentoId);

      if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
        toast.error("Informe um ID de equipamento válido.");

        return;
      }
    }

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

  function formatarData(data: string) {
    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "Data inválida";
    }

    return dataFormatada.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function textoTipo(tipo: TipoMovimentacao) {
    if (tipo === "INSTALACAO_PECA") return "Instalação de peça";
    if (tipo === "RETIRADA_PECA") return "Retirada de peça";
    return tiposMovimentacao.find((item) => item.valor === tipo)?.texto ?? tipo;
  }

  function classeTipo(tipo: TipoMovimentacao) {
    const classes: Record<TipoMovimentacao, string> = {
      ENTREGA: "bg-blue-100 text-blue-700",
      TROCA: "bg-violet-100 text-violet-700",
      DEVOLUCAO: "bg-cyan-100 text-cyan-700",
      MUDANCA_SETOR: "bg-indigo-100 text-indigo-700",
      MUDANCA_LOCALIZACAO: "bg-sky-100 text-sky-700",
      ENTRADA_MANUTENCAO: "bg-amber-100 text-amber-700",
      RETORNO_MANUTENCAO: "bg-emerald-100 text-emerald-700",
      INSTALACAO_PECA: "bg-blue-100 text-blue-700",
      RETIRADA_PECA: "bg-amber-100 text-amber-700",
      BAIXA: "bg-rose-100 text-rose-700",
    };

    return classes[tipo];
  }

  function obterAlteracao(movimentacao: Movimentacao): AlteracaoMovimentacao {
    switch (movimentacao.tipo) {
      case "ENTREGA":
        return {
          origem: movimentacao.responsavelAnterior?.nome ?? "Estoque",
          destino: movimentacao.responsavelNovo?.nome ?? "Não informado",
        };

      case "TROCA":
        return {
          origem: movimentacao.equipamento.nome,
          destino: movimentacao.equipamentoRelacionado?.nome ?? "Não informado",
        };

      case "DEVOLUCAO":
        return {
          origem: movimentacao.responsavelAnterior?.nome ?? "Não informado",
          destino: movimentacao.responsavelNovo?.nome ?? "Estoque",
        };

      case "MUDANCA_SETOR":
        return {
          origem: movimentacao.setorAnterior?.nome ?? "Não informado",
          destino: movimentacao.setorNovo?.nome ?? "Não informado",
        };

      case "MUDANCA_LOCALIZACAO":
        return {
          origem: movimentacao.localizacaoAnterior?.nome ?? "Não informado",
          destino: movimentacao.localizacaoNova?.nome ?? "Não informado",
        };

      default:
        return {
          origem: movimentacao.statusAnterior ?? "Não informado",
          destino: movimentacao.statusNovo ?? "Não informado",
        };
    }
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-3 text-slate-800">
            <History size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Movimentações</h1>

            <p className="text-sm text-slate-500">
              Consulte o histórico de movimentações dos equipamentos.
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <form
          className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5"
          onSubmit={aplicarFiltros}
        >
          <div>
            <label
              htmlFor="equipamentoId"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              ID do equipamento
            </label>

            <input
              id="equipamentoId"
              type="number"
              min="1"
              step="1"
              value={filtrosFormulario.equipamentoId}
              onChange={(event) =>
                setFiltrosFormulario((anterior) => ({
                  ...anterior,
                  equipamentoId: event.target.value,
                }))
              }
              placeholder="Ex.: 12"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="tipo"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tipo
            </label>

            <select
              id="tipo"
              value={filtrosFormulario.tipo}
              onChange={(event) =>
                setFiltrosFormulario((anterior) => ({
                  ...anterior,
                  tipo: event.target.value as FiltrosFormulario["tipo"],
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>

              {tiposMovimentacao.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.texto}
                </option>
              ))}
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
            Histórico de movimentações
          </h2>

          <p className="text-sm text-slate-500">
            {total}{" "}
            {total === 1
              ? "movimentação encontrada"
              : "movimentações encontradas"}
          </p>
        </div>

        {carregando ? (
          <div className="p-5">
            <Skeleton />
          </div>
        ) : movimentacoes.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <History size={42} className="mx-auto mb-3 text-slate-300" />

            <h3 className="font-semibold text-slate-700">
              Nenhuma movimentação encontrada
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Altere os filtros para consultar outro período.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Data e hora</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Equipamento</th>
                  <th className="px-5 py-3">Origem</th>
                  <th className="px-5 py-3">Destino</th>
                  <th className="px-5 py-3">Registrado por</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {movimentacoes.map((movimentacao) => {
                  const alteracao = obterAlteracao(movimentacao);

                  return (
                    <tr
                      key={movimentacao.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatarData(movimentacao.dataHora)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap  px-3 py-1 text-xs font-semibold ${classeTipo(
                            movimentacao.tipo,
                          )}`}
                        >
                          {textoTipo(movimentacao.tipo)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {movimentacao.equipamento.nome}
                        </p>

                        <p className="text-xs text-slate-500">
                          {movimentacao.equipamento.patrimonio ||
                            movimentacao.equipamento.numeroSerie ||
                            "Sem identificação"}
                        </p>

                        {movimentacao.observacoes && (
                          <p
                            className="mt-1 max-w-xs truncate text-xs text-slate-400"
                            title={movimentacao.observacoes}
                          >
                            {movimentacao.observacoes}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {alteracao.origem}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {alteracao.destino}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {movimentacao.usuario?.nome ?? "Sistema"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {movimentacao.usuario?.email ?? "Registro automático"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && totalPaginas > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Página {pagina} de {totalPaginas}
            </p>

            <div className="flex gap-2">
              <Button
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
    </MainLayout>
  );
}
