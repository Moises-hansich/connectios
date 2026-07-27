import { Plus, FilterX } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

import { useEquipamentos } from "../../hooks/useEquipamentos";

export function EquipamentosPage() {
  const navigate = useNavigate();
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

    finalizarCadastroOuEdicao,
  } = useEquipamentos();
  function abrirHardware(equipamento: Equipamento) {
    navigate(`/equipamentos/${equipamento.id}`);
  }
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipamentos</h1>
          <p className="text-sm text-gray-500">
            Total encontrado: {equipamentosFiltrados.length}
          </p>
        </div>

        <Button onClick={abrirModalCriacao}>
          <Plus size={18} />
          Adicionar Equipamento
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar..."
          />

          <Select
            label="Categoria"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            <option value="">Todas</option>

            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </Select>

          <Select
            label="Localização"
            value={localizacaoSelecionada}
            onChange={(e) => setLocalizacaoSelecionada(e.target.value)}
          >
            <option value="">Todas</option>

            {localizacoes.map((localizacao) => (
              <option key={localizacao} value={localizacao}>
                {localizacao}
              </option>
            ))}
          </Select>
          <Select
            label="Responsável"
            value={responsavelSelecionado}
            onChange={(e) => setResponsavelSelecionado(e.target.value)}
          >
            <option value="">Todos</option>

            {responsaveis.map((responsavel) => (
              <option key={responsavel} value={responsavel}>
                {responsavel}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusSelecionado}
            onChange={(e) => setStatusSelecionado(e.target.value)}
          >
            <option value="">Todos</option>

            {statusDisponiveis.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <div className="flex items-end">
            <Button
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
          <EquipmentTable
            equipamentos={equipamentosFiltrados}
            onEdit={abrirModalEdicao}
            onDelete={abrirModalExclusao}
            onHardware={abrirHardware}
          />
        )}
      </Card>

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
    </MainLayout>
  );
}
