import { Modal } from "../Modal";
import { CategoriaForm } from "./CategoriaForm";

import type { Categoria } from "../../types/equipamento";

interface CategoriaModalProps {
  aberto: boolean;
  categoria: Categoria | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoriaModal({
  aberto,
  categoria,
  onClose,
  onSuccess,
}: CategoriaModalProps) {
  return (
    <Modal
      aberto={aberto}
      titulo={categoria ? "Editar Categoria" : "Nova Categoria"}
      onClose={onClose}
    >
      <CategoriaForm
        modo={categoria ? "editar" : "criar"}
        categoria={categoria ?? undefined}
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
