import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";

import { EquipmentInfoCard } from "../../components/EquipmentInfo/EquipmentInfoCard";
import { HardwareList } from "../../components/Hardware/HardwareList";

import { equipamentoService } from "../../services/equipamentoService";

import type { Equipamento, Hardware } from "../../types/equipamento";

export function EquipamentoDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarEquipamento() {
    if (!id) return;

    try {
      setLoading(true);

      const dados = await equipamentoService.buscarCompleto(Number(id));

      setEquipamento(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar o equipamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEquipamento();
  }, [id]);

  function editarHardware(hardware: Hardware) {
    console.log("Editar:", hardware);
  }

  function excluirHardware(hardware: Hardware) {
    console.log("Excluir:", hardware);
  }

  if (loading) {
    return (
      <MainLayout>
        <Skeleton />
      </MainLayout>
    );
  }

  if (erro || !equipamento) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            Erro ao carregar equipamento
          </h2>

          <p className="mb-6 text-slate-600">
            {erro || "Equipamento não encontrado."}
          </p>

          <Button variant="secondary" onClick={() => navigate("/equipamentos")}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate("/equipamentos")}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </div>

        <Button>
          <Plus size={18} />
          Adicionar Hardware
        </Button>
      </div>

      <div className="space-y-6">
        <EquipmentInfoCard equipamento={equipamento} />

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Hardwares Instalados</h2>

              <p className="text-sm text-gray-500">
                Total: {equipamento.hardware?.length ?? 0}
              </p>
            </div>
          </div>

          {equipamento.hardware && equipamento.hardware.length > 0 ? (
            <HardwareList
              hardwares={equipamento.hardware}
              onEditar={editarHardware}
              onExcluir={excluirHardware}
            />
          ) : (
            <div className="py-12 text-center text-gray-500">
              Nenhum hardware cadastrado para este equipamento.
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
