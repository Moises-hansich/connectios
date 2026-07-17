import { useState } from "react";
import type { FormEvent } from "react";

import { Select } from "../Select";
import { Button } from "../Button";
import { Input } from "../Input";

import { equipamentoService } from "../../services/equipamentoService";
import type { Equipamento } from "../../types/equipamento";

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  equipamento?: Equipamento;
}

export function EquipmentForm({
  onSuccess,
  onCancel,
  modo,
  equipamento,
}: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    nome: equipamento?.nome ?? "",
    categoria: equipamento?.categoria ?? "",
    fabricante: equipamento?.fabricante ?? "",
    modelo: equipamento?.modelo ?? "",
    numeroSerie: equipamento?.numeroSerie ?? "",
    patrimonio: equipamento?.patrimonio ?? "",
    status: equipamento?.status ?? "Disponível",
    localizacao: equipamento?.localizacao ?? "",
    observacoes: equipamento?.observacoes ?? "",
  });

  const [salvando, setSalvando] = useState(false);

  function handleChange(campo: keyof typeof formData, valor: string) {
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

    try {
      setSalvando(true);

      if (modo === "editar" && equipamento) {
        await equipamentoService.atualizar(equipamento.id, formData);
      } else {
        await equipamentoService.criar(formData);
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
      alert("Erro ao salvar equipamento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        required
        value={formData.nome}
        disabled={salvando}
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <Input
        label="Categoria"
        required
        value={formData.categoria}
        disabled={salvando}
        onChange={(event) => handleChange("categoria", event.target.value)}
      />

      <Input
        label="Fabricante"
        value={formData.fabricante}
        disabled={salvando}
        onChange={(event) => handleChange("fabricante", event.target.value)}
      />

      <Input
        label="Modelo"
        value={formData.modelo}
        disabled={salvando}
        onChange={(event) => handleChange("modelo", event.target.value)}
      />

      <Input
        label="Número de série"
        value={formData.numeroSerie}
        disabled={salvando}
        onChange={(event) => handleChange("numeroSerie", event.target.value)}
      />

      <Input
        label="Patrimônio"
        value={formData.patrimonio}
        disabled={salvando}
        onChange={(event) => handleChange("patrimonio", event.target.value)}
      />

      <Select
        label="Status"
        required
        value={formData.status}
        disabled={salvando}
        onChange={(event) => handleChange("status", event.target.value)}
      >
        <option value="Disponível">Disponível</option>
        <option value="Em uso">Em uso</option>
        <option value="Em manutenção">Em manutenção</option>
        <option value="Reservado">Reservado</option>
        <option value="Baixado">Baixado</option>
      </Select>

      <Input
        label="Localização"
        value={formData.localizacao}
        disabled={salvando}
        onChange={(event) => handleChange("localizacao", event.target.value)}
      />

      <Input
        label="Observações"
        value={formData.observacoes}
        disabled={salvando}
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

        <Button type="submit" loading={salvando}>
          {modo === "editar" ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
