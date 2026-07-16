import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "../../components/Modal";
import { SearchInput } from "../../components/SearchInput";
import { MainLayout } from "../../layouts";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EquipmentTable } from "../../components/EquipmentTable";
import { equipamentoService } from "../../services/equipamentoService";
import type { Equipamento } from "../../types/equipamento";
import { EquipmentForm } from "../../components/EquipamentForm";
export function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const equipamentosFiltrados = equipamentos.filter((equipamento) =>
    equipamento.nome.toLowerCase().includes(pesquisa.toLowerCase()),
  );

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        const response = await equipamentoService.listar();

        setEquipamentos(response.data);
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
      }
    }

    carregarEquipamentos();
  }, []);

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipamentos</h1>

        <Button onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Adicionar Equipamento
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={pesquisa}
          onChange={setPesquisa}
          placeholder="Pesquisar equipamento..."
        />
      </div>

      <Card>
        <EquipmentTable equipamentos={equipamentosFiltrados} />
      </Card>
      <Modal
        isOpen={modalAberto}
        title="Novo Equipamento"
        onClose={() => setModalAberto(false)}
      >
        <EquipmentForm />
      </Modal>
    </MainLayout>
  );
}
