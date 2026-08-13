import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";

import { colaboradorService } from "../../services/colaboradorService";
import {
  localizacaoService,
  type Localizacao,
} from "../../services/localizacaoService";

import type {
  Colaborador,
  ColaboradorCreateData,
} from "../../types/colaborador";

import { formatarTelefone, telefoneValido } from "../../utils/telefone";
interface ColaboradorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  colaborador?: Colaborador;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  localizacaoId: string;
  ativo: boolean;
}

function criarEstadoInicial(colaborador?: Colaborador): FormData {
  return {
    nome: colaborador?.nome ?? "",
    email: colaborador?.email ?? "",
    telefone: colaborador?.telefone
      ? formatarTelefone(colaborador.telefone)
      : "",
    cargo: colaborador?.cargo ?? "",
    localizacaoId: colaborador?.localizacaoId?.toString() ?? "",
    ativo: colaborador?.ativo ?? true,
  };
}

export function ColaboradorForm({
  onSuccess,
  onCancel,
  modo,
  colaborador,
}: ColaboradorFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(colaborador),
  );

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [carregandoLocalizacoes, setCarregandoLocalizacoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(colaborador));
  }, [colaborador]);

  useEffect(() => {
    async function carregarLocalizacoes() {
      try {
        setCarregandoLocalizacoes(true);

        const dados = await localizacaoService.listar();

        setLocalizacoes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar localizações:", error);

        toast.error("Não foi possível carregar as localizações.");

        setLocalizacoes([]);
      } finally {
        setCarregandoLocalizacoes(false);
      }
    }

    void carregarLocalizacoes();
  }, []);

  function handleChange(campo: keyof FormData, valor: string | boolean) {
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

    if (!nome) {
      toast.error("O nome é obrigatório.");
      return;
    }
    if (formData.telefone && !telefoneValido(formData.telefone)) {
      toast.error("Informe um telefone válido com DDD.");
      return;
    }
    const localizacaoId =
      formData.localizacaoId === ""
        ? null
        : Number.parseInt(formData.localizacaoId, 10);

    if (formData.localizacaoId !== "" && Number.isNaN(localizacaoId)) {
      toast.error("A localização selecionada é inválida.");
      return;
    }

    const dados: ColaboradorCreateData = {
      nome,
      email: formData.email.trim() || undefined,
      telefone: formData.telefone.trim() || undefined,
      cargo: formData.cargo.trim() || undefined,
      localizacaoId,
      ativo: formData.ativo,
    };

    try {
      setSalvando(true);

      if (modo === "editar" && colaborador) {
        await colaboradorService.atualizar(colaborador.id, dados);

        toast.success("Colaborador atualizado com sucesso.");
      } else {
        await colaboradorService.criar(dados);

        toast.success("Colaborador cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);

      toast.error(
        modo === "editar"
          ? "Não foi possível atualizar o colaborador."
          : "Não foi possível cadastrar o colaborador.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const formularioDesabilitado = salvando || carregandoLocalizacoes;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        value={formData.nome}
        onChange={(event) => handleChange("nome", event.target.value)}
        disabled={formularioDesabilitado}
        required
      />

      <Input
        label="E-mail"
        type="email"
        value={formData.email}
        onChange={(event) => handleChange("email", event.target.value)}
        disabled={formularioDesabilitado}
      />

      <Input
        label="Telefone"
        type="tel"
        inputMode="numeric"
        maxLength={15}
        placeholder="(54) 99310-8848"
        value={formData.telefone}
        onChange={(event) =>
          handleChange("telefone", formatarTelefone(event.target.value))
        }
        disabled={formularioDesabilitado}
      />

      <Input
        label="Cargo"
        value={formData.cargo}
        onChange={(event) => handleChange("cargo", event.target.value)}
        disabled={formularioDesabilitado}
      />

      <Select
        label="Localização"
        value={formData.localizacaoId}
        onChange={(event) => handleChange("localizacaoId", event.target.value)}
        disabled={formularioDesabilitado}
      >
        <option value="">
          {carregandoLocalizacoes
            ? "Carregando localizações..."
            : "Selecione uma localização"}
        </option>

        {localizacoes.map((localizacao) => (
          <option key={localizacao.id} value={localizacao.id}>
            {localizacao.nome}
          </option>
        ))}
      </Select>

      <div className="rounded-lg border border-gray-200 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(event) => handleChange("ativo", event.target.checked)}
            disabled={formularioDesabilitado}
            className="h-4 w-4 rounded border-gray-300"
          />

          <div>
            <span className="block text-sm font-medium text-gray-900">
              Colaborador ativo
            </span>

            <span className="block text-sm text-gray-500">
              Define se o colaborador está ativo no sistema.
            </span>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={formularioDesabilitado}>
          {salvando
            ? "Salvando..."
            : modo === "editar"
              ? "Salvar alterações"
              : "Cadastrar colaborador"}
        </Button>
      </div>
    </form>
  );
}
