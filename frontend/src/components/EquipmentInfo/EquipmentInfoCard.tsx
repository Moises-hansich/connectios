import { Box, Building2, Cpu, MapPin, Package, User } from "lucide-react";

import { Card } from "../Card";
import type { Equipamento } from "../../types/equipamento";
import { Badge } from "../Badge";
interface EquipmentInfoCardProps {
  equipamento: Equipamento;
}

export function EquipmentInfoCard({ equipamento }: EquipmentInfoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-900">{equipamento.nome}</h2>

        <p className="mt-1 text-sm text-slate-500">
          Informações gerais do equipamento
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
        <InfoItem
          icon={<Cpu size={18} />}
          titulo="Categoria"
          valor={equipamento.categoria?.nome ?? "Não informado"}
        />

        <InfoItem
          icon={<Building2 size={18} />}
          titulo="Fabricante"
          valor={equipamento.fabricante}
        />

        <InfoItem
          icon={<Box size={18} />}
          titulo="Modelo"
          valor={equipamento.modelo}
        />

        <InfoItem
          icon={<Package size={18} />}
          titulo="Patrimônio"
          valor={equipamento.patrimonio}
        />

        <InfoItem
          icon={<Package size={18} />}
          titulo="Número de Série"
          valor={equipamento.numeroSerie}
        />

        <InfoItem
          icon={<MapPin size={18} />}
          titulo="Localização"
          valor={equipamento.localizacao?.nome}
        />

        <InfoItem
          icon={<User size={18} />}
          titulo="Responsável"
          valor={equipamento.responsavel?.nome}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-800">
            <Package size={18} />

            <span className="text-sm font-semibold">Status</span>
          </div>

          <Badge status={equipamento.status} />
        </div>
      </div>

      {equipamento.observacoes && (
        <div className="border-t border-slate-200 px-6 py-5">
          <h3 className="mb-2 font-semibold text-slate-800">Observações</h3>

          <p className="text-sm leading-6 text-slate-600">
            {equipamento.observacoes}
          </p>
        </div>
      )}
    </Card>
  );
}

interface InfoItemProps {
  titulo: string;
  valor?: string | null;
  icon: React.ReactNode;
}

function InfoItem({ titulo, valor, icon }: InfoItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800">
        {icon}

        <span className="text-sm font-semibold">{titulo}</span>
      </div>

      <p className="text-base font-medium text-slate-900">{valor || "-"}</p>
    </div>
  );
}
