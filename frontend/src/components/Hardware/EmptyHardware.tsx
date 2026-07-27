import { Cpu, Plus } from "lucide-react";

import { Button } from "../Button";

interface EmptyHardwareProps {
  onAdicionar?: () => void;
}

export function EmptyHardware({ onAdicionar }: EmptyHardwareProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <Cpu size={40} className="text-slate-400" />
      </div>

      <h3 className="text-xl font-semibold text-slate-800">
        Nenhum hardware cadastrado
      </h3>

      <p className="mx-auto mt-3 max-w-md text-slate-500">
        Este equipamento ainda não possui nenhum hardware cadastrado. Clique no
        botão abaixo para adicionar o primeiro componente.
      </p>

      <Button className="mt-8" onClick={onAdicionar}>
        <Plus size={18} />
        Adicionar Hardware
      </Button>
    </div>
  );
}
