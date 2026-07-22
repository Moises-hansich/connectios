import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { colaboradorService } from "../services/colaboradorService";
import type { Colaborador } from "../types/colaborador";

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [pesquisa, setPesquisa] = useState("");
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState("");

  const [situacaoSelecionada, setSituacaoSelecionada] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [colaboradorSelecionado, setColaboradorSelecionado] =
    useState<Colaborador | null>(null);

  const [colaboradorExcluir, setColaboradorExcluir] =
    useState<Colaborador | null>(null);

  const carregarColaboradores = useCallback(async () => {
    try {
      setCarregando(true);

      const resposta = await colaboradorService.listar({
        page: 1,
        limit: 100,
      });

      setColaboradores(resposta);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);

      toast.error("Não foi possível carregar os colaboradores.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarColaboradores();
  }, [carregarColaboradores]);

  const localizacoes = useMemo(() => {
    return Array.from(
      new Set(
        colaboradores
          .map((colaborador) => colaborador.localizacao?.nome?.trim())
          .filter((localizacao): localizacao is string => Boolean(localizacao)),
      ),
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [colaboradores]);

  const colaboradoresFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return colaboradores.filter((colaborador) => {
      const correspondePesquisa =
        !termo ||
        [
          colaborador.nome,
          colaborador.email,
          colaborador.telefone,
          colaborador.cargo,
          colaborador.localizacao?.nome,
        ].some((valor) =>
          String(valor ?? "")
            .toLowerCase()
            .includes(termo),
        );

      const correspondeLocalizacao =
        !localizacaoSelecionada ||
        colaborador.localizacao?.nome === localizacaoSelecionada;

      const correspondeSituacao =
        !situacaoSelecionada ||
        (situacaoSelecionada === "ativo" && colaborador.ativo) ||
        (situacaoSelecionada === "inativo" && !colaborador.ativo);

      return (
        correspondePesquisa && correspondeLocalizacao && correspondeSituacao
      );
    });
  }, [colaboradores, pesquisa, localizacaoSelecionada, situacaoSelecionada]);

  const filtrosAtivos =
    pesquisa.trim() !== "" ||
    localizacaoSelecionada !== "" ||
    situacaoSelecionada !== "";

  function limparFiltros() {
    setPesquisa("");
    setLocalizacaoSelecionada("");
    setSituacaoSelecionada("");
  }

  function abrirModalCriacao() {
    setColaboradorSelecionado(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(colaborador: Colaborador) {
    setColaboradorSelecionado(colaborador);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setColaboradorSelecionado(null);
  }

  function abrirModalExclusao(colaborador: Colaborador) {
    setColaboradorExcluir(colaborador);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setColaboradorExcluir(null);
  }

  async function confirmarExclusao() {
    if (!colaboradorExcluir) {
      return;
    }

    try {
      setExcluindo(true);

      await colaboradorService.excluir(colaboradorExcluir.id);

      setColaboradores((colaboradoresAtuais) =>
        colaboradoresAtuais.filter(
          (colaborador) => colaborador.id !== colaboradorExcluir.id,
        ),
      );

      toast.success(
        `Colaborador "${colaboradorExcluir.nome}" excluído com sucesso.`,
      );
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error);

      toast.error(
        "Não foi possível excluir o colaborador. Verifique se ele possui equipamentos vinculados.",
      );
    } finally {
      setExcluindo(false);
      setModalExcluirAberto(false);
      setColaboradorExcluir(null);
    }
  }

  async function finalizarCadastroOuEdicao() {
    fecharModal();
    await carregarColaboradores();
  }

  return {
    colaboradores,
    colaboradoresFiltrados,

    pesquisa,
    setPesquisa,

    localizacaoSelecionada,
    setLocalizacaoSelecionada,

    situacaoSelecionada,
    setSituacaoSelecionada,

    localizacoes,

    filtrosAtivos,
    limparFiltros,

    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    colaboradorSelecionado,
    colaboradorExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    finalizarCadastroOuEdicao,
    carregarColaboradores,
  };
}
