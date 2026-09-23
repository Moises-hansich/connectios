import { useMemo, useState } from "react";
import {
  Boxes,
  Cpu,
  FilterX,
  Monitor,
  Mouse,
  Package,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SearchInput } from "../../components/SearchInput";
import { EquipmentTable } from "../../components/EquipmentTable";
import { EquipmentForm } from "../../components/EquipamentForm";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { SkeletonTable } from "../../components/Skeleton";
import { Select } from "../../components/Select";
import { AbrirManutencaoModal } from "../../components/Manutencoes";
import { PecasModal } from "../../components/Pecas/PecasModal";

import { useAuth } from "../../hooks/useAuth";
import { useEquipamentos } from "../../hooks/useEquipamentos";

import {
  obterGrupo,
  normalizarTexto,
  type GrupoCategoria,
} from "../../utils/grupoEquipamento";

import type { Equipamento } from "../../types/equipamento";

type Grupo = "TODOS" | GrupoCategoria;

type SituacaoPeca = "TODAS" | "RESERVA" | "INSTALADAS" | "DEFEITO";

interface OperacaoPeca {
  computadorId?: number;
  pecaId?: number;
  retiradaId?: number;
}

const grupos: {
  id: Grupo;
  nome: string;
  icone: typeof Boxes;
}[] = [
  { id: "TODOS", nome: "Todos", icone: Boxes },
  { id: "COMPUTADORES", nome: "Computadores", icone: Monitor },
  { id: "PERIFERICOS", nome: "Periféricos", icone: Mouse },
  { id: "PECAS", nome: "Peças", icone: Cpu },
  { id: "OUTROS", nome: "Outros", icone: Package },
];

const filtrosPecas: {
  id: SituacaoPeca;
  nome: string;
}[] = [
  { id: "TODAS", nome: "Todas as peças" },
  { id: "RESERVA", nome: "Reserva" },
  { id: "INSTALADAS", nome: "Instaladas" },
  { id: "DEFEITO", nome: "Com defeito" },
];

function correspondeSituacaoPeca(
  equipamento: Equipamento,
  situacao: SituacaoPeca,
): boolean {
  const instalada = equipamento.instaladoEmId != null;
  const status = normalizarTexto(equipamento.status);

  switch (situacao) {
    case "TODAS":
      return true;

    case "RESERVA":
      return (
        !instalada &&
        status === "disponivel" &&
        equipamento.responsavelId == null
      );

    case "INSTALADAS":
      return instalada;

    case "DEFEITO":
      return !instalada && status === "com defeito";
  }
}

export function EquipamentosPage() {
  const navigate = useNavigate();
  const { temTodasPermissoes } = useAuth();

  const podeCriar = temTodasPermissoes(
    "equipamentos.visualizar",
    "equipamentos.criar",
  );

  const podeEditar = temTodasPermissoes(
    "equipamentos.visualizar",
    "equipamentos.editar",
  );

  const podeExcluir = temTodasPermissoes(
    "equipamentos.visualizar",
    "equipamentos.excluir",
  );

  const podeVerHardware = temTodasPermissoes(
    "equipamentos.visualizar",
    "hardware.visualizar",
  );

  const podeAbrirManutencao = temTodasPermissoes(
    "equipamentos.visualizar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  );

  const podeMovimentarPecas = temTodasPermissoes(
    "equipamentos.visualizar",
    "pecas.visualizar",
    "pecas.movimentar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  );

  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo>("TODOS");

  const [situacaoPeca, setSituacaoPeca] = useState<SituacaoPeca>("TODAS");

  const [operacaoPeca, setOperacaoPeca] = useState<OperacaoPeca | null>(null);

  const [modalManutencaoAberto, setModalManutencaoAberto] = useState(false);

  const [equipamentoManutencao, setEquipamentoManutencao] =
    useState<Equipamento | null>(null);

  const {
    equipamentos,
    equipamentosFiltrados,

    pesquisa,
    setPesquisa,

    categoriaSelecionada,
    setCategoriaSelecionada,

    localizacaoSelecionada,
    setLocalizacaoSelecionada,

    responsavelSelecionado,
    setResponsavelSelecionado,

    statusSelecionado,
    setStatusSelecionado,

    categorias,
    localizacoes,
    responsaveis,
    statusDisponiveis,

    filtrosAtivos,
    limparFiltros,

    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    equipamentoSelecionado,
    equipamentoExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    carregarEquipamentos,
    finalizarCadastroOuEdicao,
  } = useEquipamentos();

  const gruposPorCategoria = useMemo(() => {
    const resultado = new Map<string, GrupoCategoria>();

    for (const equipamento of equipamentos) {
      const nome = equipamento.categoria?.nome?.trim();

      if (nome) {
        resultado.set(nome, obterGrupo(equipamento.categoria));
      }
    }

    return resultado;
  }, [equipamentos]);

  const contagens = useMemo(() => {
    const resultado: Record<Grupo, number> = {
      TODOS: equipamentosFiltrados.length,
      COMPUTADORES: 0,
      PERIFERICOS: 0,
      PECAS: 0,
      OUTROS: 0,
    };

    for (const equipamento of equipamentosFiltrados) {
      resultado[obterGrupo(equipamento.categoria)] += 1;
    }

    return resultado;
  }, [equipamentosFiltrados]);

  const contagensPecas = useMemo(() => {
    const resultado: Record<SituacaoPeca, number> = {
      TODAS: 0,
      RESERVA: 0,
      INSTALADAS: 0,
      DEFEITO: 0,
    };

    for (const equipamento of equipamentosFiltrados) {
      if (obterGrupo(equipamento.categoria) !== "PECAS") {
        continue;
      }

      for (const filtro of filtrosPecas) {
        if (correspondeSituacaoPeca(equipamento, filtro.id)) {
          resultado[filtro.id] += 1;
        }
      }
    }

    return resultado;
  }, [equipamentosFiltrados]);

  const equipamentosExibidos = useMemo(() => {
    return equipamentosFiltrados.filter((equipamento) => {
      if (grupoSelecionado === "TODOS") {
        return true;
      }

      const grupo = obterGrupo(equipamento.categoria);

      if (grupo !== grupoSelecionado) {
        return false;
      }

      if (grupoSelecionado === "PECAS") {
        return correspondeSituacaoPeca(equipamento, situacaoPeca);
      }

      return true;
    });
  }, [equipamentosFiltrados, grupoSelecionado, situacaoPeca]);

  const categoriasVisiveis = useMemo(() => {
    if (grupoSelecionado === "TODOS") {
      return categorias;
    }

    return categorias.filter(
      (categoria) =>
        (gruposPorCategoria.get(categoria) ?? "OUTROS") === grupoSelecionado,
    );
  }, [categorias, grupoSelecionado, gruposPorCategoria]);

  function verificarPermissao(permitido: boolean): boolean {
    if (!permitido) {
      toast.error("Você não possui permissão para esta operação.");
      return false;
    }

    return true;
  }

  function selecionarGrupo(grupo: Grupo) {
    setGrupoSelecionado(grupo);
    setSituacaoPeca("TODAS");

    if (
      categoriaSelecionada &&
      grupo !== "TODOS" &&
      (gruposPorCategoria.get(categoriaSelecionada) ?? "OUTROS") !== grupo
    ) {
      setCategoriaSelecionada("");
    }
  }

  function limparTudo() {
    setGrupoSelecionado("TODOS");
    setSituacaoPeca("TODAS");
    limparFiltros();
  }

  function abrirCadastro() {
    if (!verificarPermissao(podeCriar)) {
      return;
    }

    abrirModalCriacao();
  }

  function abrirEdicao(equipamento: Equipamento) {
    if (!verificarPermissao(podeEditar)) {
      return;
    }

    abrirModalEdicao(equipamento);
  }

  function abrirExclusao(equipamento: Equipamento) {
    if (!verificarPermissao(podeExcluir)) {
      return;
    }

    abrirModalExclusao(equipamento);
  }

  async function confirmarExclusaoPermitida() {
    if (!verificarPermissao(podeExcluir)) {
      return;
    }

    await confirmarExclusao();
  }

  function abrirHardware(equipamento: Equipamento) {
    if (!verificarPermissao(podeVerHardware)) {
      return;
    }

    navigate(`/equipamentos/${equipamento.id}`);
  }

  function abrirPecas(equipamento: Equipamento) {
    if (!verificarPermissao(podeMovimentarPecas)) {
      return;
    }

    if (equipamento.instaladoEmId != null) {
      setOperacaoPeca({
        computadorId: equipamento.instaladoEmId,
        retiradaId: equipamento.id,
      });
      return;
    }

    const grupo = obterGrupo(equipamento.categoria);

    if (grupo === "COMPUTADORES") {
      setOperacaoPeca({ computadorId: equipamento.id });
      return;
    }

    if (grupo !== "PECAS") {
      toast.info("Selecione uma peça ou um computador.");
      return;
    }

    setOperacaoPeca({ pecaId: equipamento.id });
  }

  function abrirModalManutencao(equipamento: Equipamento) {
    if (!verificarPermissao(podeAbrirManutencao)) {
      return;
    }

    if (equipamento.instaladoEmId != null) {
      toast.info(
        "Registre o atendimento no computador ou retire a peça antes de abrir sua manutenção.",
      );
      return;
    }

    const status = normalizarTexto(equipamento.status)
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (status === "em manutencao") {
      toast.info("Este equipamento já está em manutenção.");
      return;
    }

    setEquipamentoManutencao(equipamento);
    setModalManutencaoAberto(true);
  }

  function fecharModalManutencao() {
    setModalManutencaoAberto(false);
    setEquipamentoManutencao(null);
  }

  async function finalizarAberturaManutencao() {
    await finalizarCadastroOuEdicao();
  }

  const podeUsarFormulario = equipamentoSelecionado ? podeEditar : podeCriar;

  const possuiFiltro =
    filtrosAtivos || grupoSelecionado !== "TODOS" || situacaoPeca !== "TODAS";

  return (
    <MainLayout>
      <div className="space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700">
              <Boxes size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Equipamentos
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Computadores, periféricos e peças em um só lugar.
              </p>
            </div>
          </div>

          {podeCriar && (
            <Button type="button" onClick={abrirCadastro}>
              <Plus size={18} />
              Adicionar equipamento
            </Button>
          )}
        </header>

        <nav
          aria-label="Grupos de equipamentos"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {grupos.map(({ id, nome, icone: Icone }) => (
            <button
              key={id}
              type="button"
              aria-pressed={grupoSelecionado === id}
              onClick={() => selecionarGrupo(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                grupoSelecionado === id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icone size={18} />
              {nome}

              <span
                className={`rounded-md px-2 py-0.5 text-xs tabular-nums ${
                  grupoSelecionado === id
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {carregando ? "…" : contagens[id]}
              </span>
            </button>
          ))}
        </nav>

        {grupoSelecionado === "PECAS" && (
          <section aria-label="Situação das peças" className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {filtrosPecas.map(({ id, nome }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={situacaoPeca === id}
                  onClick={() => setSituacaoPeca(id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    situacaoPeca === id
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {nome}

                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-700">
                    {carregando ? "…" : contagensPecas[id]}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Reserva mostra peças disponíveis, sem computador vinculado e sem
              responsável. Peças em manutenção e outras situações aparecem em
              Todas as peças.
            </p>

            <p className="text-xs text-slate-500">
              As contagens consideram a pesquisa e os filtros abaixo.
            </p>
          </section>
        )}

        <Card>
          <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="md:col-span-2 xl:col-span-4">
              <SearchInput
                value={pesquisa}
                onChange={setPesquisa}
                placeholder="Pesquisar por nome, patrimônio, modelo ou número de série..."
              />
            </div>

            <Select
              label="Categoria"
              value={categoriaSelecionada}
              onChange={(event) => setCategoriaSelecionada(event.target.value)}
            >
              <option value="">Todas as categorias</option>

              {categoriasVisiveis.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </Select>

            <Select
              label="Localização"
              value={localizacaoSelecionada}
              onChange={(event) =>
                setLocalizacaoSelecionada(event.target.value)
              }
            >
              <option value="">Todas as localizações</option>

              {localizacoes.map((localizacao) => (
                <option key={localizacao} value={localizacao}>
                  {localizacao}
                </option>
              ))}
            </Select>

            <Select
              label="Responsável"
              value={responsavelSelecionado}
              onChange={(event) =>
                setResponsavelSelecionado(event.target.value)
              }
            >
              <option value="">Todos os responsáveis</option>

              {responsaveis.map((responsavel) => (
                <option key={responsavel} value={responsavel}>
                  {responsavel}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              value={statusSelecionado}
              onChange={(event) => setStatusSelecionado(event.target.value)}
            >
              <option value="">Todos os status</option>

              {statusDisponiveis.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" className="text-sm text-slate-500">
              {carregando
                ? "Carregando equipamentos..."
                : `${equipamentosExibidos.length} ${
                    equipamentosExibidos.length === 1
                      ? "equipamento encontrado"
                      : "equipamentos encontrados"
                  }`}
            </p>

            <Button
              type="button"
              variant="secondary"
              disabled={!possuiFiltro}
              onClick={limparTudo}
            >
              <FilterX size={17} />
              Limpar filtros
            </Button>
          </div>
        </Card>

        <section aria-label="Lista de equipamentos" aria-busy={carregando}>
          {carregando ? (
            <Card>
              <SkeletonTable />
            </Card>
          ) : (
            <EquipmentTable
              equipamentos={equipamentosExibidos}
              {...(podeMovimentarPecas && { onPecas: abrirPecas })}
              {...(podeEditar && { onEdit: abrirEdicao })}
              {...(podeExcluir && { onDelete: abrirExclusao })}
              {...(podeVerHardware && { onHardware: abrirHardware })}
              {...(podeAbrirManutencao && {
                onMaintenance: abrirModalManutencao,
              })}
            />
          )}
        </section>
      </div>

      {podeUsarFormulario && modalAberto && (
        <Modal
          aberto={modalAberto}
          titulo={
            equipamentoSelecionado ? "Editar Equipamento" : "Novo Equipamento"
          }
          onClose={fecharModal}
        >
          <EquipmentForm
            modo={equipamentoSelecionado ? "editar" : "criar"}
            equipamento={equipamentoSelecionado ?? undefined}
            onCancel={fecharModal}
            onSuccess={finalizarCadastroOuEdicao}
          />
        </Modal>
      )}

      {podeExcluir && modalExcluirAberto && (
        <ConfirmModal
          aberto={modalExcluirAberto}
          titulo="Excluir equipamento"
          mensagem={
            equipamentoExcluir
              ? `Deseja realmente excluir "${equipamentoExcluir.nome}"?`
              : ""
          }
          carregando={excluindo}
          onCancel={fecharModalExclusao}
          onConfirm={confirmarExclusaoPermitida}
        />
      )}

      {podeAbrirManutencao && modalManutencaoAberto && (
        <AbrirManutencaoModal
          aberto={modalManutencaoAberto}
          equipamento={equipamentoManutencao}
          onFechar={fecharModalManutencao}
          onSucesso={finalizarAberturaManutencao}
        />
      )}

      {podeMovimentarPecas && operacaoPeca && (
        <PecasModal
          {...operacaoPeca}
          onFechar={() => setOperacaoPeca(null)}
          onSucesso={carregarEquipamentos}
        />
      )}
    </MainLayout>
  );
}
