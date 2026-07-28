import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { campoHardwareService } from "../services/campoHardwareService";

import type { CampoHardware } from "../types/hardware";

export function useCampoHardware() {
  const [camposHardware, setCamposHardware] = useState<CampoHardware[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [campoSelecionado, setCampoSelecionado] =
    useState<CampoHardware | null>(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [campoExcluir, setCampoExcluir] = useState<CampoHardware | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarCamposHardware = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await campoHardwareService.listar();

      const camposOrdenados = [...dados].sort((campoA, campoB) => {
        if (campoA.tipoHardwareId !== campoB.tipoHardwareId) {
          return campoA.tipoHardwareId - campoB.tipoHardwareId;
        }

        return campoA.ordem - campoB.ordem;
      });

      setCamposHardware(camposOrdenados);
    } catch (error) {
      console.error("Erro ao carregar campos de hardware:", error);

      toast.error("Não foi possível carregar os campos de hardware.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCamposHardware();
  }, [carregarCamposHardware]);

  function abrirModalCadastro() {
    setCampoSelecionado(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(campoHardware: CampoHardware) {
    setCampoSelecionado(campoHardware);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCampoSelecionado(null);
  }

  async function finalizarCadastroOuEdicao() {
    fecharModal();
    await carregarCamposHardware();
  }

  function abrirModalExclusao(campoHardware: CampoHardware) {
    setCampoExcluir(campoHardware);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setCampoExcluir(null);
  }

  async function confirmarExclusao() {
    if (!campoExcluir) {
      return;
    }

    try {
      setExcluindo(true);

      await campoHardwareService.excluir(campoExcluir.id);

      toast.success("Campo de hardware excluído com sucesso.");

      setModalExcluirAberto(false);
      setCampoExcluir(null);

      await carregarCamposHardware();
    } catch (error) {
      console.error("Erro ao excluir campo de hardware:", error);

      toast.error(
        "Não foi possível excluir o campo de hardware. Verifique se ele está sendo utilizado.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  return {
    camposHardware,
    carregando,

    modalAberto,
    campoSelecionado,

    modalExcluirAberto,
    campoExcluir,
    excluindo,

    carregarCamposHardware,

    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,
    finalizarCadastroOuEdicao,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,
  };
}
