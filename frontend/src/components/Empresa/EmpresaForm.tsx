import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Building2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { empresaService } from "../../services/empresaService";

import type { CriarEmpresaData, Empresa } from "../../types/empresa";

interface EmpresaFormProps {
  aberto: boolean;
  empresa: Empresa | null;
  onFechar: () => void;
  onSucesso: () => void | Promise<void>;
}

interface FormularioEmpresa {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
}

interface ErroApi {
  mensagem?: string;
  message?: string;
  erro?: string;
}

const formularioInicial: FormularioEmpresa = {
  nome: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  observacoes: "",
  ativo: true,
};

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError<ErroApi>(error)) {
    return (
      error.response?.data?.mensagem ||
      error.response?.data?.message ||
      error.response?.data?.erro ||
      "Não foi possível salvar a empresa."
    );
  }

  return "Não foi possível salvar a empresa.";
}

function somenteNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

function formatarCnpj(valor: string): string {
  const numeros = somenteNumeros(valor).slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function EmpresaForm({
  aberto,
  empresa,
  onFechar,
  onSucesso,
}: EmpresaFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioEmpresa>(formularioInicial);

  const [salvando, setSalvando] = useState(false);

  const editando = empresa !== null;

  useEffect(() => {
    if (!aberto) {
      return;
    }

    if (empresa) {
      setFormulario({
        nome: empresa.nome,
        cnpj: empresa.cnpj ?? "",
        telefone: empresa.telefone ?? "",
        email: empresa.email ?? "",
        endereco: empresa.endereco ?? "",
        observacoes: empresa.observacoes ?? "",
        ativo: empresa.ativo,
      });

      return;
    }

    setFormulario(formularioInicial);
  }, [aberto, empresa]);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) {
        onFechar();
      }
    }

    window.addEventListener("keydown", fecharComEscape);

    return () => {
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto, salvando, onFechar]);

  function alterarCampo(
    campo: keyof FormularioEmpresa,
    valor: string | boolean,
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setFormulario(formularioInicial);
    onFechar();
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = formulario.nome.trim();

    if (nome.length < 2) {
      toast.error("Informe o nome da empresa.");

      return;
    }

    const cnpjNumeros = somenteNumeros(formulario.cnpj);

    if (cnpjNumeros.length > 0 && cnpjNumeros.length !== 14) {
      toast.error("O CNPJ deve possuir 14 números.");

      return;
    }

    const email = formulario.email.trim().toLowerCase();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um endereço de e-mail válido.");

      return;
    }

    const dados: CriarEmpresaData = {
      nome,

      cnpj: formulario.cnpj.trim() || null,

      telefone: formulario.telefone.trim() || null,

      email: email || null,

      endereco: formulario.endereco.trim() || null,

      observacoes: formulario.observacoes.trim() || null,

      ativo: formulario.ativo,
    };

    try {
      setSalvando(true);

      if (empresa) {
        await empresaService.atualizar(empresa.id, dados);

        toast.success("Empresa atualizada com sucesso.");
      } else {
        await empresaService.criar(dados);

        toast.success("Empresa cadastrada com sucesso.");
      }

      setFormulario(formularioInicial);

      await onSucesso();
      onFechar();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);

      toast.error(obterMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          fecharModal();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-empresa"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Building2 size={22} />
            </div>

            <div>
              <h2
                id="titulo-empresa"
                className="text-lg font-semibold text-slate-900"
              >
                {editando ? "Editar empresa" : "Cadastrar empresa"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editando
                  ? "Atualize os dados do fornecedor."
                  : "Cadastre uma empresa ou fornecedor."}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={salvando}
            onClick={fecharModal}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="empresaNome"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nome da empresa *
              </label>

              <input
                id="empresaNome"
                type="text"
                required
                autoFocus
                maxLength={150}
                disabled={salvando}
                value={formulario.nome}
                onChange={(event) => alterarCampo("nome", event.target.value)}
                placeholder="Ex.: Dell Computadores"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaCnpj"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                CNPJ
              </label>

              <input
                id="empresaCnpj"
                type="text"
                inputMode="numeric"
                maxLength={18}
                disabled={salvando}
                value={formulario.cnpj}
                onChange={(event) =>
                  alterarCampo("cnpj", formatarCnpj(event.target.value))
                }
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaTelefone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Telefone
              </label>

              <input
                id="empresaTelefone"
                type="tel"
                maxLength={30}
                disabled={salvando}
                value={formulario.telefone}
                onChange={(event) =>
                  alterarCampo("telefone", event.target.value)
                }
                placeholder="(00) 00000-0000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaEmail"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                E-mail
              </label>

              <input
                id="empresaEmail"
                type="email"
                maxLength={150}
                disabled={salvando}
                value={formulario.email}
                onChange={(event) => alterarCampo("email", event.target.value)}
                placeholder="contato@empresa.com.br"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaEndereco"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Endereço
              </label>

              <input
                id="empresaEndereco"
                type="text"
                maxLength={255}
                disabled={salvando}
                value={formulario.endereco}
                onChange={(event) =>
                  alterarCampo("endereco", event.target.value)
                }
                placeholder="Rua, número e cidade"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="empresaObservacoes"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Observações
              </label>

              <textarea
                id="empresaObservacoes"
                rows={3}
                maxLength={1000}
                disabled={salvando}
                value={formulario.observacoes}
                onChange={(event) =>
                  alterarCampo("observacoes", event.target.value)
                }
                placeholder="Informações adicionais sobre a empresa"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  disabled={salvando}
                  checked={formulario.ativo}
                  onChange={(event) =>
                    alterarCampo("ativo", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm font-medium text-slate-700">
                  Empresa ativa
                </span>
              </label>

              <p className="mt-1 pl-7 text-xs text-slate-500">
                Somente empresas ativas aparecem nos formulários do sistema.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
            <button
              type="button"
              disabled={salvando}
              onClick={fecharModal}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
