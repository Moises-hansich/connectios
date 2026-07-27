import { Cpu, Pencil, Trash2 } from "lucide-react";

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
  return (
    <Card className="rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Cpu size={22} className="text-blue-600" />

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

        <InfoRow label="Número de Série" value={hardware.numeroSerie} />
      </div>

      {hardware.valores.length > 0 && (
        <>
          <div className="my-5 border-t border-slate-200" />

          <div className="space-y-3">
            {hardware.valores.map((valor) => (
              <InfoRow
                key={valor.id}
                label={valor.campoHardware.nome}
                value={valor.valor}
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

            <p className="text-sm text-slate-600">{hardware.observacoes}</p>
          </div>
        </>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => onEditar?.(hardware)}>
          <Pencil size={16} />
          Editar
        </Button>

        <Button variant="danger" onClick={() => onExcluir?.(hardware)}>
          <Trash2 size={16} />
          Excluir
        </Button>
      </div>
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

      <span className="text-right text-sm font-semibold text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}
import { Cpu, Pencil, Trash2 } from "lucide-react";

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
  return (
    <Card className="rounded-xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Cpu size={24} className="text-blue-600" />

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {hardware.tipoHardware.nome}
            </h3>

            <p className="text-sm text-slate-500">{hardware.nome}</p>
          </div>
        </div>
      </div>

      {/* Informações principais */}
      <div className="mt-6 grid gap-3">
        <InfoRow label="Fabricante" value={hardware.fabricante} />

        <InfoRow label="Modelo" value={hardware.modelo} />

        <InfoRow label="Número de Série" value={hardware.numeroSerie} />
      </div>

      {/* Campos dinâmicos */}
      {hardware.valores.length > 0 && (
        <>
          <div className="my-6 border-t border-slate-200" />

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Especificações
            </h4>

            <div className="grid gap-3">
              {hardware.valores.map((valor) => (
                <InfoRow
                  key={valor.id}
                  label={valor.campoHardware.nome}
                  value={valor.valor}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Observações */}
      {hardware.observacoes && (
        <>
          <div className="my-6 border-t border-slate-200" />

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Observações
            </h4>

            <p className="text-sm leading-6 text-slate-700">
              {hardware.observacoes}
            </p>
          </div>
        </>
      )}

      {/* Ações */}
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => onEditar?.(hardware)}>
          <Pencil size={16} />
          Editar
        </Button>

        <Button variant="danger" onClick={() => onExcluir?.(hardware)}>
          <Trash2 size={16} />
          Excluir
        </Button>
      </div>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="text-sm font-semibold text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}
