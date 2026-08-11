import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../Button";
import { Input } from "../Input";

import type { Localizacao } from "../../hooks/useLocalizacoes";

interface LocalizacaoFormData {
  nome: string;
  descricao?: string;
}

interface LocalizacaoFormProps {
  localizacao?: Localizacao | null;
  onCancelar: () => void;
  onSalvar: (dados: LocalizacaoFormData) => Promise<void>;
}

interface FormData {
  nome: string;
  descricao: string;
}

function criarEstadoInicial(localizacao?: Localizacao | null): FormData {
  return {
    nome: localizacao?.nome ?? "",
    descricao: localizacao?.descricao ?? "",
  };
}

export function LocalizacaoForm({
  localizacao,
  onCancelar,
  onSalvar,
}: LocalizacaoFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(localizacao),
  );

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(localizacao));
  }, [localizacao]);

  function handleChange(campo: keyof FormData, valor: string) {
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

    const nomeFormatado = formData.nome.trim();
    const descricaoFormatada = formData.descricao.trim();

    if (!nomeFormatado) {
      return;
    }

    try {
      setSalvando(true);

      await onSalvar({
        nome: nomeFormatado,
        descricao: descricaoFormatada || undefined,
      });
    } finally {
      setSalvando(false);
    }
  }

  const nomeInvalido = formData.nome.trim().length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nome da localização"
        required
        autoFocus
        value={formData.nome}
        disabled={salvando}
        placeholder="Ex.: Sala de TI"
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <div>
        <label
          htmlFor="descricao-localizacao"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Descrição
        </label>

        <textarea
          id="descricao-localizacao"
          rows={4}
          value={formData.descricao}
          disabled={salvando}
          placeholder="Ex.: Sala localizada no segundo andar."
          onChange={(event) => handleChange("descricao", event.target.value)}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={salvando}
          onClick={onCancelar}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={salvando} disabled={nomeInvalido}>
          {localizacao ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
