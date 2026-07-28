import { Modal } from "../Modal";
import { TipoHardwareForm } from "./TipoHardwareForm";

import type { TipoHardware } from "../../types/hardware";

interface TipoHardwareModalProps {
  aberto: boolean;
  tipoHardware: TipoHardware | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TipoHardwareModal({
  aberto,
  tipoHardware,
  onClose,
  onSuccess,
}: TipoHardwareModalProps) {
  const modo = tipoHardware ? "editar" : "criar";

  return (
    <Modal
      aberto={aberto}
      titulo={
        tipoHardware ? "Editar Tipo de Hardware" : "Novo Tipo de Hardware"
      }
      onClose={onClose}
    >
      <TipoHardwareForm
        modo={modo}
        tipoHardware={tipoHardware ?? undefined}
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
