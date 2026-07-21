import { useEffect, useState } from "react";

import type { Localizacao } from "../../hooks/useLocalizacoes";

interface LocalizacaoFormProps {
  localizacao?: Localizacao | null;
  onCancelar: () => void;
  onSalvar: (dados: Omit<Localizacao, "id">) => Promise<void>;
}

export function LocalizacaoForm({
  localizacao,
  onCancelar,
  onSalvar,
}: LocalizacaoFormProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (localizacao) {
      setNome(localizacao.nome);
      setDescricao(localizacao.descricao ?? "");
      return;
    }

    setNome("");
    setDescricao("");
  }, [localizacao]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeFormatado = nome.trim();
    const descricaoFormatada = descricao.trim();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="nome-localizacao"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Nome da localização
        </label>

        <input
          id="nome-localizacao"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
          autoFocus
          disabled={salvando}
          placeholder="Ex.: Sala de TI"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

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
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          disabled={salvando}
          placeholder="Ex.: Sala localizada no segundo andar."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancelar}
          disabled={salvando}
          className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={salvando || !nome.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando
            ? "Salvando..."
            : localizacao
              ? "Salvar alterações"
              : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
