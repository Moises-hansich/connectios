import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { Select } from "../Select";
import { Button } from "../Button";
import { Input } from "../Input";

import { api } from "../../services/api";
import { equipamentoService } from "../../services/equipamentoService";

import type {
  CriarEquipamentoData,
  Equipamento,
  Localizacao,
} from "../../types/equipamento";

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  equipamento?: Equipamento;
}

interface ListarLocalizacoesResponse {
  success?: boolean;
  data?: Localizacao[];
}

interface FormData {
  nome: string;
  categoria: string;
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  patrimonio: string;
  status: string;
  localizacaoId: string;
  observacoes: string;
}

function criarEstadoInicial(equipamento?: Equipamento): FormData {
  return {
    nome: equipamento?.nome ?? "",
    categoria: equipamento?.categoria ?? "",
    fabricante: equipamento?.fabricante ?? "",
    modelo: equipamento?.modelo ?? "",
    numeroSerie: equipamento?.numeroSerie ?? "",
    patrimonio: equipamento?.patrimonio ?? "",
    status: equipamento?.status ?? "Disponível",
    localizacaoId: equipamento?.localizacaoId?.toString() ?? "",
    observacoes: equipamento?.observacoes ?? "",
  };
}

export function EquipmentForm({
  onSuccess,
  onCancel,
  modo,
  equipamento,
}: EquipmentFormProps) {
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(equipamento),
  );

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [carregandoLocalizacoes, setCarregandoLocalizacoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(equipamento));
  }, [equipamento]);

  useEffect(() => {
    async function carregarLocalizacoes() {
      try {
        setCarregandoLocalizacoes(true);

        const response = await api.get<
          ListarLocalizacoesResponse | Localizacao[]
        >("/localizacoes");

        console.log("Resposta de localizações:", response.data);

        let dadosLocalizacoes: Localizacao[] = [];

        if (Array.isArray(response.data)) {
          dadosLocalizacoes = response.data;
        } else if (Array.isArray(response.data.data)) {
          dadosLocalizacoes = response.data.data;
        }

        setLocalizacoes(dadosLocalizacoes);

        if (dadosLocalizacoes.length === 0) {
          console.warn(
            "Nenhuma localização foi encontrada ou o formato da resposta é diferente.",
          );
        }
      } catch (error) {
        console.error("Erro ao carregar localizações:", error);

        setLocalizacoes([]);

        toast.error("Não foi possível carregar as localizações.");
      } finally {
        setCarregandoLocalizacoes(false);
      }
    }

    void carregarLocalizacoes();
  }, []);

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

    const localizacaoId =
      formData.localizacaoId === ""
        ? null
        : Number.parseInt(formData.localizacaoId, 10);

    if (
      localizacaoId !== null &&
      (!Number.isInteger(localizacaoId) || localizacaoId <= 0)
    ) {
      toast.error("Selecione uma localização válida.");
      return;
    }

    const dados: CriarEquipamentoData = {
      nome: formData.nome.trim(),
      categoria: formData.categoria.trim(),
      fabricante: formData.fabricante.trim(),
      modelo: formData.modelo.trim(),
      numeroSerie: formData.numeroSerie.trim(),
      patrimonio: formData.patrimonio.trim(),
      status: formData.status,
      localizacaoId,
      observacoes: formData.observacoes.trim(),
    };

    try {
      setSalvando(true);

      if (modo === "editar" && equipamento) {
        await equipamentoService.atualizar(equipamento.id, dados);

        toast.success("Equipamento atualizado com sucesso.");
      } else {
        await equipamentoService.criar(dados);

        toast.success("Equipamento cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);

      toast.error(
        modo === "editar"
          ? "Não foi possível atualizar o equipamento."
          : "Não foi possível cadastrar o equipamento.",
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
        required
        value={formData.nome}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <Input
        label="Categoria"
        required
        value={formData.categoria}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("categoria", event.target.value)}
      />

      <Input
        label="Fabricante"
        value={formData.fabricante}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("fabricante", event.target.value)}
      />

      <Input
        label="Modelo"
        value={formData.modelo}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("modelo", event.target.value)}
      />

      <Input
        label="Número de série"
        value={formData.numeroSerie}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("numeroSerie", event.target.value)}
      />

      <Input
        label="Patrimônio"
        value={formData.patrimonio}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("patrimonio", event.target.value)}
      />

      <Select
        label="Status"
        required
        value={formData.status}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("status", event.target.value)}
      >
        <option value="Disponível">Disponível</option>
        <option value="Em uso">Em uso</option>
        <option value="Em manutenção">Em manutenção</option>
        <option value="Reservado">Reservado</option>
        <option value="Baixado">Baixado</option>
      </Select>

      <Select
        label="Localização"
        value={formData.localizacaoId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("localizacaoId", event.target.value)}
      >
        <option value="">
          {carregandoLocalizacoes
            ? "Carregando localizações..."
            : "Sem localização"}
        </option>

        {Array.isArray(localizacoes) &&
          localizacoes.map((localizacao) => (
            <option key={localizacao.id} value={String(localizacao.id)}>
              {localizacao.nome}
            </option>
          ))}
      </Select>

      <Input
        label="Observações"
        value={formData.observacoes}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("observacoes", event.target.value)}
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

        <Button
          type="submit"
          loading={salvando}
          disabled={carregandoLocalizacoes}
        >
          {modo === "editar" ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
