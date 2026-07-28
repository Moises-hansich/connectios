import { Modal } from "../Modal";
import { CampoHardwareForm } from "./CampoHardwareForm";

import type { CampoHardware } from "../../types/hardware";

interface CampoHardwareModalProps {
  aberto: boolean;
  campoHardware: CampoHardware | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CampoHardwareModal({
  aberto,
  campoHardware,
  onClose,
  onSuccess,
}: CampoHardwareModalProps) {
  return (
    <Modal
      aberto={aberto}
      titulo={
        campoHardware ? "Editar Campo de Hardware" : "Novo Campo de Hardware"
      }
      onClose={onClose}
    >
      <CampoHardwareForm
        modo={campoHardware ? "editar" : "criar"}
        campoHardware={campoHardware ?? undefined}
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
