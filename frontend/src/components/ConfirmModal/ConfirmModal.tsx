import { AlertTriangle } from "lucide-react";
import { Modal } from "../Modal";
import { Button } from "../Button";

interface ConfirmModalProps {
  aberto: boolean;
  titulo?: string;
  mensagem: string;
  carregando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  aberto,
  titulo = "Confirmar ação",
  mensagem,
  carregando = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal aberto={aberto} titulo={titulo} onClose={onCancel}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle size={26} className="text-red-600" />
          </div>

          <div>
            <p className="text-gray-700">{mensagem}</p>

            <p className="mt-2 text-sm text-gray-500">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>

          <Button variant="danger" onClick={onConfirm} disabled={carregando}>
            {carregando ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
