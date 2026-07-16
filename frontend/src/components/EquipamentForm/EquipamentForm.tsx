import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "../Button";
import { Input } from "../Input";
import { equipamentoService } from "../../services/equipamentoService";

export function EquipmentForm() {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    fabricante: "",
    modelo: "",
    numeroSerie: "",
    patrimonio: "",
    status: "Disponível",
    localizacao: "",
    observacoes: "",
  });

  function handleChange(campo: string, valor: string) {
    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      console.log("Dados enviados:", formData);

      const resposta = await equipamentoService.criar(formData);

      console.log("Resposta da API:", resposta);
      alert("Equipamento cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar equipamento:", error);
      alert("Erro ao cadastrar equipamento.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        value={formData.nome}
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <Input
        label="Categoria"
        value={formData.categoria}
        onChange={(event) => handleChange("categoria", event.target.value)}
      />

      <Input
        label="Fabricante"
        value={formData.fabricante}
        onChange={(event) => handleChange("fabricante", event.target.value)}
      />

      <Input
        label="Modelo"
        value={formData.modelo}
        onChange={(event) => handleChange("modelo", event.target.value)}
      />

      <Input
        label="Número de série"
        value={formData.numeroSerie}
        onChange={(event) => handleChange("numeroSerie", event.target.value)}
      />

      <Input
        label="Patrimônio"
        value={formData.patrimonio}
        onChange={(event) => handleChange("patrimonio", event.target.value)}
      />

      <Input
        label="Status"
        value={formData.status}
        onChange={(event) => handleChange("status", event.target.value)}
      />

      <Input
        label="Localização"
        value={formData.localizacao}
        onChange={(event) => handleChange("localizacao", event.target.value)}
      />

      <Input
        label="Observações"
        value={formData.observacoes}
        onChange={(event) => handleChange("observacoes", event.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary">
          Cancelar
        </Button>

        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
