import { type FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AlertTriangle, ShieldCheck, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../Button";
import { useAuth } from "../../hooks/useAuth";

import { empresaService } from "../../services/empresaService";
import { manutencaoService } from "../../services/manutencaoService";
import {
  usuarioService,
  type TecnicoOption,
} from "../../services/usuarioService";

import type { Empresa } from "../../types/empresa";
import type {
  GarantiaEquipamento,
  TipoManutencao,
} from "../../types/manutencao";

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
  tipo: TipoManutencao;
  tecnicoResponsavelId: string;
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
  tipo: "INTERNA",
  tecnicoResponsavelId: "",
  problemaInformado: "",
  localManutencao: "",
  empresaResponsavelId: "",
  previsaoRetorno: "",
  custo: "",
  observacoes: "",
};

const classeCampo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const classeLabel = "mb-1 block text-sm font-medium text-slate-700";

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError<ErroApi>(error)) {
    const dados = error.response?.data;

    for (const mensagem of [dados?.mensagem, dados?.message, dados?.erro]) {
      if (typeof mensagem === "string" && mensagem.trim()) {
        return mensagem;
      }
    }
  }

  return "Não foi possível abrir a manutenção.";
}

function formatarDataGarantia(valor: string | null): string {
  if (!valor) return "Não informada";

  const [ano, mes, dia] = valor.slice(0, 10).split("-");

  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "Data inválida";
}

// Monta um formulário novo a cada abertura, equipamento ou alteração
// das permissões relevantes, evitando reaproveitar seleções antigas.
export function AbrirManutencaoModal({
  aberto,
  equipamento,
  onFechar,
  onSucesso,
}: AbrirManutencaoModalProps) {
  const {
    autenticado,
    carregando,
    carregandoPermissoes,
    erroPermissoes,
    temPermissao,
    temTodasPermissoes,
  } = useAuth();

  if (!aberto) return null;

  const verificando = carregando || carregandoPermissoes;

  const podeAbrir =
    autenticado &&
    !verificando &&
    !erroPermissoes &&
    temTodasPermissoes(
      "equipamentos.visualizar",
      "manutencoes.visualizar",
      "manutencoes.abrir",
    );

  if (verificando || !podeAbrir || !equipamento) {
    const mensagem = verificando
      ? "Verificando permissões..."
      : erroPermissoes
        ? "Não foi possível verificar suas permissões."
        : !podeAbrir
          ? "Você não possui permissão para abrir manutenções."
          : "Selecione um equipamento.";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-aviso-manutencao"
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        >
          <h2
            id="titulo-aviso-manutencao"
            className="text-lg font-semibold text-slate-900"
          >
            Cadastrar manutenção
          </h2>

          <p role="status" className="mt-3 text-sm text-slate-600">
            {mensagem}
          </p>

          <div className="mt-5 flex justify-end">
            <Button type="button" variant="secondary" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const podeVerEmpresas = temPermissao("empresas.visualizar");

  return (
    <FormularioAbertura
      key={`${equipamento.id}-${podeVerEmpresas}`}
      equipamento={equipamento}
      podeVerEmpresas={podeVerEmpresas}
      onFechar={onFechar}
      onSucesso={onSucesso}
    />
  );
}

interface FormularioAberturaProps {
  equipamento: EquipamentoSelecionado;
  podeVerEmpresas: boolean;
  onFechar: () => void;
  onSucesso?: (() => void | Promise<void>) | undefined;
}

function FormularioAbertura({
  equipamento,
  podeVerEmpresas,
  onFechar,
  onSucesso,
}: FormularioAberturaProps) {
  const [formulario, setFormulario] = useState<FormularioManutencao>({
    ...formularioInicial,
  });

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoOption[]>([]);

  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);
  const [carregandoTecnicos, setCarregandoTecnicos] = useState(true);

  const [erroEmpresas, setErroEmpresas] = useState(false);
  const [erroTecnicos, setErroTecnicos] = useState(false);

  const [garantia, setGarantia] = useState<GarantiaEquipamento | null>(null);
  const [carregandoGarantia, setCarregandoGarantia] = useState(true);
  const [erroGarantia, setErroGarantia] = useState(false);

  const [tentativaCarga, setTentativaCarga] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const envioEmAndamento = useRef(false);
  const montadoRef = useRef(false);

  const equipamentoId = equipamento.id;
  const interna = formulario.tipo === "INTERNA";
  const garantiaAtiva = garantia?.garantiaAtiva === true;
  const fornecedorGarantia = garantia?.fornecedor ?? null;

  const fornecedorObrigatorio = !interna && garantiaAtiva;

  const fornecedorCadastrado = garantia?.fornecedorCadastrado === true;
  const fornecedorAtivo = garantia?.fornecedorAtivo === true;

  const fornecedorInvalido =
    fornecedorObrigatorio && (!fornecedorCadastrado || !fornecedorAtivo);

  const deveConsultarEmpresas =
    !interna &&
    podeVerEmpresas &&
    !carregandoGarantia &&
    !erroGarantia &&
    garantia !== null &&
    !garantiaAtiva;

  const empresaSelecionada = !podeVerEmpresas
    ? ""
    : fornecedorObrigatorio && fornecedorGarantia
      ? String(fornecedorGarantia.id)
      : formulario.empresaResponsavelId;

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    setGarantia(null);
    setErroGarantia(false);
    setCarregandoGarantia(true);

    async function carregarGarantia() {
      try {
        const dados = await manutencaoService.consultarGarantia(equipamentoId);

        if (ativo) {
          setGarantia(dados);
        }
      } catch (error) {
        console.error("Erro ao consultar garantia:", error);

        if (ativo) {
          setErroGarantia(true);
        }
      } finally {
        if (ativo) {
          setCarregandoGarantia(false);
        }
      }
    }

    void carregarGarantia();

    return () => {
      ativo = false;
    };
  }, [equipamentoId, tentativaCarga]);

  useEffect(() => {
    if (!interna) return;

    let ativo = true;

    setCarregandoTecnicos(true);
    setErroTecnicos(false);
    setTecnicos([]);

    async function carregarTecnicos() {
      try {
        const dados = await usuarioService.listarTecnicos();

        if (!Array.isArray(dados)) {
          throw new Error("Resposta inválida ao listar técnicos.");
        }

        if (ativo) {
          setTecnicos(
            [...dados].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
          );
        }
      } catch (error) {
        console.error("Erro ao carregar técnicos:", error);

        if (ativo) {
          setErroTecnicos(true);
        }
      } finally {
        if (ativo) {
          setCarregandoTecnicos(false);
        }
      }
    }

    void carregarTecnicos();

    return () => {
      ativo = false;
    };
  }, [interna, tentativaCarga]);

  useEffect(() => {
    if (!deveConsultarEmpresas) {
      setEmpresas([]);
      setErroEmpresas(false);
      setCarregandoEmpresas(false);
      return;
    }

    let ativo = true;

    setCarregandoEmpresas(true);
    setErroEmpresas(false);
    setEmpresas([]);

    async function carregarEmpresas() {
      try {
        const dados = await empresaService.listarAtivas();

        if (!Array.isArray(dados)) {
          throw new Error("Resposta inválida ao listar empresas.");
        }

        if (ativo) {
          setEmpresas(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);

        if (ativo) {
          setErroEmpresas(true);
        }
      } finally {
        if (ativo) {
          setCarregandoEmpresas(false);
        }
      }
    }

    void carregarEmpresas();

    return () => {
      ativo = false;
    };
  }, [deveConsultarEmpresas, tentativaCarga]);

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !envioEmAndamento.current) {
        onFechar();
      }
    }

    window.addEventListener("keydown", fecharComEscape);

    return () => {
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [onFechar]);

  function alterarCampo<K extends keyof FormularioManutencao>(
    campo: K,
    valor: FormularioManutencao[K],
  ) {
    if (envioEmAndamento.current) return;

    if (
      campo === "empresaResponsavelId" &&
      (!podeVerEmpresas || fornecedorObrigatorio)
    ) {
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function alterarTipo(tipo: TipoManutencao) {
    if (envioEmAndamento.current || tipo === formulario.tipo) {
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      tipo,
      tecnicoResponsavelId: "",
      empresaResponsavelId: "",
    }));

    if (tipo === "INTERNA") {
      setCarregandoTecnicos(true);
      setErroTecnicos(false);
    } else {
      setCarregandoEmpresas(
        podeVerEmpresas &&
          !carregandoGarantia &&
          !erroGarantia &&
          garantia !== null &&
          !garantiaAtiva,
      );
      setErroEmpresas(false);
    }
  }

  function tentarNovamente() {
    if (envioEmAndamento.current) return;

    setCarregandoGarantia(true);
    setErroGarantia(false);

    if (interna) {
      setCarregandoTecnicos(true);
      setErroTecnicos(false);
    }

    setErroEmpresas(false);
    setTentativaCarga((anterior) => anterior + 1);
  }

  function fecharModal() {
    if (!envioEmAndamento.current) {
      onFechar();
    }
  }

  let motivoBloqueio: string | null = null;

  if (interna) {
    if (carregandoTecnicos) {
      motivoBloqueio = "Carregando técnicos...";
    } else if (erroTecnicos) {
      motivoBloqueio = "Não foi possível carregar os técnicos.";
    } else if (tecnicos.length === 0) {
      motivoBloqueio = "Nenhum usuário ativo disponível como técnico.";
    } else if (
      !tecnicos.some(
        (tecnico) => tecnico.id === Number(formulario.tecnicoResponsavelId),
      )
    ) {
      motivoBloqueio = "Selecione o técnico responsável.";
    }
  } else if (carregandoGarantia) {
    motivoBloqueio = "Consultando a garantia...";
  } else if (erroGarantia || !garantia) {
    motivoBloqueio = "Consulte a garantia antes de continuar.";
  } else if (fornecedorInvalido) {
    motivoBloqueio = "Regularize o fornecedor da garantia antes de continuar.";
  } else if (deveConsultarEmpresas && carregandoEmpresas) {
    motivoBloqueio = "Carregando empresas...";
  } else if (deveConsultarEmpresas && erroEmpresas) {
    motivoBloqueio = "Não foi possível carregar as empresas.";
  } else if (
    deveConsultarEmpresas &&
    formulario.empresaResponsavelId &&
    !empresas.some(
      (empresa) => empresa.id === Number(formulario.empresaResponsavelId),
    )
  ) {
    motivoBloqueio = "Selecione uma empresa disponível ou deixe sem vínculo.";
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (envioEmAndamento.current) return;

    if (motivoBloqueio) {
      toast.error(motivoBloqueio);
      return;
    }

    const problema = formulario.problemaInformado.trim();

    if (problema.length < 5) {
      toast.error("Informe o problema com pelo menos 5 caracteres.");
      return;
    }

    const tecnicoResponsavelId = interna
      ? Number(formulario.tecnicoResponsavelId)
      : null;

    // Em garantia, o backend obtém o fornecedor do equipamento.
    // Sem acesso às empresas, não envia seleção manual.
    const empresaResponsavelId =
      interna || fornecedorObrigatorio || !podeVerEmpresas
        ? null
        : formulario.empresaResponsavelId
          ? Number(formulario.empresaResponsavelId)
          : null;

    if (
      tecnicoResponsavelId !== null &&
      (!Number.isSafeInteger(tecnicoResponsavelId) || tecnicoResponsavelId <= 0)
    ) {
      toast.error("Selecione um técnico válido.");
      return;
    }

    if (
      empresaResponsavelId !== null &&
      (!Number.isSafeInteger(empresaResponsavelId) || empresaResponsavelId <= 0)
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
        toast.error("Informe uma previsão válida.");
        return;
      }

      if (data.getTime() < Date.now()) {
        toast.error("A previsão não pode estar no passado.");
        return;
      }

      previsaoRetorno = data.toISOString();
    }

    envioEmAndamento.current = true;
    setSalvando(true);

    try {
      await manutencaoService.abrir({
        equipamentoId: equipamento.id,
        tipo: formulario.tipo,
        tecnicoResponsavelId,
        problemaInformado: problema,
        localManutencao: formulario.localManutencao.trim() || null,
        empresaResponsavelId,
        previsaoRetorno,
        custo,
        observacoes: formulario.observacoes.trim() || null,
      });
    } catch (error) {
      console.error("Erro ao abrir manutenção:", error);
      toast.error(obterMensagemErro(error));

      envioEmAndamento.current = false;

      if (montadoRef.current) {
        setSalvando(false);
      }

      return;
    }

    toast.success("Manutenção aberta com sucesso.");

    try {
      await onSucesso?.();
    } catch (error) {
      console.error("Erro ao atualizar a listagem:", error);

      toast.warning(
        "A manutenção foi salva, mas a listagem não foi atualizada. Atualize a página.",
      );
    } finally {
      envioEmAndamento.current = false;

      if (montadoRef.current) {
        setSalvando(false);
        onFechar();
      }
    }
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
                Cadastrar manutenção
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {equipamento.nome}
                {equipamento.patrimonio
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
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviarFormulario}>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="tipoManutencao" className={classeLabel}>
                Tipo de manutenção *
              </label>

              <select
                id="tipoManutencao"
                value={formulario.tipo}
                disabled={salvando}
                onChange={(event) => {
                  const tipo = event.target.value;

                  if (tipo === "INTERNA" || tipo === "EXTERNA") {
                    alterarTipo(tipo);
                  }
                }}
                className={classeCampo}
              >
                <option value="INTERNA">Interna — equipe de TI</option>
                <option value="EXTERNA">Externa — assistência técnica</option>
              </select>

              <p className="mt-2 text-xs text-slate-500">
                {interna
                  ? "Atendimento pela TI. O equipamento mantém seu responsável e sua localização."
                  : "Encaminhamento para assistência. O responsável e a localização serão restaurados no retorno."}
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              {carregandoGarantia && (
                <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                  Consultando a garantia do equipamento...
                </p>
              )}

              {!carregandoGarantia && erroGarantia && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Não foi possível consultar a garantia.
                  {interna
                    ? " O atendimento interno pode ser registrado."
                    : " Tente novamente antes de registrar o envio externo."}
                </div>
              )}

              {!carregandoGarantia && garantiaAtiva && (
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
                      Válida até{" "}
                      {formatarDataGarantia(garantia?.garantiaAte ?? null)}.
                      {interna
                        ? " O atendimento interno será registrado sem encaminhamento obrigatório ao fornecedor."
                        : fornecedorCadastrado
                          ? podeVerEmpresas && fornecedorGarantia
                            ? ` Encaminhamento para ${fornecedorGarantia.nome}.`
                            : " O fornecedor vinculado será definido automaticamente na abertura."
                          : " Nenhum fornecedor cadastrado."}
                    </p>
                  </div>
                </div>
              )}

              {fornecedorInvalido && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertTriangle size={20} className="shrink-0" />

                  <p>
                    {!fornecedorCadastrado
                      ? "Cadastre o fornecedor do equipamento para abrir a manutenção externa em garantia."
                      : "O fornecedor da garantia está inativo. Regularize seu cadastro para continuar."}
                  </p>
                </div>
              )}

              {!carregandoGarantia &&
                garantia?.possuiGarantia &&
                !garantiaAtiva && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    A garantia venceu em{" "}
                    {formatarDataGarantia(garantia.garantiaAte)}.
                  </p>
                )}

              {!carregandoGarantia && garantia && !garantia.possuiGarantia && (
                <p className="text-sm text-slate-500">
                  Garantia não informada no cadastro do equipamento.
                </p>
              )}

              {(erroGarantia ||
                (interna
                  ? erroTecnicos
                  : deveConsultarEmpresas && erroEmpresas)) && (
                <button
                  type="button"
                  disabled={salvando}
                  onClick={tentarNovamente}
                  className="text-sm font-medium text-blue-700 underline disabled:opacity-50"
                >
                  Tentar carregar novamente
                </button>
              )}
            </div>

            {interna ? (
              <div className="md:col-span-2">
                <label htmlFor="tecnicoResponsavelId" className={classeLabel}>
                  Técnico responsável *
                </label>

                <select
                  id="tecnicoResponsavelId"
                  required
                  disabled={salvando || carregandoTecnicos || erroTecnicos}
                  value={formulario.tecnicoResponsavelId}
                  onChange={(event) =>
                    alterarCampo("tecnicoResponsavelId", event.target.value)
                  }
                  className={classeCampo}
                >
                  <option value="">
                    {carregandoTecnicos
                      ? "Carregando técnicos..."
                      : "Selecione o técnico"}
                  </option>

                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  Selecione o usuário que executará o atendimento.
                </p>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label htmlFor="empresaResponsavelId" className={classeLabel}>
                  Empresa responsável
                </label>

                <select
                  id="empresaResponsavelId"
                  disabled={
                    salvando ||
                    !podeVerEmpresas ||
                    carregandoEmpresas ||
                    erroEmpresas ||
                    carregandoGarantia ||
                    erroGarantia ||
                    fornecedorObrigatorio
                  }
                  value={empresaSelecionada}
                  onChange={(event) =>
                    alterarCampo("empresaResponsavelId", event.target.value)
                  }
                  className={classeCampo}
                >
                  <option value="">
                    {carregandoGarantia
                      ? "Consultando a garantia..."
                      : !podeVerEmpresas
                        ? fornecedorObrigatorio
                          ? "Fornecedor da garantia definido automaticamente"
                          : "Sem empresa vinculada"
                        : carregandoEmpresas
                          ? "Carregando empresas..."
                          : "Sem empresa vinculada"}
                  </option>

                  {podeVerEmpresas &&
                    fornecedorObrigatorio &&
                    fornecedorGarantia &&
                    !empresas.some(
                      (empresa) => empresa.id === fornecedorGarantia.id,
                    ) && (
                      <option value={fornecedorGarantia.id}>
                        {fornecedorGarantia.nome}
                      </option>
                    )}

                  {podeVerEmpresas &&
                    empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </option>
                    ))}
                </select>

                {fornecedorObrigatorio ? (
                  <p className="mt-1 text-xs text-emerald-700">
                    Empresa definida automaticamente pelo fornecedor da
                    garantia.
                  </p>
                ) : !podeVerEmpresas ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Você não possui permissão para consultar empresas. Fora da
                    garantia, a manutenção será registrada sem empresa
                    vinculada.
                  </p>
                ) : null}
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="problemaInformado" className={classeLabel}>
                Problema informado *
              </label>

              <textarea
                id="problemaInformado"
                required
                minLength={5}
                rows={3}
                disabled={salvando}
                value={formulario.problemaInformado}
                onChange={(event) =>
                  alterarCampo("problemaInformado", event.target.value)
                }
                placeholder="Descreva o problema apresentado"
                className={`${classeCampo} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="localManutencao" className={classeLabel}>
                {interna ? "Local do atendimento" : "Local da assistência"}
              </label>

              <input
                id="localManutencao"
                type="text"
                disabled={salvando}
                value={formulario.localManutencao}
                onChange={(event) =>
                  alterarCampo("localManutencao", event.target.value)
                }
                placeholder={
                  interna ? "Ex.: Sala TI" : "Ex.: Assistência técnica"
                }
                className={classeCampo}
              />
            </div>

            <div>
              <label htmlFor="previsaoRetorno" className={classeLabel}>
                {interna ? "Previsão de conclusão" : "Previsão de retorno"}
              </label>

              <input
                id="previsaoRetorno"
                type="datetime-local"
                disabled={salvando}
                value={formulario.previsaoRetorno}
                onChange={(event) =>
                  alterarCampo("previsaoRetorno", event.target.value)
                }
                className={classeCampo}
              />
            </div>

            <div>
              <label htmlFor="custo" className={classeLabel}>
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
                className={classeCampo}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="observacoes" className={classeLabel}>
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
                placeholder="Informações adicionais sobre o atendimento"
                className={`${classeCampo} resize-none`}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 p-5">
            {motivoBloqueio && (
              <p role="status" className="mb-3 text-sm text-amber-700">
                {motivoBloqueio}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={salvando}
                onClick={fecharModal}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={salvando || motivoBloqueio !== null}
              >
                {salvando ? "Salvando..." : "Cadastrar manutenção"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
