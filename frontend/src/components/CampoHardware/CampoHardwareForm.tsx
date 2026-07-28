import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { campoHardwareService } from "../../services/campoHardwareService";
import { tipoHardwareService } from "../../services/tipoHardwareService";

import { Button } from "../Button";
import { Input } from "../Input";

import type {
  AtualizarCampoHardwareData,
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
  descricao: string;
  tipo: string;
  obrigatorio: boolean;
  ordem: number;
  tipoHardwareId: number;
}

const formularioInicial: FormularioCampoHardware = {
  nome: "",
  descricao: "",
  tipo: "texto",
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
        descricao: campoHardware.descricao ?? "",
        tipo: (campoHardware as any).tipoDado ?? "texto",
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

    if (!formulario.tipo) {
      toast.error("Selecione o tipo do campo.");
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

    try {
      setSalvando(true);

      const dados: CriarCampoHardwareData = {
        nome: formulario.nome.trim(),

        chave: formulario.nome
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, ""),

        tipoDado: formulario.tipo,

        obrigatorio: formulario.obrigatorio,

        ordem: Number(formulario.ordem),

        tipoHardwareId: Number(formulario.tipoHardwareId),

        ativo: true,

        placeholder: null,

        unidade: null,
      };
      console.log("Modo:", modo);
      console.log("CampoHardware:", campoHardware);
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

      <div>
        <label
          htmlFor="descricao"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Descrição
        </label>

        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          placeholder="Descreva a finalidade deste campo"
          value={formulario.descricao}
          disabled={salvando}
          onChange={(event) => atualizarCampo("descricao", event.target.value)}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="tipo"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tipo do campo *
          </label>

          <select
            id="tipo"
            value={formulario.tipo}
            disabled={salvando}
            onChange={(event) => atualizarCampo("tipo", event.target.value)}
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
