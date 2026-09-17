import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../Button";

import { hardwareService } from "../../services/hardwareService";
import { tipoHardwareService } from "../../services/tipoHardwareService";
import { campoHardwareService } from "../../services/campoHardwareService";
import { hardwareValorService } from "../../services/hardwareValorService";

import type {
  CampoHardware,
  Hardware,
  TipoHardware,
} from "../../types/hardware";

interface HardwareFormProps {
  equipamentoId: number;
  hardware?: Hardware | null;
  onSucesso: () => void | Promise<void>;
  onCancelar: () => void;
}

interface HardwareFormData {
  nome: string;
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  observacoes: string;
  tipoHardwareId: string;
}

type ValoresDinamicos = Record<number, string>;

const estadoInicial: HardwareFormData = {
  nome: "",
  fabricante: "",
  modelo: "",
  numeroSerie: "",
  observacoes: "",
  tipoHardwareId: "",
};

export function HardwareForm({
  equipamentoId,
  hardware,
  onSucesso,
  onCancelar,
}: HardwareFormProps) {
  const editando = Boolean(hardware);

  const [formData, setFormData] =
    useState<HardwareFormData>(estadoInicial);

  const [tiposHardware, setTiposHardware] = useState<TipoHardware[]>([]);
  const [camposHardware, setCamposHardware] = useState<CampoHardware[]>([]);
  const [valoresDinamicos, setValoresDinamicos] =
    useState<ValoresDinamicos>({});

  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [carregandoCampos, setCarregandoCampos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const tipoSelecionadoId = Number(formData.tipoHardwareId);

  const tipoSelecionado = useMemo(() => {
    return tiposHardware.find(
      (tipo) => tipo.id === tipoSelecionadoId,
    );
  }, [tiposHardware, tipoSelecionadoId]);

  useEffect(() => {
    carregarTiposHardware();
  }, []);

  useEffect(() => {
    preencherFormularioEdicao();
  }, [hardware]);

  useEffect(() => {
    if (!tipoSelecionadoId) {
      setCamposHardware([]);
      return;
    }

    carregarCamposDoTipo(tipoSelecionadoId);
  }, [tipoSelecionadoId]);

  async function carregarTiposHardware() {
    try {
      setCarregandoTipos(true);

      const dados = await tipoHardwareService.listar();

      const tiposOrdenados = [...dados].sort(
        (tipoA, tipoB) => tipoA.ordem - tipoB.ordem,
      );

      setTiposHardware(tiposOrdenados);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os tipos de hardware.");
    } finally {
      setCarregandoTipos(false);
    }
  }

  function preencherFormularioEdicao() {
    if (!hardware) {
      setFormData(estadoInicial);
      setValoresDinamicos({});
      return;
    }

    setFormData({
      nome: hardware.nome ?? "",
      fabricante: hardware.fabricante ?? "",
      modelo: hardware.modelo ?? "",
      numeroSerie: hardware.numeroSerie ?? "",
      observacoes: hardware.observacoes ?? "",
      tipoHardwareId: String(hardware.tipoHardwareId),
    });

    const valoresPreenchidos: ValoresDinamicos = {};

    hardware.valores?.forEach((hardwareValor) => {
      valoresPreenchidos[hardwareValor.campoHardwareId] =
        hardwareValor.valor ?? "";
    });

    setValoresDinamicos(valoresPreenchidos);
  }

  async function carregarCamposDoTipo(tipoHardwareId: number) {
    try {
      setCarregandoCampos(true);

      const dados =
        await campoHardwareService.listarPorTipo(tipoHardwareId);

      setCamposHardware(dados);

      setValoresDinamicos((valoresAtuais) => {
        const novosValores: ValoresDinamicos = {};

        dados.forEach((campo) => {
          novosValores[campo.id] = valoresAtuais[campo.id] ?? "";
        });

        return novosValores;
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os campos do hardware.");
      setCamposHardware([]);
    } finally {
      setCarregandoCampos(false);
    }
  }

  function alterarCampoPrincipal(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  }

  function alterarValorDinamico(campoId: number, valor: string) {
    setValoresDinamicos((valoresAtuais) => ({
      ...valoresAtuais,
      [campoId]: valor,
    }));
  }

  function validarFormulario(): boolean {
    if (!formData.nome.trim()) {
      toast.error("Informe o nome do hardware.");
      return false;
    }

    if (!tipoSelecionadoId) {
      toast.error("Selecione o tipo de hardware.");
      return false;
    }

    const campoObrigatorioVazio = camposHardware.find((campo) => {
      const valor = valoresDinamicos[campo.id]?.trim();

      return campo.obrigatorio && !valor;
    });

    if (campoObrigatorioVazio) {
      toast.error(
        `O campo "${campoObrigatorioVazio.nome}" é obrigatório.`,
      );

      return false;
    }

    return true;
  }

  async function salvarHardware(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setSalvando(true);

      const dadosHardware = {
        nome: formData.nome.trim(),
        fabricante: formData.fabricante.trim() || undefined,
        modelo: formData.modelo.trim() || undefined,
        numeroSerie: formData.numeroSerie.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
        equipamentoId,
        tipoHardwareId: tipoSelecionadoId,
      };

      let hardwareSalvo: Hardware;

      if (hardware) {
        hardwareSalvo = await hardwareService.atualizar(
          hardware.id,
          dadosHardware,
        );
      } else {
        hardwareSalvo = await hardwareService.criar(dadosHardware);
      }

      await salvarValoresDinamicos(hardwareSalvo.id);

      toast.success(
        editando
          ? "Hardware atualizado com sucesso."
          : "Hardware cadastrado com sucesso.",
      );

      await onSucesso();
    } catch (error) {
      console.error(error);

      toast.error(
        editando
          ? "Não foi possível atualizar o hardware."
          : "Não foi possível cadastrar o hardware.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarValoresDinamicos(hardwareId: number) {
    const valoresExistentes = hardware?.valores ?? [];

    /*
     * Quando o tipo do hardware é alterado, os valores dos campos
     * pertencentes ao tipo anterior precisam ser removidos.
     */
    const idsDosCamposAtuais = camposHardware.map((campo) => campo.id);

    const valoresQueDevemSerRemovidos = valoresExistentes.filter(
      (valorExistente) =>
        !idsDosCamposAtuais.includes(valorExistente.campoHardwareId),
    );

    for (const valorRemover of valoresQueDevemSerRemovidos) {
      await hardwareValorService.excluir(valorRemover.id);
    }

    for (const campo of camposHardware) {
      const valorDigitado = valoresDinamicos[campo.id]?.trim() ?? "";

      const valorExistente = valoresExistentes.find(
        (valor) => valor.campoHardwareId === campo.id,
      );

      if (!valorDigitado) {
        if (valorExistente) {
          await hardwareValorService.excluir(valorExistente.id);
        }

        continue;
      }

      if (valorExistente) {
        if (valorExistente.valor !== valorDigitado) {
          await hardwareValorService.atualizar(valorExistente.id, {
            valor: valorDigitado,
          });
        }

        continue;
      }

      await hardwareValorService.criar({
        hardwareId,
        campoHardwareId: campo.id,
        valor: valorDigitado,
      });
    }
  }

  return (
    <form onSubmit={salvarHardware} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {editando ? "Editar hardware" : "Adicionar hardware"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Preencha as informações do componente instalado no equipamento.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Nome"
          obrigatorio
          className="md:col-span-2"
        >
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={alterarCampoPrincipal}
            disabled={salvando}
            placeholder="Ex.: Processador principal"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Tipo de hardware" obrigatorio>
          <select
            name="tipoHardwareId"
            value={formData.tipoHardwareId}
            onChange={alterarCampoPrincipal}
            disabled={carregandoTipos || salvando}
            className={inputClassName}
          >
            <option value="">
              {carregandoTipos
                ? "Carregando tipos..."
                : "Selecione um tipo"}
            </option>

            {tiposHardware.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fabricante">
          <input
            type="text"
            name="fabricante"
            value={formData.fabricante}
            onChange={alterarCampoPrincipal}
            disabled={salvando}
            placeholder="Ex.: Intel, AMD, Kingston"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Modelo">
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={alterarCampoPrincipal}
            disabled={salvando}
            placeholder="Ex.: Core i5-12400"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Número de série">
          <input
            type="text"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={alterarCampoPrincipal}
            disabled={salvando}
            placeholder="Informe o número de série"
            className={inputClassName}
          />
        </FormField>
      </div>

      {tipoSelecionado && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-900">
              Especificações de {tipoSelecionado.nome}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Estes campos são carregados automaticamente conforme o tipo
              selecionado.
            </p>
          </div>

          {carregandoCampos ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Carregando especificações...
            </div>
          ) : camposHardware.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              Nenhum campo adicional foi cadastrado para este tipo de
              hardware.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {camposHardware.map((campo) => (
                <CampoDinamico
                  key={campo.id}
                  campo={campo}
                  valor={valoresDinamicos[campo.id] ?? ""}
                  disabled={salvando}
                  onChange={(valor) =>
                    alterarValorDinamico(campo.id, valor)
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      <FormField label="Observações">
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={alterarCampoPrincipal}
          disabled={salvando}
          rows={4}
          placeholder="Digite informações adicionais sobre o hardware"
          className={`${inputClassName} resize-y`}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancelar}
          disabled={salvando}
        >
          <X size={18} />
          Cancelar
        </Button>

        <Button type="submit" disabled={salvando || carregandoCampos}>
          {salvando ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alterações"
              : "Cadastrar hardware"}
        </Button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  obrigatorio?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  obrigatorio = false,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {obrigatorio && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

interface CampoDinamicoProps {
  campo: CampoHardware;
  valor: string;
  disabled: boolean;
  onChange: (valor: string) => void;
}

function CampoDinamico({
  campo,
  valor,
  disabled,
  onChange,
}: CampoDinamicoProps) {
  const tipo = campo.tipoDado?.trim().toLowerCase() ?? "texto";

  if (
    tipo === "textarea" ||
    tipo === "texto_longo" ||
    tipo === "texto longo"
  ) {
    return (
      <FormField
        label={campo.nome}
        obrigatorio={campo.obrigatorio}
        className="md:col-span-2"
      >
        <textarea
          value={valor}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={3}
          placeholder={campo.placeholder ?? `Informe ${campo.nome}`}
          className={`${inputClassName} resize-y`}
        />
      </FormField>
    );
  }

  if (
    tipo === "boolean" ||
    tipo === "booleano" ||
    tipo === "checkbox"
  ) {
    return (
      <div className="flex items-center rounded-lg border border-slate-200 bg-white px-4 py-3">
        <input
          id={`campo-hardware-${campo.id}`}
          type="checkbox"
          checked={valor === "true"}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.checked ? "true" : "false")
          }
          className="h-4 w-4 rounded border-slate-300"
        />

        <label
          htmlFor={`campo-hardware-${campo.id}`}
          className="ml-3 cursor-pointer"
        >
          <span className="block text-sm font-semibold text-slate-700">
            {campo.nome}

            {campo.obrigatorio && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </span>

          {campo.placeholder && (
            <span className="block text-xs text-slate-500">
              {campo.placeholder}
            </span>
          )}
        </label>
      </div>
    );
  }

  const inputType = descobrirTipoInput(tipo);

  return (
    <FormField label={campo.nome} obrigatorio={campo.obrigatorio}>
      <input
        type={inputType}
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={campo.placeholder ?? `Informe ${campo.nome}`}
        className={inputClassName}
        step={inputType === "number" ? "any" : undefined}
      />
    </FormField>
  );
}

function descobrirTipoInput(tipo: string) {
  switch (tipo) {
    case "numero":
    case "número":
    case "number":
    case "decimal":
    case "inteiro":
      return "number";

    case "data":
    case "date":
      return "date";

    case "hora":
    case "time":
      return "time";

    case "email":
      return "email";

    case "url":
      return "url";

    default:
      return "text";
  }
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";