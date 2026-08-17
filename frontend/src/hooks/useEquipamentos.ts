import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { equipamentoService } from "../services/equipamentoService";
import type { Equipamento } from "../types/equipamento";

interface ErroApi {
  message?: string;
  mensagem?: string;
  error?: string;
  erro?: string;
}

function obterMensagemErro(error: unknown, mensagemPadrao: string): string {
  if (!axios.isAxiosError<ErroApi>(error)) {
    return mensagemPadrao;
  }

  return (
    error.response?.data?.message ??
    error.response?.data?.mensagem ??
    error.response?.data?.error ??
    error.response?.data?.erro ??
    mensagemPadrao
  );
}

export function useEquipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState("");
  const [responsavelSelecionado, setResponsavelSelecionado] = useState("");
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

      toast.error(
        obterMensagemErro(error, "Não foi possível carregar os equipamentos."),
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarEquipamentos();
  }, [carregarEquipamentos]);

  const categorias = useMemo(() => {
    const nomes = equipamentos
      .map((equipamento) => equipamento.categoria?.nome?.trim())
      .filter((nome): nome is string => Boolean(nome));

    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const localizacoes = useMemo(() => {
    const nomes = equipamentos
      .map((equipamento) => equipamento.localizacao?.nome?.trim())
      .filter((nome): nome is string => Boolean(nome));

    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const statusDisponiveis = useMemo(() => {
    const nomes = equipamentos
      .map((equipamento) => equipamento.status?.trim())
      .filter((nome): nome is string => Boolean(nome));

    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const responsaveis = useMemo(() => {
    const nomes = equipamentos
      .map((equipamento) => equipamento.responsavel?.nome?.trim())
      .filter((nome): nome is string => Boolean(nome));

    return [...new Set(nomes)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [equipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");

    return equipamentos.filter((equipamento) => {
      const correspondePesquisa =
        !termo ||
        [
          equipamento.nome,
          equipamento.categoria?.nome,
          equipamento.fabricante,
          equipamento.modelo,
          equipamento.numeroSerie,
          equipamento.patrimonio,
          equipamento.status,
          equipamento.localizacao?.nome,
          equipamento.responsavel?.nome,
          equipamento.observacoes,
        ].some((valor) =>
          String(valor ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(termo),
        );

      const correspondeCategoria =
        !categoriaSelecionada ||
        equipamento.categoria?.nome?.trim() === categoriaSelecionada;

      const correspondeLocalizacao =
        !localizacaoSelecionada ||
        equipamento.localizacao?.nome?.trim() === localizacaoSelecionada;

      const correspondeResponsavel =
        !responsavelSelecionado ||
        equipamento.responsavel?.nome?.trim() === responsavelSelecionado;

      const correspondeStatus =
        !statusSelecionado || equipamento.status?.trim() === statusSelecionado;

      return (
        correspondePesquisa &&
        correspondeCategoria &&
        correspondeLocalizacao &&
        correspondeResponsavel &&
        correspondeStatus
      );
    });
  }, [
    equipamentos,
    pesquisa,
    categoriaSelecionada,
    localizacaoSelecionada,
    responsavelSelecionado,
    statusSelecionado,
  ]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    categoriaSelecionada !== "" ||
    localizacaoSelecionada !== "" ||
    responsavelSelecionado !== "" ||
    statusSelecionado !== "";

  function limparFiltros() {
    setPesquisa("");
    setCategoriaSelecionada("");
    setLocalizacaoSelecionada("");
    setResponsavelSelecionado("");
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

      setModalExcluirAberto(false);
      setEquipamentoExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);

      toast.error(
        obterMensagemErro(error, "Não foi possível excluir o equipamento."),
      );
    } finally {
      setExcluindo(false);
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

    responsavelSelecionado,
    setResponsavelSelecionado,

    statusSelecionado,
    setStatusSelecionado,

    categorias,
    localizacoes,
    responsaveis,
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
