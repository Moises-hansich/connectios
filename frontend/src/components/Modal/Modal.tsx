import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ aberto, titulo, children, onClose }: ModalProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Fundo escuro */}
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />

      {/* Conteúdo do modal */}
      <div className="relative z-[101] max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
