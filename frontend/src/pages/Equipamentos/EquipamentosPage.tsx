import { PecasModal } from "../../components/Pecas/PecasModal";
import { useAuth } from "../../hooks/useAuth";
import { obterGrupo, normalizarTexto } from "../../utils/grupoEquipamento";
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

import { useEquipamentos } from "../../hooks/useEquipamentos";
import type { Equipamento } from "../../types/equipamento";

type Grupo =
  | "TODOS"
  | "COMPUTADORES"
  | "PERIFERICOS"
  | "PECAS"
  | "OUTROS";

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

// Acrescente aqui os nomes de outras categorias do seu sistema.
// A comparação ignora acentos e letras maiúsculas.
// A classificação é compartilhada pelos componentes de equipamentos.

export function EquipamentosPage() {
  const navigate = useNavigate();
  const {usuario} = useAuth();
  const [operacaoPeca, setOperacaoPeca] = useState<{computadorId?: number; pecaId?: number; retiradaId?: number} | null>(null);
  function abrirPecas(e: Equipamento) {
    setOperacaoPeca(e.instaladoEmId ? {computadorId: e.instaladoEmId, retiradaId: e.id} : obterGrupo(e.categoria?.nome ?? "") === "COMPUTADORES" ? {computadorId: e.id} : {pecaId: e.id});
  }

  const [grupoSelecionado, setGrupoSelecionado] =
    useState<Grupo>("TODOS");

  const [modalManutencaoAberto, setModalManutencaoAberto] =
    useState(false);

  const [equipamentoManutencao, setEquipamentoManutencao] =
    useState<Equipamento | null>(null);

  const {
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

  const contagens = useMemo(() => {
    const resultado: Record<Grupo, number> = {
      TODOS: equipamentosFiltrados.length,
      COMPUTADORES: 0,
      PERIFERICOS: 0,
      PECAS: 0,
      OUTROS: 0,
    };

    for (const equipamento of equipamentosFiltrados) {
      const grupo = obterGrupo(equipamento.categoria?.nome ?? "");
      resultado[grupo] += 1;
    }

    return resultado;
  }, [equipamentosFiltrados]);

  const equipamentosExibidos = useMemo(() => {
    if (grupoSelecionado === "TODOS") {
      return equipamentosFiltrados;
    }

    return equipamentosFiltrados.filter(
      (equipamento) =>
        obterGrupo(equipamento.categoria?.nome ?? "") ===
        grupoSelecionado,
    );
  }, [equipamentosFiltrados, grupoSelecionado]);

  const categoriasVisiveis = useMemo(() => {
    if (grupoSelecionado === "TODOS") {
      return categorias;
    }

    return categorias.filter(
      (categoria) => obterGrupo(categoria) === grupoSelecionado,
    );
  }, [categorias, grupoSelecionado]);

  function selecionarGrupo(grupo: Grupo) {
    setGrupoSelecionado(grupo);

    // Remove uma categoria incompatível com a nova aba.
    if (
      categoriaSelecionada &&
      grupo !== "TODOS" &&
      obterGrupo(categoriaSelecionada) !== grupo
    ) {
      setCategoriaSelecionada("");
    }
  }

  function limparTudo() {
    setGrupoSelecionado("TODOS");
    limparFiltros();
  }

  function abrirHardware(equipamento: Equipamento) {
    navigate(`/equipamentos/${equipamento.id}`);
  }

  function abrirModalManutencao(equipamento: Equipamento) {
    if (normalizarTexto(equipamento.status) === "em manutencao") {
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

          <Button type="button" onClick={abrirModalCriacao}>
            <Plus size={18} />
            Adicionar equipamento
          </Button>
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
              onChange={(event) =>
                setCategoriaSelecionada(event.target.value)
              }
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
              onChange={(event) =>
                setStatusSelecionado(event.target.value)
              }
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
              disabled={!filtrosAtivos && grupoSelecionado === "TODOS"}
              onClick={limparTudo}
            >
              <FilterX size={17} />
              Limpar filtros
            </Button>
          </div>
        </Card>

        <section
          aria-label="Lista de equipamentos"
          aria-busy={carregando}
        >
          {carregando ? (
            <Card>
              <SkeletonTable />
            </Card>
          ) : (
            <EquipmentTable
              onPecas={usuario?.perfil === "ADMIN" ? abrirPecas : undefined}
            equipamentos={equipamentosExibidos}
              onEdit={abrirModalEdicao}
              onDelete={abrirModalExclusao}
              onHardware={abrirHardware}
              onMaintenance={abrirModalManutencao}
            />
          )}
        </section>
      </div>

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
        onConfirm={confirmarExclusao}
      />

      <AbrirManutencaoModal
        aberto={modalManutencaoAberto}
        equipamento={equipamentoManutencao}
        onFechar={fecharModalManutencao}
        onSucesso={finalizarAberturaManutencao}
      />
      {operacaoPeca && <PecasModal {...operacaoPeca} onFechar={() => setOperacaoPeca(null)} onSucesso={carregarEquipamentos} />}
    </MainLayout>
  );
}