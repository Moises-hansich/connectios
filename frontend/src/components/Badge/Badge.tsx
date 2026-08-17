interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  let estilo = "bg-slate-100 text-slate-700";

  if (status === "Disponível") {
    estilo = "bg-green-100 text-green-700";
  }

  if (status === "Em uso") {
    estilo = "bg-blue-100 text-blue-700";
  }

  if (status === "Em manutenção") {
    estilo = "bg-yellow-100 text-yellow-700";
  }

  if (status === "Baixado") {
    estilo = "bg-red-100 text-red-700";
  }

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold ${estilo}`}>
      {status}
    </span>
  );
}
