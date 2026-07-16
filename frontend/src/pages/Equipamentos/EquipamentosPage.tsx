import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { SearchInput } from "../../components/SearchInput";
import { MainLayout } from "../../layouts";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EquipmentTable } from "../../components/EquipmentTable";
import { equipamentoService } from "../../services/equipamentoService";
import type { Equipamento } from "../../types/equipamento";

export function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [pesquisa, setPesquisa] = useState("");

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

        <Button>
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
        <EquipmentTable equipamentos={equipamentos} />
      </Card>
    </MainLayout>
  );
}
