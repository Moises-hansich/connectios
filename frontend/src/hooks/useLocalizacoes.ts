import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../services/api";

const API_URL = "/localizacoes";

export interface Localizacao {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface LocalizacaoFormData {
  nome: string;
  descricao?: string;
}

export function useLocalizacoes() {
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [localizacaoSelecionada, setLocalizacaoSelecionada] =
    useState<Localizacao | null>(null);

  const [localizacaoExcluir, setLocalizacaoExcluir] =
    useState<Localizacao | null>(null);

  const buscarLocalizacoes = useCallback(async () => {
    try {
      setCarregando(true);

      const resposta = await api.get<Localizacao[]>(API_URL);

      setLocalizacoes(Array.isArray(resposta.data) ? resposta.data : []);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarLocalizacoes().catch((erro) => {
      console.error("Erro ao buscar localizações:", erro);
    });
  }, [buscarLocalizacoes]);

  async function criarLocalizacao(
    dados: LocalizacaoFormData,
  ): Promise<Localizacao> {
    const resposta = await api.post<Localizacao>(API_URL, dados);
    const novaLocalizacao = resposta.data;

    setLocalizacoes((localizacoesAtuais) => [
      novaLocalizacao,
      ...localizacoesAtuais,
    ]);

    return novaLocalizacao;
  }

  async function atualizarLocalizacao(
    id: number,
    dados: LocalizacaoFormData,
  ): Promise<Localizacao> {
    const resposta = await api.put<Localizacao>(`${API_URL}/${id}`, dados);
    const localizacaoAtualizada = resposta.data;

    setLocalizacoes((localizacoesAtuais) =>
      localizacoesAtuais.map((localizacao) =>
        localizacao.id === id ? localizacaoAtualizada : localizacao,
      ),
    );

    return localizacaoAtualizada;
  }

  async function excluirLocalizacao(id: number): Promise<void> {
    await api.delete(`${API_URL}/${id}`);

    setLocalizacoes((localizacoesAtuais) =>
      localizacoesAtuais.filter((localizacao) => localizacao.id !== id),
    );
  }

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
    carregando,

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

    buscarLocalizacoes,
    criarLocalizacao,
    atualizarLocalizacao,
    excluirLocalizacao,
  };
}
