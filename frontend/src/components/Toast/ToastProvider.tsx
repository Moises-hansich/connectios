import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastTipo = "sucesso" | "erro" | "informacao";

interface Toast {
  id: number;
  mensagem: string;
  tipo: ToastTipo;
}

interface ToastContextData {
  mostrarToast: (mensagem: string, tipo?: ToastTipo) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

const estilosToast: Record<ToastTipo, string> = {
  sucesso: "border-green-200 bg-green-50 text-green-800",
  erro: "border-red-200 bg-red-50 text-red-800",
  informacao: "border-blue-200 bg-blue-50 text-blue-800",
};

const iconesToast: Record<ToastTipo, ReactNode> = {
  sucesso: <CheckCircle2 size={20} />,
  erro: <CircleAlert size={20} />,
  informacao: <Info size={20} />,
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removerToast = useCallback((id: number) => {
    setToasts((toastsAtuais) =>
      toastsAtuais.filter((toast) => toast.id !== id),
    );
  }, []);

  const mostrarToast = useCallback(
    (mensagem: string, tipo: ToastTipo = "informacao") => {
      const id = Date.now();

      setToasts((toastsAtuais) => [
        ...toastsAtuais,
        {
          id,
          mensagem,
          tipo,
        },
      ]);

      window.setTimeout(() => {
        removerToast(id);
      }, 4000);
    },
    [removerToast],
  );

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg
              ${estilosToast[toast.tipo]}
            `}
          >
            <div className="mt-0.5 shrink-0">{iconesToast[toast.tipo]}</div>

            <p className="flex-1 text-sm font-medium">{toast.mensagem}</p>

            <button
              type="button"
              onClick={() => removerToast(toast.id)}
              className="shrink-0 cursor-pointer rounded-md p-1 transition-colors hover:bg-black/5"
              aria-label="Fechar notificação"
            >
              <X size={17} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);

  if (!contexto) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return contexto;
}
