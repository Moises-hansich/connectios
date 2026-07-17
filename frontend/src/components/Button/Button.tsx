import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

const estilosPorVariant = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",

  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const estaDesabilitado = disabled || loading;

  return (
    <button
      type={type}
      disabled={estaDesabilitado}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg px-4 py-2
        text-sm font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${estilosPorVariant[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
      )}

      {children}
    </button>
  );
}
