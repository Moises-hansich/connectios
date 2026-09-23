import { Cpu, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { Card } from "../Card";
import { Button } from "../Button";

import type { Hardware } from "../../types/equipamento";

interface HardwareCardProps {
  hardware: Hardware;
  onEditar?: (hardware: Hardware) => void;
  onExcluir?: (hardware: Hardware) => void;
}

export function HardwareCard({
  hardware,
  onEditar,
  onExcluir,
}: HardwareCardProps) {
  const { temTodasPermissoes } = useAuth();

  const podeEditar =
    Boolean(onEditar) &&
    temTodasPermissoes("hardware.visualizar", "hardware.editar");

  const podeExcluir =
    Boolean(onExcluir) &&
    temTodasPermissoes("hardware.visualizar", "hardware.excluir");

  return (
    <Card className="rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Cpu size={22} className="text-slate-800" />

          <div>
            <h3 className="font-semibold text-slate-900">
              {hardware.tipoHardware.nome}
            </h3>

            <p className="text-sm text-slate-500">{hardware.nome}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <InfoRow label="Fabricante" value={hardware.fabricante} />
        <InfoRow label="Modelo" value={hardware.modelo} />
        <InfoRow label="Número de série" value={hardware.numeroSerie} />
      </div>

      {hardware.valores.length > 0 && (
        <>
          <div className="my-5 border-t border-slate-200" />

          <div className="space-y-3">
            {hardware.valores.map((valor) => (
              <InfoRow
                key={valor.id}
                label={valor.campoHardware.nome}
                value={
                  valor.campoHardware.unidade
                    ? `${valor.valor} ${valor.campoHardware.unidade}`
                    : valor.valor
                }
              />
            ))}
          </div>
        </>
      )}

      {hardware.observacoes && (
        <>
          <div className="my-5 border-t border-slate-200" />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Observações
            </p>

            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {hardware.observacoes}
            </p>
          </div>
        </>
      )}

      {(podeEditar || podeExcluir) && (
        <div className="mt-6 flex justify-end gap-3">
          {podeEditar && (
            <Button variant="secondary" onClick={() => onEditar?.(hardware)}>
              <Pencil size={16} />
              Editar
            </Button>
          )}

          {podeExcluir && (
            <Button variant="danger" onClick={() => onExcluir?.(hardware)}>
              <Trash2 size={16} />
              Excluir
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="break-words text-right text-sm font-semibold text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}
