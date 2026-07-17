import { useCallback, useEffect, useMemo, useState } from "react";

import { equipamentoService } from "../services/equipamentoService";
import type { Equipamento } from "../types/equipamento";
import { useToast } from "../components/Toast";

export function useEquipamentos() {
  const { mostrarToast } = useToast();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [equipamentoExcluir, setEquipamentoExcluir] =
    useState<Equipamento | null>(null);

  const carregarEquipamentos = useCallback(async () => {
    try {
      setCarregando(true);

      console.log("Consultando API de equipamentos...");

      const dados = await equipamentoService.listar();

      console.log("Resposta da API:", dados);

      setEquipamentos(dados);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);

      mostrarToast("Não foi possível carregar os equipamentos.", "erro");
    } finally {
      setCarregando(false);
    }
  }, [mostrarToast]);

  useEffect(() => {
    void carregarEquipamentos();
  }, [carregarEquipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    if (!termo) {
      return equipamentos;
    }

    return equipamentos.filter((equipamento) => {
      const valores = [
        equipamento.nome,
        equipamento.categoria,
        equipamento.fabricante,
        equipamento.modelo,
        equipamento.numeroSerie,
        equipamento.patrimonio,
        equipamento.status,
        equipamento.localizacao,
      ];

      return valores.some((valor) =>
        String(valor ?? "")
          .toLowerCase()
          .includes(termo),
      );
    });
  }, [equipamentos, pesquisa]);

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

  function abrirModalExclusao(equipamento: Equipamento) {
    setEquipamentoExcluir(equipamento);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setEquipamentoExcluir(null);
  }

  async function confirmarExclusao() {
    if (!equipamentoExcluir) {
      return;
    }

    try {
      setExcluindo(true);

      await equipamentoService.excluir(equipamentoExcluir.id);

      setEquipamentos((equipamentosAtuais) =>
        equipamentosAtuais.filter(
          (equipamento) => equipamento.id !== equipamentoExcluir.id,
        ),
      );

      mostrarToast(
        `Equipamento "${equipamentoExcluir.nome}" excluído com sucesso.`,
        "sucesso",
      );
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);

      mostrarToast("Não foi possível excluir o equipamento.", "erro");
    } finally {
      setExcluindo(false);
      setModalExcluirAberto(false);
      setEquipamentoExcluir(null);
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

  return {
    equipamentos,
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
    carregarEquipamentos,
  };
}
