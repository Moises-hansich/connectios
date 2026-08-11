import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "../Button";
import { Input } from "../Input";

import {
  categoriaService,
  type AtualizarCategoriaData,
  type CriarCategoriaData,
} from "../../services/categoriaService";

import type { Categoria } from "../../types/equipamento";

interface CategoriaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  categoria?: Categoria;
}

interface FormData {
  nome: string;
  descricao: string;
  ativo: boolean;
}

interface ApiErrorResponse {
  message?: string;
  mensagem?: string;
}

function criarEstadoInicial(categoria?: Categoria): FormData {
  return {
    nome: categoria?.nome ?? "",
    descricao: categoria?.descricao ?? "",
    ativo: categoria?.ativo ?? true,
  };
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

export function CategoriaForm({
  onSuccess,
  onCancel,
  modo,
  categoria,
}: CategoriaFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(categoria),
  );

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(categoria));
  }, [categoria]);

  function handleChange(campo: "nome" | "descricao", valor: string) {
    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    const nome = formData.nome.trim();
    const descricao = formData.descricao.trim();

    if (!nome) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    try {
      setSalvando(true);

      if (modo === "editar" && categoria) {
        const dados: AtualizarCategoriaData = {
          nome,
          descricao: descricao || null,
          ativo: formData.ativo,
        };

        await categoriaService.atualizar(categoria.id, dados);

        toast.success("Categoria atualizada com sucesso.");
      } else {
        const dados: CriarCategoriaData = {
          nome,
          descricao: descricao || null,
          ativo: formData.ativo,
        };

        await categoriaService.criar(dados);

        toast.success("Categoria cadastrada com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);

      toast.error(
        obterMensagemErro(
          error,
          modo === "editar"
            ? "Não foi possível atualizar a categoria."
            : "Não foi possível cadastrar a categoria.",
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        required
        value={formData.nome}
        disabled={salvando}
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <Input
        label="Descrição"
        value={formData.descricao}
        disabled={salvando}
        onChange={(event) => handleChange("descricao", event.target.value)}
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={formData.ativo}
          disabled={salvando}
          onChange={(event) =>
            setFormData((dadosAtuais) => ({
              ...dadosAtuais,
              ativo: event.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />

        <div>
          <p className="text-sm font-medium text-slate-700">Categoria ativa</p>

          <p className="text-xs text-slate-500">
            Categorias inativas não aparecem no cadastro de equipamentos.
          </p>
        </div>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={salvando}>
          {modo === "editar" ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
