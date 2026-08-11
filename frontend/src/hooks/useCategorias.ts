import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { categoriaService } from "../services/categoriaService";
import type { Categoria } from "../types/equipamento";

interface ApiErrorResponse {
  message?: string;
  mensagem?: string;
}

function obterMensagemErro(error: unknown, mensagemPadrao: string) {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return mensagemPadrao;
  }

  return (
    error.response?.data?.message ??
    error.response?.data?.mensagem ??
    mensagemPadrao
  );
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [excluindo, setExcluindo] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<Categoria | null>(null);

  const [categoriaExcluir, setCategoriaExcluir] = useState<Categoria | null>(
    null,
  );

  const carregarCategorias = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await categoriaService.listar();

      setCategorias(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);

      setCategorias([]);

      toast.error(
        obterMensagemErro(error, "Não foi possível carregar as categorias."),
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCategorias();
  }, [carregarCategorias]);

  function abrirModalCadastro() {
    setCategoriaSelecionada(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(categoria: Categoria) {
    setCategoriaSelecionada(categoria);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCategoriaSelecionada(null);
  }

  function abrirModalExclusao(categoria: Categoria) {
    setCategoriaExcluir(categoria);
    setModalExcluirAberto(true);
  }

  function fecharModalExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setCategoriaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!categoriaExcluir || excluindo) {
      return;
    }

    try {
      setExcluindo(true);

      await categoriaService.excluir(categoriaExcluir.id);

      toast.success("Categoria excluída com sucesso.");

      setModalExcluirAberto(false);
      setCategoriaExcluir(null);

      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);

      toast.error(
        obterMensagemErro(error, "Não foi possível excluir a categoria."),
      );
    } finally {
      setExcluindo(false);
    }
  }

  async function finalizarCadastroOuEdicao() {
    fecharModal();
    await carregarCategorias();
  }

  return {
    categorias,
    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    categoriaSelecionada,
    categoriaExcluir,

    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    finalizarCadastroOuEdicao,
  };
}
