import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function Select({ label, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <select
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
      />
    </div>
  );
}
