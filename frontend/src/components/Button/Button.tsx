import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-700 text-white",

    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",

    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        py-2
        font-medium
        transition
        duration-200
        cursor-pointer
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
