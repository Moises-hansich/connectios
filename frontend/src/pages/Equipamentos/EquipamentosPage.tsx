import { MainLayout } from "../../layouts";
import { Button } from "../../components/Button";
import { Plus } from "lucide-react";
import { Card } from "../../components/Card";

export function EquipamentosPage() {
  return (
    <mainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipamentos</h1>

        <Button>
          <Plus size={18} />
          Adicionar Equipamento
        </Button>
      </div>

      <Card>
        <p>Este é um exemplo de card.</p>
      </Card>
    </mainLayout>
  );
}
