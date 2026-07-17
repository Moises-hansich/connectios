import { Plus } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SearchInput } from "../../components/SearchInput";
import { EquipmentTable } from "../../components/EquipmentTable";
import { EquipmentForm } from "../../components/EquipamentForm";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { SkeletonTable } from "../../components/Skeleton";

import { useEquipamentos } from "../../hooks/useEquipamentos";

export function EquipamentosPage() {
  const {
    equipamentosFiltrados,

    pesquisa,
    setPesquisa,

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

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Equipamentos</h1>

        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={abrirModalCriacao}
        >
          <Plus size={18} />
          Adicionar Equipamento
        </Button>
      </div>

      <div className="mb-6 w-full sm:max-w-md">
        <SearchInput
          value={pesquisa}
          onChange={setPesquisa}
          placeholder="Pesquisar equipamentos..."
        />
      </div>

      <Card>
        {carregando ? (
          <SkeletonTable />
        ) : (
          <EquipmentTable
            equipamentos={equipamentosFiltrados}
            onEdit={abrirModalEdicao}
            onDelete={abrirModalExclusao}
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
