import type { Hardware } from "../../types/equipamento";

import { HardwareCard } from "./HardwareCard";

interface HardwareListProps {
  hardwares: Hardware[];
  onEditar?: (hardware: Hardware) => void;
  onExcluir?: (hardware: Hardware) => void;
}

export function HardwareList({
  hardwares,
  onEditar,
  onExcluir,
}: HardwareListProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {hardwares.map((hardware) => (
        <HardwareCard
          key={hardware.id}
          hardware={hardware}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  );
}
