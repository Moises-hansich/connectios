import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onClose: () => void;
  tamanho?: "sm" | "md" | "lg";
}

const tamanhos = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function Modal({
  aberto,
  titulo,
  children,
  onClose,
  tamanho = "md",
}: ModalProps) {
  useEffect(() => {
    if (!aberto) {
      return;
    }

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", fecharComEsc);

    return () => {
      document.body.style.overflow = overflowOriginal;
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [aberto, onClose]);

  if (!aberto) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[1px]"
      />

      <div
        className={`
          relative z-[101]
          flex max-h-[95vh] w-full flex-col
          rounded-t-2xl bg-white shadow-2xl
          sm:max-h-[90vh] sm:rounded-2xl
          ${tamanhos[tamanho]}
        `}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2
            id="modal-titulo"
            className="pr-4 text-lg font-semibold text-slate-900 sm:text-xl"
          >
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg text-slate-500 transition
              hover:bg-slate-100 hover:text-slate-900
              active:bg-slate-200
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
