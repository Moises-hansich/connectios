import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "../Button";
import { Input } from "../Input";

import { tipoHardwareService } from "../../services/tipoHardwareService";

import type {
  AtualizarTipoHardwareData,
  CriarTipoHardwareData,
  TipoHardware,
} from "../../types/hardware";

interface TipoHardwareFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  tipoHardware?: TipoHardware;
}

interface FormData {
  nome: string;
  descricao: string;
  ordem: number;
}

function criarEstadoInicial(tipoHardware?: TipoHardware): FormData {
  return {
    nome: tipoHardware?.nome ?? "",
    descricao: tipoHardware?.descricao ?? "",
    ordem: tipoHardware?.ordem ?? 0,
  };
}

export function TipoHardwareForm({
  onSuccess,
  onCancel,
  modo,
  tipoHardware,
}: TipoHardwareFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(tipoHardware),
  );

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(tipoHardware));
  }, [tipoHardware]);

  function handleChange(campo: "nome" | "descricao", valor: string) {
    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  function handleOrdemChange(valor: string) {
    const ordemConvertida = Number(valor);

    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      ordem: Number.isNaN(ordemConvertida) ? 0 : ordemConvertida,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    const nome = formData.nome.trim();
    const descricao = formData.descricao.trim();
    const ordem = Number(formData.ordem);

    if (!nome) {
      toast.error("Informe o nome do tipo de hardware.");
      return;
    }

    if (Number.isNaN(ordem) || ordem < 0) {
      toast.error("Informe uma ordem válida.");
      return;
    }

    try {
      setSalvando(true);

      if (modo === "editar" && tipoHardware) {
        const dados: AtualizarTipoHardwareData = {
          nome,
          descricao: descricao || undefined,
          ordem,
        };

        await tipoHardwareService.atualizar(tipoHardware.id, dados);

        toast.success("Tipo de hardware atualizado com sucesso.");
      } else {
        const dados: CriarTipoHardwareData = {
          nome,
          descricao: descricao || undefined,
          ordem,
        };

        await tipoHardwareService.criar(dados);

        toast.success("Tipo de hardware cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar tipo de hardware:", error);

      toast.error(
        modo === "editar"
          ? "Não foi possível atualizar o tipo de hardware."
          : "Não foi possível cadastrar o tipo de hardware.",
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

      <Input
        label="Ordem"
        type="number"
        min={0}
        required
        value={formData.ordem}
        disabled={salvando}
        onChange={(event) => handleOrdemChange(event.target.value)}
      />

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
