import { type FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, ShieldCheck, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../Button";

import { empresaService } from "../../services/empresaService";
import { manutencaoService } from "../../services/manutencaoService";

import type { Empresa } from "../../types/empresa";
import type { GarantiaEquipamento } from "../../types/manutencao";

interface EquipamentoSelecionado {
  id: number;
  nome: string;
  patrimonio?: string | null;
}

interface AbrirManutencaoModalProps {
  aberto: boolean;
  equipamento: EquipamentoSelecionado | null;
  onFechar: () => void;
  onSucesso?: () => void | Promise<void>;
}

interface FormularioManutencao {
  problemaInformado: string;
  localManutencao: string;
  empresaResponsavelId: string;
  previsaoRetorno: string;
  custo: string;
  observacoes: string;
}

interface ErroApi {
  mensagem?: string;
  message?: string;
  erro?: string;
}

const formularioInicial: FormularioManutencao = {
  problemaInformado: "",
  localManutencao: "",
  empresaResponsavelId: "",
  previsaoRetorno: "",
  custo: "",
  observacoes: "",
};

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError<ErroApi>(error)) {
    return (
      error.response?.data?.mensagem ||
      error.response?.data?.message ||
      error.response?.data?.erro ||
      "Não foi possível abrir a manutenção."
    );
  }

  return "Não foi possível abrir a manutenção.";
}

function formatarDataGarantia(valor: string | null): string {
  if (!valor) {
    return "Não informada";
  }

  const dataSomente = valor.slice(0, 10);
  const [ano, mes, dia] = dataSomente.split("-");

  if (!ano || !mes || !dia) {
    return "Data inválida";
  }

  return `${dia}/${mes}/${ano}`;
}

export function AbrirManutencaoModal({
  aberto,
  equipamento,
  onFechar,
  onSucesso,
}: AbrirManutencaoModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioManutencao>(formularioInicial);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);

  const [garantia, setGarantia] = useState<GarantiaEquipamento | null>(null);

  const [carregandoGarantia, setCarregandoGarantia] = useState(false);

  const [erroGarantia, setErroGarantia] = useState(false);

  const [salvando, setSalvando] = useState(false);

  const garantiaAtiva = garantia?.garantiaAtiva === true;

  const fornecedorGarantia = garantia?.fornecedor ?? null;

  const garantiaSemFornecedor = garantiaAtiva && fornecedorGarantia === null;

  useEffect(() => {
    if (!aberto) {
      return;
    }

    setFormulario(formularioInicial);
    setGarantia(null);
    setErroGarantia(false);
  }, [aberto, equipamento?.id]);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    let componenteAtivo = true;

    async function carregarEmpresas() {
      try {
        setCarregandoEmpresas(true);

        const dados = await empresaService.listarAtivas();

        if (componenteAtivo) {
          setEmpresas(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);

        if (componenteAtivo) {
          setEmpresas([]);

          toast.error("Não foi possível carregar as empresas.");
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoEmpresas(false);
        }
      }
    }

    void carregarEmpresas();

    return () => {
      componenteAtivo = false;
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto || !equipamento) {
      return;
    }

    let componenteAtivo = true;

    async function carregarGarantia() {
      try {
        setCarregandoGarantia(true);
        setErroGarantia(false);
        setGarantia(null);

        const dados = await manutencaoService.consultarGarantia(
          equipamento!.id,
        );

        if (!componenteAtivo) {
          return;
        }

        setGarantia(dados);

        if (dados.garantiaAtiva && dados.fornecedor) {
          const fornecedorId = dados.fornecedor.id;

          setFormulario((anterior) => ({
            ...anterior,
            empresaResponsavelId: String(fornecedorId),
          }));
        }
      } catch (error) {
        console.error("Erro ao consultar garantia:", error);

        if (componenteAtivo) {
          setErroGarantia(true);

          toast.error("Não foi possível consultar a garantia do equipamento.");
        }
      } finally {
        if (componenteAtivo) {
          setCarregandoGarantia(false);
        }
      }
    }

    void carregarGarantia();

    return () => {
      componenteAtivo = false;
    };
  }, [aberto, equipamento]);

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

  function alterarCampo(campo: keyof FormularioManutencao, valor: string) {
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
    setGarantia(null);
    setErroGarantia(false);

    onFechar();
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!equipamento) {
      toast.error("Nenhum equipamento foi selecionado.");

      return;
    }

    if (carregandoGarantia || erroGarantia || !garantia) {
      toast.error("Aguarde a consulta da garantia do equipamento.");

      return;
    }

    if (garantiaSemFornecedor) {
      toast.error(
        "O equipamento está na garantia, mas não possui fornecedor cadastrado.",
      );

      return;
    }

    const problema = formulario.problemaInformado.trim();

    if (problema.length < 5) {
      toast.error("Informe o problema com pelo menos 5 caracteres.");

      return;
    }

    const empresaResponsavelId =
      garantiaAtiva && fornecedorGarantia
        ? fornecedorGarantia.id
        : formulario.empresaResponsavelId === ""
          ? null
          : Number(formulario.empresaResponsavelId);

    if (
      empresaResponsavelId !== null &&
      (!Number.isInteger(empresaResponsavelId) || empresaResponsavelId <= 0)
    ) {
      toast.error("Selecione uma empresa válida.");

      return;
    }

    let custo: number | null = null;

    if (formulario.custo.trim()) {
      custo = Number(formulario.custo.replace(",", "."));

      if (!Number.isFinite(custo) || custo < 0) {
        toast.error("Informe um custo válido.");

        return;
      }
    }

    let previsaoRetorno: string | null = null;

    if (formulario.previsaoRetorno) {
      const data = new Date(formulario.previsaoRetorno);

      if (Number.isNaN(data.getTime())) {
        toast.error("Informe uma previsão de retorno válida.");

        return;
      }

      previsaoRetorno = data.toISOString();
    }

    try {
      setSalvando(true);

      await manutencaoService.abrir({
        equipamentoId: equipamento.id,
        problemaInformado: problema,

        localManutencao: formulario.localManutencao.trim() || null,

        empresaResponsavelId,

        previsaoRetorno,
        custo,

        observacoes: formulario.observacoes.trim() || null,
      });

      toast.success("Manutenção aberta com sucesso.");

      setFormulario(formularioInicial);
      setGarantia(null);

      await onSucesso?.();

      onFechar();
    } catch (error) {
      console.error("Erro ao abrir manutenção:", error);

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
        aria-labelledby="titulo-abrir-manutencao"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <Wrench size={22} />
            </div>

            <div>
              <h2
                id="titulo-abrir-manutencao"
                className="text-lg font-semibold text-slate-900"
              >
                Abrir manutenção
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {equipamento?.nome}

                {equipamento?.patrimonio
                  ? ` • Patrimônio ${equipamento.patrimonio}`
                  : ""}
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
              {carregandoGarantia && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                  Consultando a garantia do equipamento...
                </div>
              )}

              {!carregandoGarantia && erroGarantia && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertTriangle size={20} className="shrink-0" />

                  <p>
                    Não foi possível consultar a garantia. Feche e abra
                    novamente o formulário.
                  </p>
                </div>
              )}

              {!carregandoGarantia && garantiaAtiva && fornecedorGarantia && (
                <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <ShieldCheck
                    size={22}
                    className="shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="font-medium text-emerald-800">
                      Equipamento na garantia
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      Garantia válida até{" "}
                      {formatarDataGarantia(garantia?.garantiaAte ?? null)}.
                      Encaminhamento obrigatório para{" "}
                      <strong>{fornecedorGarantia.nome}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {!carregandoGarantia && garantiaSemFornecedor && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertTriangle size={22} className="shrink-0 text-red-700" />

                  <div>
                    <p className="font-medium text-red-800">
                      Fornecedor não cadastrado
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      O equipamento está na garantia até{" "}
                      {formatarDataGarantia(garantia?.garantiaAte ?? null)}, mas
                      não possui fornecedor. Atualize o cadastro do equipamento
                      antes de abrir a manutenção.
                    </p>
                  </div>
                </div>
              )}

              {!carregandoGarantia &&
                garantia?.possuiGarantia &&
                !garantiaAtiva && (
                  <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle
                      size={22}
                      className="shrink-0 text-amber-700"
                    />

                    <p className="text-sm text-amber-800">
                      A garantia deste equipamento venceu em{" "}
                      {formatarDataGarantia(garantia.garantiaAte)}. A empresa
                      responsável pode ser escolhida normalmente.
                    </p>
                  </div>
                )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="problemaInformado"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Problema informado *
              </label>

              <textarea
                id="problemaInformado"
                required
                rows={3}
                disabled={salvando}
                value={formulario.problemaInformado}
                onChange={(event) =>
                  alterarCampo("problemaInformado", event.target.value)
                }
                placeholder="Descreva o problema apresentado pelo equipamento"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="localManutencao"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Local da manutenção
              </label>

              <input
                id="localManutencao"
                type="text"
                disabled={salvando}
                value={formulario.localManutencao}
                onChange={(event) =>
                  alterarCampo("localManutencao", event.target.value)
                }
                placeholder="Ex.: Assistência técnica"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="empresaResponsavelId"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Empresa responsável
              </label>

              <select
                id="empresaResponsavelId"
                disabled={
                  salvando ||
                  carregandoEmpresas ||
                  carregandoGarantia ||
                  garantiaAtiva
                }
                value={formulario.empresaResponsavelId}
                onChange={(event) =>
                  alterarCampo("empresaResponsavelId", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {carregandoEmpresas
                    ? "Carregando empresas..."
                    : "Selecione uma empresa"}
                </option>

                {fornecedorGarantia &&
                  !empresas.some(
                    (empresa) => empresa.id === fornecedorGarantia.id,
                  ) && (
                    <option value={fornecedorGarantia.id}>
                      {fornecedorGarantia.nome}
                    </option>
                  )}

                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>

              {garantiaAtiva && fornecedorGarantia && (
                <p className="mt-1 text-xs text-emerald-700">
                  Empresa definida automaticamente pelo fornecedor da garantia.
                </p>
              )}

              {!carregandoEmpresas &&
                empresas.length === 0 &&
                !fornecedorGarantia && (
                  <p className="mt-1 text-xs text-amber-600">
                    Nenhuma empresa ativa encontrada.
                  </p>
                )}
            </div>

            <div>
              <label
                htmlFor="previsaoRetorno"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Previsão de retorno
              </label>

              <input
                id="previsaoRetorno"
                type="datetime-local"
                disabled={salvando}
                value={formulario.previsaoRetorno}
                onChange={(event) =>
                  alterarCampo("previsaoRetorno", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="custo"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Custo previsto
              </label>

              <input
                id="custo"
                type="number"
                min="0"
                step="0.01"
                disabled={salvando}
                value={formulario.custo}
                onChange={(event) => alterarCampo("custo", event.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="observacoes"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                rows={3}
                disabled={salvando}
                value={formulario.observacoes}
                onChange={(event) =>
                  alterarCampo("observacoes", event.target.value)
                }
                placeholder="Informações adicionais sobre a manutenção"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
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

            <Button
              type="submit"
              disabled={
                salvando ||
                carregandoEmpresas ||
                carregandoGarantia ||
                erroGarantia ||
                garantiaSemFornecedor ||
                !equipamento
              }
            >
              {salvando ? "Abrindo..." : "Abrir manutenção"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
