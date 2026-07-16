import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <input
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        {...props}
      />
    </div>
  );
}
