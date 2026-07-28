import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        ${className}
      `}
    >
      {(title || description) && (
        <div className="border-b border-slate-200 px-6 py-5">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}

      <div className="p-6">{children}</div>
    </div>
  );
}
