import { useEffect, useState, type FormEvent } from "react";
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
  grupo: Categoria["grupo"];
  descricao: string;
  ativo: boolean;
}

interface ApiErrorResponse {
  message?: string;
  mensagem?: string;
}

const grupos: {
  valor: Categoria["grupo"];
  nome: string;
}[] = [
  { valor: "COMPUTADORES", nome: "Computadores" },
  { valor: "PERIFERICOS", nome: "Periféricos" },
  { valor: "PECAS", nome: "Peças" },
  { valor: "OUTROS", nome: "Outros" },
];

function criarEstadoInicial(categoria?: Categoria): FormData {
  return {
    nome: categoria?.nome ?? "",
    grupo: categoria?.grupo ?? "OUTROS",
    descricao: categoria?.descricao ?? "",
    ativo: categoria?.ativo ?? true,
  };
}

function obterMensagemErro(error: unknown, mensagemPadrao: string): string {
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

  function alterarTexto(campo: "nome" | "descricao", valor: string) {
    setFormData((anterior) => ({
      ...anterior,
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
          grupo: formData.grupo,
          descricao: descricao || null,
          ativo: formData.ativo,
        };

        await categoriaService.atualizar(categoria.id, dados);
      } else {
        const dados: CriarCategoriaData = {
          nome,
          grupo: formData.grupo,
          descricao: descricao || null,
          ativo: formData.ativo,
        };

        await categoriaService.criar(dados);
      }
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

      return;
    } finally {
      setSalvando(false);
    }

    toast.success(
      modo === "editar"
        ? "Categoria atualizada com sucesso."
        : "Categoria cadastrada com sucesso.",
    );

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        required
        value={formData.nome}
        disabled={salvando}
        onChange={(event) => alterarTexto("nome", event.target.value)}
      />

      <label className="block text-sm font-medium text-slate-700">
        Grupo
        <select
          required
          value={formData.grupo}
          disabled={salvando}
          onChange={(event) =>
            setFormData((anterior) => ({
              ...anterior,
              grupo: event.target.value as Categoria["grupo"],
            }))
          }
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        >
          {grupos.map((grupo) => (
            <option key={grupo.valor} value={grupo.valor}>
              {grupo.nome}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Define o grupo dos equipamentos desta categoria. Exemplo: a categoria
          Memória RAM pertence ao grupo Peças.
        </span>
      </label>

      <Input
        label="Descrição"
        value={formData.descricao}
        disabled={salvando}
        onChange={(event) => alterarTexto("descricao", event.target.value)}
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={formData.ativo}
          disabled={salvando}
          onChange={(event) =>
            setFormData((anterior) => ({
              ...anterior,
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
