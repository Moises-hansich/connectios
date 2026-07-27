import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";
import { ConfirmModal } from "../../components/ConfirmModal";

import { EquipmentInfoCard } from "../../components/EquipmentInfo/EquipmentInfoCard";
import { HardwareList } from "../../components/Hardware/HardwareList";
import { HardwareModal } from "../../components/Hardware/HardwareModal";
import { HardwareForm } from "../../components/Hardware/HardwareForm";

import { equipamentoService } from "../../services/equipamentoService";
import { hardwareService } from "../../services/hardwareService";

import type { Equipamento, Hardware } from "../../types/equipamento";

export function EquipamentoDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [modalHardwareAberto, setModalHardwareAberto] = useState(false);
  const [hardwareSelecionado, setHardwareSelecionado] =
    useState<Hardware | null>(null);

  const [hardwareExcluir, setHardwareExcluir] = useState<Hardware | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarEquipamento() {
    if (!id) {
      setErro("ID do equipamento não informado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const dados = await equipamentoService.buscarCompleto(Number(id));

      setEquipamento(dados);
    } catch (error) {
      console.error("Erro ao carregar equipamento:", error);
      setErro("Não foi possível carregar o equipamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEquipamento();
  }, [id]);

  function adicionarHardware() {
    setHardwareSelecionado(null);
    setModalHardwareAberto(true);
  }

  function editarHardware(hardware: Hardware) {
    setHardwareSelecionado(hardware);
    setModalHardwareAberto(true);
  }

  function fecharHardwareModal() {
    setHardwareSelecionado(null);
    setModalHardwareAberto(false);
  }

  function excluirHardware(hardware: Hardware) {
    setHardwareExcluir(hardware);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setHardwareExcluir(null);
  }

  async function confirmarExclusaoHardware() {
    if (!hardwareExcluir) {
      return;
    }

    try {
      setExcluindo(true);

      await hardwareService.excluir(hardwareExcluir.id);

      toast.success(`Hardware "${hardwareExcluir.nome}" excluído com sucesso.`);

      setModalExcluirAberto(false);
      setHardwareExcluir(null);

      await carregarEquipamento();
    } catch (error) {
      console.error("Erro ao excluir hardware:", error);

      toast.error("Não foi possível excluir o hardware.");
    } finally {
      setExcluindo(false);
    }
  }

  async function concluirFormularioHardware() {
    fecharHardwareModal();
    await carregarEquipamento();
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

        <Button onClick={adicionarHardware}>
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

      <HardwareModal
        aberto={modalHardwareAberto}
        titulo={hardwareSelecionado ? "Editar Hardware" : "Adicionar Hardware"}
        onClose={fecharHardwareModal}
      >
        <HardwareForm
          equipamentoId={equipamento.id}
          hardware={hardwareSelecionado}
          onCancelar={fecharHardwareModal}
          onSucesso={concluirFormularioHardware}
        />
      </HardwareModal>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir Hardware"
        mensagem={
          hardwareExcluir
            ? `Deseja realmente excluir o hardware "${hardwareExcluir.nome}"?`
            : ""
        }
        carregando={excluindo}
        onCancel={fecharModalExclusao}
        onConfirm={confirmarExclusaoHardware}
      />
    </MainLayout>
  );
}
