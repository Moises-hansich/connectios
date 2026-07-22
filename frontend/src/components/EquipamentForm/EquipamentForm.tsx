import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { Select } from "../Select";
import { Button } from "../Button";
import { Input } from "../Input";

import { equipamentoService } from "../../services/equipamentoService";
import { localizacaoService } from "../../services/localizacaoService";
import { colaboradorService } from "../../services/colaboradorService";

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

interface ColaboradorOption {
  id: number;
  nome: string;
  ativo?: boolean;
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
  responsavelId: string;
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
    responsavelId: equipamento?.responsavelId?.toString() ?? "",
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
  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);

  const [carregandoLocalizacoes, setCarregandoLocalizacoes] = useState(true);
  const [carregandoColaboradores, setCarregandoColaboradores] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(equipamento));
  }, [equipamento]);

  useEffect(() => {
    async function carregarLocalizacoes() {
      try {
        setCarregandoLocalizacoes(true);

        const dadosLocalizacoes = await localizacaoService.listar();

        setLocalizacoes(
          Array.isArray(dadosLocalizacoes) ? dadosLocalizacoes : [],
        );
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

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        setCarregandoColaboradores(true);

        const dadosColaboradores = await colaboradorService.listar();

        const lista = Array.isArray(dadosColaboradores)
          ? dadosColaboradores
          : [];

        setColaboradores(
          lista
            .filter((colaborador) => colaborador.ativo !== false)
            .map((colaborador) => ({
              id: colaborador.id,
              nome: colaborador.nome,
              ativo: colaborador.ativo,
            })),
        );
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);

        setColaboradores([]);

        toast.error("Não foi possível carregar os colaboradores.");
      } finally {
        setCarregandoColaboradores(false);
      }
    }

    void carregarColaboradores();
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

    const responsavelId =
      formData.responsavelId === ""
        ? null
        : Number.parseInt(formData.responsavelId, 10);

    if (
      localizacaoId !== null &&
      (!Number.isInteger(localizacaoId) || localizacaoId <= 0)
    ) {
      toast.error("Selecione uma localização válida.");
      return;
    }

    if (
      responsavelId !== null &&
      (!Number.isInteger(responsavelId) || responsavelId <= 0)
    ) {
      toast.error("Selecione um responsável válido.");
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
      responsavelId,
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

  const carregandoDados = carregandoLocalizacoes || carregandoColaboradores;

  const formularioDesabilitado = salvando || carregandoDados;

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

        {localizacoes.map((localizacao) => (
          <option key={localizacao.id} value={String(localizacao.id)}>
            {localizacao.nome}
          </option>
        ))}
      </Select>

      <Select
        label="Responsável"
        value={formData.responsavelId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("responsavelId", event.target.value)}
      >
        <option value="">
          {carregandoColaboradores
            ? "Carregando colaboradores..."
            : "Sem responsável"}
        </option>

        {colaboradores.map((colaborador) => (
          <option key={colaborador.id} value={String(colaborador.id)}>
            {colaborador.nome}
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

        <Button type="submit" loading={salvando} disabled={carregandoDados}>
          {modo === "editar" ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
