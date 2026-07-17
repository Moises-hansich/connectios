import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "../../components/Toast";
import { Modal } from "../../components/Modal";
import { SearchInput } from "../../components/SearchInput";
import { MainLayout } from "../../layouts";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EquipmentTable } from "../../components/EquipmentTable";
import { EquipmentForm } from "../../components/EquipamentForm";

import { equipamentoService } from "../../services/equipamentoService";

import type { Equipamento } from "../../types/equipamento";

export function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const { mostrarToast } = useToast();
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    const termo = pesquisa.toLowerCase();

    return (
      equipamento.nome.toLowerCase().includes(termo) ||
      equipamento.categoria.toLowerCase().includes(termo) ||
      equipamento.fabricante?.toLowerCase().includes(termo) ||
      equipamento.modelo?.toLowerCase().includes(termo) ||
      equipamento.patrimonio?.toLowerCase().includes(termo) ||
      equipamento.localizacao?.toLowerCase().includes(termo)
    );
  });

  async function carregarEquipamentos() {
    try {
      const response = await equipamentoService.listar();
      setEquipamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
    }
  }

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  function abrirModalCriacao() {
    setEquipamentoSelecionado(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(equipamento: Equipamento) {
    setEquipamentoSelecionado(equipamento);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEquipamentoSelecionado(null);
  }

  async function excluirEquipamento(equipamento: Equipamento) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o equipamento "${equipamento.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      await equipamentoService.excluir(equipamento.id);

      setEquipamentos((equipamentosAtuais) =>
        equipamentosAtuais.filter((item) => item.id !== equipamento.id),
      );

      mostrarToast(
        `Equipamento "${equipamento.nome}" excluído com sucesso.`,
        "sucesso",
      );
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);

      mostrarToast("Não foi possível excluir o equipamento.", "erro");
    }
  }

  async function finalizarCadastroOuEdicao() {
    const estavaEditando = equipamentoSelecionado !== null;

    fecharModal();
    await carregarEquipamentos();

    mostrarToast(
      estavaEditando
        ? "Equipamento atualizado com sucesso."
        : "Equipamento cadastrado com sucesso.",
      "sucesso",
    );
  }

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
        <EquipmentTable
          equipamentos={equipamentosFiltrados}
          onEdit={abrirModalEdicao}
          onDelete={excluirEquipamento}
        />
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
    </MainLayout>
  );
}
