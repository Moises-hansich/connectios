import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000/api/localizacoes";

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

      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as localizações.");
      }

      const dados: Localizacao[] = await resposta.json();

      setLocalizacoes(dados);
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
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => null);

      throw new Error(
        erro?.message ??
          erro?.erro ??
          "Não foi possível cadastrar a localização.",
      );
    }

    const novaLocalizacao: Localizacao = await resposta.json();

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
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => null);

      throw new Error(
        erro?.message ??
          erro?.erro ??
          "Não foi possível atualizar a localização.",
      );
    }

    const localizacaoAtualizada: Localizacao = await resposta.json();

    setLocalizacoes((localizacoesAtuais) =>
      localizacoesAtuais.map((localizacao) =>
        localizacao.id === id ? localizacaoAtualizada : localizacao,
      ),
    );

    return localizacaoAtualizada;
  }

  async function excluirLocalizacao(id: number): Promise<void> {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => null);

      throw new Error(
        erro?.message ??
          erro?.erro ??
          "Não foi possível excluir a localização.",
      );
    }

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
