import { useEffect, type ReactNode } from "react";
import { Cpu, X } from "lucide-react";

interface HardwareModalProps {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onClose: () => void;
}

export function HardwareModal({
  aberto,
  titulo,
  children,
  onClose,
}: HardwareModalProps) {
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
      aria-labelledby="hardware-modal-titulo"
      className="
        fixed inset-0 z-[120]
        flex items-end justify-center
        sm:items-center sm:p-6
      "
    >
      {/* Fundo escuro */}
      <button
        type="button"
        aria-label="Fechar modal de hardware"
        onClick={onClose}
        className="
          absolute inset-0
          cursor-default
          bg-slate-950/60
          backdrop-blur-sm
        "
      />

      {/* Conteúdo */}
      <div
        className="
          relative z-[121]
          flex max-h-[95vh] w-full flex-col
          rounded-t-2xl bg-white shadow-2xl
          sm:max-h-[90vh]
          sm:max-w-5xl
          sm:rounded-2xl
        "
      >
        {/* Cabeçalho */}
        <header
          className="
            flex shrink-0 items-center justify-between
            border-b border-slate-200
            bg-slate-50
            px-4 py-4
            sm:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl bg-blue-100 text-blue-700
              "
            >
              <Cpu size={22} />
            </div>

            <div>
              <h2
                id="hardware-modal-titulo"
                className="text-lg font-bold text-slate-900 sm:text-xl"
              >
                {titulo}
              </h2>

              <p className="text-sm text-slate-500">
                Gerenciamento de hardware do equipamento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-lg text-slate-500
              transition
              hover:bg-slate-200 hover:text-slate-900
            "
          >
            <X size={20} />
          </button>
        </header>

        {/* Formulário */}
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
