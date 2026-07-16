import { Button } from "../Button";
import { Input } from "../Input";

export function EquipmentForm() {
  return (
    <form className="space-y-4">
      <Input label="Nome" placeholder="Digite o nome" />

      <Input label="Categoria" placeholder="Digite a categoria" />

      <Input label="Fabricante" placeholder="Digite o fabricante" />

      <Input label="Modelo" placeholder="Digite o modelo" />

      <Input label="Número de Série" placeholder="Digite o número de série" />

      <Input label="Patrimônio" placeholder="Digite o patrimônio" />

      <Input label="Localização" placeholder="Digite a localização" />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary">Cancelar</Button>

        <Button>Salvar</Button>
      </div>
    </form>
  );
}
