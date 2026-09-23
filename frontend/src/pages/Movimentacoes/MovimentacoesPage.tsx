import { type FormEvent, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
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
  { valor: "ENTREGA", texto: "Entrega" },
  { valor: "TROCA", texto: "Troca" },
  { valor: "DEVOLUCAO", texto: "Devolução" },
  { valor: "MUDANCA_SETOR", texto: "Mudança de setor" },
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
  { valor: "INSTALACAO_PECA", texto: "Instalação de peça" },
  { valor: "RETIRADA_PECA", texto: "Retirada de peça" },
  {
    valor: "ALTERACAO_CADASTRAL",
    texto: "Alteração cadastral",
  },
  { valor: "BAIXA", texto: "Baixa" },
];

const classesTipo: Record<TipoMovimentacao, string> = {
  ENTREGA: "bg-blue-100 text-blue-700",
  TROCA: "bg-violet-100 text-violet-700",
  DEVOLUCAO: "bg-cyan-100 text-cyan-700",
  MUDANCA_SETOR: "bg-indigo-100 text-indigo-700",
  MUDANCA_LOCALIZACAO: "bg-sky-100 text-sky-700",
  ENTRADA_MANUTENCAO: "bg-amber-100 text-amber-700",
  RETORNO_MANUTENCAO: "bg-emerald-100 text-emerald-700",
  INSTALACAO_PECA: "bg-blue-100 text-blue-700",
  RETIRADA_PECA: "bg-amber-100 text-amber-700",
  ALTERACAO_CADASTRAL: "bg-orange-100 text-orange-700",
  BAIXA: "bg-rose-100 text-rose-700",
};

const classeCampo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function formatarData(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data inválida";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function textoTipo(tipo: TipoMovimentacao) {
  return tiposMovimentacao.find((item) => item.valor === tipo)?.texto ?? tipo;
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
        origem:
          movimentacao.equipamento?.nome ??
          `Equipamento #${movimentacao.equipamentoId}`,
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
        origem: movimentacao.statusAnterior ?? "—",
        destino: movimentacao.statusNovo ?? "—",
      };
  }
}

export function MovimentacoesPage() {
  const { carregando, carregandoPermissoes, temTodasPermissoes } = useAuth();

  if (carregando || carregandoPermissoes) {
    return (
      <MainLayout>
        <Skeleton />
      </MainLayout>
    );
  }

  if (!temTodasPermissoes("movimentacoes.visualizar")) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <History size={36} className="mx-auto mb-3 text-slate-400" />

          <h1 className="text-xl font-semibold text-slate-900">
            Acesso não permitido
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Você não possui permissão para visualizar movimentações.
          </p>
        </Card>
      </MainLayout>
    );
  }

  return <ConteudoMovimentacoes />;
}

function ConteudoMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  const [filtrosFormulario, setFiltrosFormulario] =
    useState<FiltrosFormulario>(filtrosIniciais);

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrosFormulario>(filtrosIniciais);

  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarMovimentacoes() {
      setCarregando(true);
      setErro("");

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

      try {
        const resultado = await movimentacaoService.listar(filtros);

        if (!ativo) return;

        if (resultado.totalPages > 0 && pagina > resultado.totalPages) {
          setPagina(resultado.totalPages);
          return;
        }

        setMovimentacoes(resultado.movimentacoes);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPages);
      } catch (error) {
        if (!ativo) return;

        console.error("Erro ao carregar movimentações:", error);

        setMovimentacoes([]);
        setTotal(0);
        setTotalPaginas(0);
        setErro("Não foi possível carregar as movimentações.");
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarMovimentacoes();

    return () => {
      ativo = false;
    };
  }, [filtrosAplicados, pagina, tentativa]);

  function aplicarFiltros(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const equipamentoIdTexto = filtrosFormulario.equipamentoId.trim();

    if (equipamentoIdTexto) {
      const equipamentoId = Number(equipamentoIdTexto);

      if (!Number.isSafeInteger(equipamentoId) || equipamentoId <= 0) {
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
      equipamentoId: equipamentoIdTexto,
    });
  }

  function limparFiltros() {
    setPagina(1);
    setFiltrosFormulario({ ...filtrosIniciais });
    setFiltrosAplicados({ ...filtrosIniciais });
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
              className={classeCampo}
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
              className={classeCampo}
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
              className={classeCampo}
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
              className={classeCampo}
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
        ) : erro ? (
          <div className="space-y-4 px-5 py-10 text-center">
            <p className="text-sm text-red-600">{erro}</p>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setTentativa((anterior) => anterior + 1)}
            >
              <RotateCcw size={18} />
              Tentar novamente
            </Button>
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
              <caption className="sr-only">
                Histórico de movimentações dos equipamentos
              </caption>

              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Data e hora
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Tipo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Equipamento
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Origem
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Destino
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Registrado por
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {movimentacoes.map((movimentacao) => {
                  const alteracao = obterAlteracao(movimentacao);

                  const classe =
                    classesTipo[movimentacao.tipo] ??
                    "bg-slate-100 text-slate-700";

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
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${classe}`}
                        >
                          {textoTipo(movimentacao.tipo)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {movimentacao.equipamento?.nome ??
                            `Equipamento #${movimentacao.equipamentoId}`}
                        </p>

                        <p className="text-xs text-slate-500">
                          {movimentacao.equipamento?.patrimonio ||
                            movimentacao.equipamento?.numeroSerie ||
                            "Sem identificação"}
                        </p>

                        {movimentacao.observacoes && (
                          <details className="mt-2 max-w-sm text-xs text-slate-500">
                            <summary className="cursor-pointer font-medium text-slate-600">
                              Observações
                            </summary>

                            <p className="mt-2 whitespace-pre-wrap break-words">
                              {movimentacao.observacoes}
                            </p>
                          </details>
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
                          {movimentacao.usuario?.email ??
                            "Usuário não informado"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && !erro && totalPaginas > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Página {pagina} de {totalPaginas}
            </p>

            <div className="flex gap-2">
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
    </MainLayout>
  );
}
