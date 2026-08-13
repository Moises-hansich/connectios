import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { campoHardwareService } from "../../services/campoHardwareService";
import { tipoHardwareService } from "../../services/tipoHardwareService";

import { Button } from "../Button";
import { Input } from "../Input";

import type {
  CampoHardware,
  CriarCampoHardwareData,
  TipoHardware,
} from "../../types/hardware";

interface CampoHardwareFormProps {
  modo: "criar" | "editar";
  campoHardware?: CampoHardware;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormularioCampoHardware {
  nome: string;
  tipoDado: string;
  unidade: string;
  placeholder: string;
  obrigatorio: boolean;
  ordem: number;
  tipoHardwareId: number;
}

const formularioInicial: FormularioCampoHardware = {
  nome: "",
  tipoDado: "texto",
  unidade: "",
  placeholder: "",
  obrigatorio: false,
  ordem: 0,
  tipoHardwareId: 0,
};

export function CampoHardwareForm({
  modo,
  campoHardware,
  onCancel,
  onSuccess,
}: CampoHardwareFormProps) {
  const [formulario, setFormulario] =
    useState<FormularioCampoHardware>(formularioInicial);

  const [tiposHardware, setTiposHardware] = useState<TipoHardware[]>([]);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarTiposHardware() {
      try {
        setCarregandoTipos(true);

        const dados = await tipoHardwareService.listar();

        const tiposOrdenados = [...dados].sort(
          (tipoA, tipoB) => tipoA.ordem - tipoB.ordem,
        );

        setTiposHardware(tiposOrdenados);
      } catch (error) {
        console.error("Erro ao carregar tipos de hardware:", error);
        toast.error("Não foi possível carregar os tipos de hardware.");
      } finally {
        setCarregandoTipos(false);
      }
    }

    void carregarTiposHardware();
  }, []);

  useEffect(() => {
    if (modo === "editar" && campoHardware) {
      setFormulario({
        nome: campoHardware.nome,
        tipoDado: campoHardware.tipoDado,
        unidade: campoHardware.unidade ?? "",
        placeholder: campoHardware.placeholder ?? "",
        obrigatorio: campoHardware.obrigatorio,
        ordem: campoHardware.ordem,
        tipoHardwareId: campoHardware.tipoHardwareId,
      });

      return;
    }

    setFormulario(formularioInicial);
  }, [modo, campoHardware]);

  function atualizarCampo<K extends keyof FormularioCampoHardware>(
    campo: K,
    valor: FormularioCampoHardware[K],
  ) {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  function validarFormulario(): boolean {
    if (!formulario.nome.trim()) {
      toast.error("Informe o nome do campo.");
      return false;
    }

    if (!formulario.tipoDado) {
      toast.error("Selecione o tipo do campo.");
      return false;
    }
    if (formulario.unidade.trim().length > 20) {
      toast.error("A unidade deve possuir no máximo 20 caracteres.");
      return false;
    }
    if (!formulario.tipoHardwareId) {
      toast.error("Selecione o tipo de hardware.");
      return false;
    }

    if (formulario.ordem < 0) {
      toast.error("A ordem não pode ser negativa.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const nome = formulario.nome.trim();

    const chave = nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const dados: CriarCampoHardwareData = {
      nome,
      chave,
      tipoDado: formulario.tipoDado,
      unidade: formulario.unidade.trim() || null,
      placeholder: formulario.placeholder.trim() || null,
      obrigatorio: formulario.obrigatorio,
      ordem: Number(formulario.ordem),
      tipoHardwareId: Number(formulario.tipoHardwareId),
    };

    try {
      setSalvando(true);

      if (modo === "editar" && campoHardware) {
        await campoHardwareService.atualizar(campoHardware.id, dados);

        toast.success("Campo de hardware atualizado com sucesso.");
      } else {
        await campoHardwareService.criar(dados);

        toast.success("Campo de hardware cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar campo de hardware:", error);

      toast.error(
        modo === "editar"
          ? "Não foi possível atualizar o campo de hardware."
          : "Não foi possível cadastrar o campo de hardware.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="tipoHardwareId"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Tipo de hardware *
        </label>

        <select
          id="tipoHardwareId"
          value={formulario.tipoHardwareId}
          disabled={carregandoTipos || salvando}
          onChange={(event) =>
            atualizarCampo("tipoHardwareId", Number(event.target.value))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value={0}>
            {carregandoTipos
              ? "Carregando tipos..."
              : "Selecione um tipo de hardware"}
          </option>

          {tiposHardware.map((tipoHardware) => (
            <option key={tipoHardware.id} value={tipoHardware.id}>
              {tipoHardware.nome}
            </option>
          ))}
        </select>

        {!carregandoTipos && tiposHardware.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            Cadastre um tipo de hardware antes de criar campos.
          </p>
        )}
      </div>

      <Input
        label="Nome do campo *"
        name="nome"
        placeholder="Ex.: Memória RAM"
        value={formulario.nome}
        disabled={salvando}
        onChange={(event) => atualizarCampo("nome", event.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="tipoDado"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tipo do campo *
          </label>

          <select
            id="tipoDado"
            value={formulario.tipoDado}
            disabled={salvando}
            onChange={(event) => atualizarCampo("tipoDado", event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="texto">Texto</option>
            <option value="numero">Número</option>
            <option value="data">Data</option>
            <option value="booleano">Sim ou não</option>
            <option value="lista">Lista de opções</option>
          </select>
        </div>

        <Input
          label="Unidade de medida"
          name="unidade"
          type="text"
          maxLength={20}
          placeholder="Ex.: GB, TB, MHz, GHz, W"
          value={formulario.unidade}
          disabled={salvando}
          onChange={(event) => atualizarCampo("unidade", event.target.value)}
        />

        <Input
          label="Exemplo de preenchimento"
          name="placeholder"
          type="text"
          maxLength={100}
          placeholder="Ex.: 16"
          value={formulario.placeholder}
          disabled={salvando}
          onChange={(event) =>
            atualizarCampo("placeholder", event.target.value)
          }
        />

        <Input
          label="Ordem"
          name="ordem"
          type="number"
          min={0}
          value={formulario.ordem}
          disabled={salvando}
          onChange={(event) =>
            atualizarCampo("ordem", Number(event.target.value))
          }
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={formulario.obrigatorio}
          disabled={salvando}
          onChange={(event) =>
            atualizarCampo("obrigatorio", event.target.checked)
          }
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />

        <div>
          <span className="block text-sm font-medium text-slate-800">
            Campo obrigatório
          </span>

          <span className="block text-xs text-slate-500">
            O usuário deverá preencher este campo ao cadastrar um hardware.
          </span>
        </div>
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <Button
          type="button"
          variant="secondary"
          disabled={salvando}
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={salvando || carregandoTipos || tiposHardware.length === 0}
        >
          {salvando
            ? "Salvando..."
            : modo === "editar"
              ? "Salvar alterações"
              : "Cadastrar campo"}
        </Button>
      </div>
    </form>
  );
}
