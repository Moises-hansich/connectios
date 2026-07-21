import { useMemo, useState } from "react";

export interface Localizacao {
  id: number;
  nome: string;
  descricao?: string;
}

export function useLocalizacoes() {
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [localizacaoSelecionada, setLocalizacaoSelecionada] =
    useState<Localizacao | null>(null);

  const [localizacaoExcluir, setLocalizacaoExcluir] =
    useState<Localizacao | null>(null);

  const localizacoesFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    if (!termo) {
      return localizacoes;
    }

    return localizacoes.filter((localizacao) => {
      return (
        localizacao.nome.toLowerCase().includes(termo) ||
        (localizacao.descricao ?? "").toLowerCase().includes(termo)
      );
    });
  }, [localizacoes, pesquisa]);

  function abrirModalCriacao() {
    setLocalizacaoSelecionada(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(localizacao: Localizacao) {
    setLocalizacaoSelecionada(localizacao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setLocalizacaoSelecionada(null);
  }

  function abrirModalExclusao(localizacao: Localizacao) {
    setLocalizacaoExcluir(localizacao);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    setModalExcluirAberto(false);
    setLocalizacaoExcluir(null);
  }

  return {
    localizacoes,
    localizacoesFiltradas,

    pesquisa,
    setPesquisa,

    modalAberto,
    modalExcluirAberto,

    localizacaoSelecionada,
    localizacaoExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,

    setLocalizacoes,
  };
}
