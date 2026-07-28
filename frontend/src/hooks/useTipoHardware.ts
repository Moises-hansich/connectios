import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { tipoHardwareService } from "../services/tipoHardwareService";
import type { TipoHardware } from "../types/hardware";

export function useTipoHardware() {
  const [tiposHardware, setTiposHardware] = useState<TipoHardware[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoHardware | null>(
    null,
  );

  const [tipoExcluir, setTipoExcluir] = useState<TipoHardware | null>(null);

  const carregarTiposHardware = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await tipoHardwareService.listar();

      setTiposHardware(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar tipos de hardware:", error);

      setTiposHardware([]);

      toast.error("Não foi possível carregar os tipos de hardware.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarTiposHardware();
  }, [carregarTiposHardware]);

  function abrirModalCadastro() {
    setTipoSelecionado(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(tipo: TipoHardware) {
    setTipoSelecionado(tipo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTipoSelecionado(null);
  }

  function abrirModalExclusao(tipo: TipoHardware) {
    setTipoExcluir(tipo);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setTipoExcluir(null);
  }

  async function confirmarExclusao() {
    if (!tipoExcluir || excluindo) {
      return;
    }

    try {
      setExcluindo(true);

      await tipoHardwareService.excluir(tipoExcluir.id);

      toast.success("Tipo de hardware excluído com sucesso.");

      setModalExcluirAberto(false);
      setTipoExcluir(null);

      await carregarTiposHardware();
    } catch (error) {
      console.error("Erro ao excluir tipo de hardware:", error);

      toast.error("Não foi possível excluir o tipo de hardware.");
    } finally {
      setExcluindo(false);
    }
  }

  async function finalizarCadastroOuEdicao() {
    fecharModal();
    await carregarTiposHardware();
  }

  return {
    tiposHardware,

    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    tipoSelecionado,
    tipoExcluir,

    carregarTiposHardware,

    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    finalizarCadastroOuEdicao,
  };
}
