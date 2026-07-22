import { FilterX, Plus } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SearchInput } from "../../components/SearchInput";
import { Select } from "../../components/Select";
import { SkeletonTable } from "../../components/Skeleton";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ColaboradorForm } from "../../components/ColaboradorForm";
import { ColaboradorTable } from "../../components/ColaboradorTable";

import { useColaboradores } from "../../hooks/useColaboradores";

export function ColaboradoresPage() {
  const {
    colaboradoresFiltrados,

    pesquisa,
    setPesquisa,

    localizacaoSelecionada,
    setLocalizacaoSelecionada,

    situacaoSelecionada,
    setSituacaoSelecionada,

    localizacoes,

    filtrosAtivos,
    limparFiltros,

    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    colaboradorSelecionado,
    colaboradorExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    finalizarCadastroOuEdicao,
  } = useColaboradores();

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>

          <p className="text-sm text-gray-500">
            Total encontrado: {colaboradoresFiltrados.length}
          </p>
        </div>

        <Button onClick={abrirModalCriacao}>
          <Plus size={18} />
          Adicionar colaborador
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar colaborador..."
          />

          <Select
            label="Localização"
            value={localizacaoSelecionada}
            onChange={(event) => setLocalizacaoSelecionada(event.target.value)}
          >
            <option value="">Todas</option>

            {localizacoes.map((localizacao) => (
              <option key={localizacao} value={localizacao}>
                {localizacao}
              </option>
            ))}
          </Select>

          <Select
            label="Situação"
            value={situacaoSelecionada}
            onChange={(event) => setSituacaoSelecionada(event.target.value)}
          >
            <option value="">Todas</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </Select>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={!filtrosAtivos}
              onClick={limparFiltros}
            >
              <FilterX size={18} />
              Limpar filtros
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <SkeletonTable />
        ) : (
          <ColaboradorTable
            colaboradores={colaboradoresFiltrados}
            onEdit={abrirModalEdicao}
            onDelete={abrirModalExclusao}
          />
        )}
      </Card>

      <Modal
        aberto={modalAberto}
        titulo={
          colaboradorSelecionado ? "Editar colaborador" : "Novo colaborador"
        }
        onClose={fecharModal}
      >
        <ColaboradorForm
          modo={colaboradorSelecionado ? "editar" : "criar"}
          colaborador={colaboradorSelecionado ?? undefined}
          onCancel={fecharModal}
          onSuccess={finalizarCadastroOuEdicao}
        />
      </Modal>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir colaborador"
        mensagem={
          colaboradorExcluir
            ? `Deseja realmente excluir "${colaboradorExcluir.nome}"?`
            : ""
        }
        carregando={excluindo}
        onCancel={fecharModalExclusao}
        onConfirm={confirmarExclusao}
      />
    </MainLayout>
  );
}
