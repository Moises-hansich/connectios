import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { equipamentoService } from "../services/equipamentoService";
import type { Equipamento } from "../types/equipamento";

export function useEquipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");

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

      const dados = await equipamentoService.listar();

      setEquipamentos(dados);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);

      toast.error("Não foi possível carregar os equipamentos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarEquipamentos();
  }, [carregarEquipamentos]);

  const categorias = useMemo(() => {
    return Array.from(
      new Set(
        equipamentos
          .map((equipamento) => equipamento.categoria?.trim())
          .filter((categoria): categoria is string => Boolean(categoria)),
      ),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const localizacoes = useMemo(() => {
    return Array.from(
      new Set(
        equipamentos
          .map((equipamento) => equipamento.localizacao?.nome?.trim())
          .filter((localizacao): localizacao is string => Boolean(localizacao)),
      ),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const statusDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        equipamentos
          .map((equipamento) => equipamento.status?.trim())
          .filter((status): status is string => Boolean(status)),
      ),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return equipamentos.filter((equipamento) => {
      const correspondePesquisa =
        !termo ||
        [
          equipamento.nome,
          equipamento.categoria,
          equipamento.fabricante,
          equipamento.modelo,
          equipamento.numeroSerie,
          equipamento.patrimonio,
          equipamento.status,
          equipamento.localizacao?.nome,
          equipamento.observacoes,
        ].some((valor) =>
          String(valor ?? "")
            .toLowerCase()
            .includes(termo),
        );

      const correspondeCategoria =
        !categoriaSelecionada || equipamento.categoria === categoriaSelecionada;

      const correspondeLocalizacao =
        !localizacaoSelecionada ||
        equipamento.localizacao?.nome === localizacaoSelecionada;

      const correspondeStatus =
        !statusSelecionado || equipamento.status === statusSelecionado;

      return (
        correspondePesquisa &&
        correspondeCategoria &&
        correspondeLocalizacao &&
        correspondeStatus
      );
    });
  }, [
    equipamentos,
    pesquisa,
    categoriaSelecionada,
    localizacaoSelecionada,
    statusSelecionado,
  ]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    categoriaSelecionada !== "" ||
    localizacaoSelecionada !== "" ||
    statusSelecionado !== "";

  function limparFiltros() {
    setPesquisa("");
    setCategoriaSelecionada("");
    setLocalizacaoSelecionada("");
    setStatusSelecionado("");
  }

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

      toast.success(
        `Equipamento "${equipamentoExcluir.nome}" excluído com sucesso.`,
      );
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);

      toast.error("Não foi possível excluir o equipamento.");
    } finally {
      setExcluindo(false);
      setModalExcluirAberto(false);
      setEquipamentoExcluir(null);
    }
  }

  async function finalizarCadastroOuEdicao() {
    fecharModal();
    await carregarEquipamentos();
  }

  return {
    equipamentos,
    equipamentosFiltrados,

    pesquisa,
    setPesquisa,

    categoriaSelecionada,
    setCategoriaSelecionada,

    localizacaoSelecionada,
    setLocalizacaoSelecionada,

    statusSelecionado,
    setStatusSelecionado,

    categorias,
    localizacoes,
    statusDisponiveis,

    filtrosAtivos,
    limparFiltros,

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
