import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  Wrench,
} from "lucide-react";

import { Button } from "../Button";
import { Modal } from "../Modal";

import type { Manutencao, StatusManutencao } from "../../types/manutencao";

interface DetalhesManutencaoModalProps {
  aberto: boolean;
  manutencao: Manutencao | null;
  onFechar: () => void;
}

interface CampoTextoProps {
  titulo: string;
  valor: string | null | undefined;
}

function formatarData(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Data inválida";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarCusto(custo: string | number | null) {
  if (custo === null || String(custo).trim() === "") {
    return "Não informado";
  }

  const valor = Number(custo);

  if (Number.isNaN(valor)) {
    return "Não informado";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function textoStatus(status: StatusManutencao) {
  return status === "EM_ANDAMENTO" ? "Em andamento" : "Finalizada";
}

function classeStatus(status: StatusManutencao) {
  return status === "EM_ANDAMENTO"
    ? "bg-amber-100 text-amber-700"
    : "bg-emerald-100 text-emerald-700";
}

function CampoTexto({ titulo, valor }: CampoTextoProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
        {valor?.trim() || "Não informado"}
      </p>
    </div>
  );
}

export function DetalhesManutencaoModal({
  aberto,
  manutencao,
  onFechar,
}: DetalhesManutencaoModalProps) {
  return (
    <Modal aberto={aberto} titulo="Detalhes da manutenção" onClose={onFechar}>
      {manutencao && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Equipamento
                </p>

                <h3 className="mt-1 break-words font-semibold text-slate-900">
                  {manutencao.equipamento.nome}
                </h3>

                <p className="text-sm text-slate-500">
                  Patrimônio:{" "}
                  {manutencao.equipamento.patrimonio || "Não informado"}
                </p>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(
                  manutencao.status,
                )}`}
              >
                {textoStatus(manutencao.status)}
              </span>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <Wrench size={18} className="text-blue-600" />
              <h4 className="font-semibold">Manutenção</h4>
            </div>

            <div className="space-y-4">
              <CampoTexto
                titulo="Problema informado"
                valor={manutencao.problemaInformado}
              />

              <CampoTexto titulo="Diagnóstico" valor={manutencao.diagnostico} />

              <CampoTexto titulo="Solução" valor={manutencao.solucao} />

              <CampoTexto titulo="Observações" valor={manutencao.observacoes} />
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <CalendarDays size={18} className="text-blue-600" />
                <h4 className="font-semibold">Datas</h4>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Saída</dt>
                  <dd className="font-medium text-slate-700">
                    {formatarData(manutencao.dataSaida)}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Previsão de retorno</dt>
                  <dd className="font-medium text-slate-700">
                    {formatarData(manutencao.previsaoRetorno)}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Retorno realizado</dt>
                  <dd className="font-medium text-slate-700">
                    {formatarData(manutencao.dataRetorno)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <ClipboardList size={18} className="text-blue-600" />
                <h4 className="font-semibold">Atendimento</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building2
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <CampoTexto
                    titulo="Empresa responsável"
                    valor={
                      manutencao.empresaResponsavel?.nome ||
                      manutencao.empresaResponsavelTexto ||
                      null
                    }
                  />
                </div>

                <div className="flex items-start gap-2">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <CampoTexto
                    titulo="Local da manutenção"
                    valor={manutencao.localManutencao}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <CircleDollarSign
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Custo
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatarCusto(manutencao.custo)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Intervenções em peças</h4>
            <p className="mt-1 text-sm text-slate-500">Técnico: {manutencao.tecnicoResponsavel?.nome || "Não informado"}</p>
            <div className="mt-3 space-y-3">
              {(manutencao.movimentacoes ?? []).filter((m) =>
                m.equipamentoId === manutencao.equipamentoId && ["INSTALACAO_PECA", "RETIRADA_PECA"].includes(m.tipo)
              ).map((m) => <div key={m.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="whitespace-pre-wrap text-slate-800">{m.observacoes}</p>
                <p className="mt-2 text-xs text-slate-500">{formatarData(m.dataHora)} · Registrado por {m.usuario?.nome || "Não informado"}</p>
              </div>)}
              {!(manutencao.movimentacoes ?? []).some((m) => ["INSTALACAO_PECA", "RETIRADA_PECA"].includes(m.tipo)) && <p className="text-sm text-slate-500">Nenhuma intervenção em peças registrada.</p>}
            </div>
          </section>
          {manutencao.status === "EM_ANDAMENTO" && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <ClipboardCheck size={19} className="mt-0.5 shrink-0" />

              <p>
                Esta manutenção ainda está em andamento. O diagnóstico, a
                solução e a data de retorno podem ser preenchidos na
                finalização.
              </p>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onFechar}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
