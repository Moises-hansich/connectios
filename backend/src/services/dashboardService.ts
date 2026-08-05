import { DashboardRepository } from "../repositories/dashboardRepository";

const DIAS_AVISO_GARANTIA = 30;
const MILISSEGUNDOS_DIA = 24 * 60 * 60 * 1000;
const FUSO_HORARIO = "America/Sao_Paulo";

function obterDataCalendarioBrasil(data: Date): Date {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const ano = Number(partes.find((parte) => parte.type === "year")?.value);

  const mes = Number(partes.find((parte) => parte.type === "month")?.value);

  const dia = Number(partes.find((parte) => parte.type === "day")?.value);

  return new Date(Date.UTC(ano, mes - 1, dia));
}

function obterDataGarantia(data: Date): Date {
  return new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()),
  );
}

export class DashboardService {
  constructor(private repository = new DashboardRepository()) {}

  async obterDashboard() {
    const dataInicial = obterDataCalendarioBrasil(new Date());

    const dataFinal = new Date(dataInicial.getTime());

    dataFinal.setUTCDate(dataFinal.getUTCDate() + DIAS_AVISO_GARANTIA);

    dataFinal.setUTCHours(23, 59, 59, 999);

    const [
      total,
      emUso,
      manutencao,
      disponivel,
      categorias,
      status,
      ultimos,
      garantiasVencendo,
    ] = await Promise.all([
      this.repository.contarEquipamentos(),
      this.repository.contarPorStatus("Em uso"),
      this.repository.contarPorStatus("Em manutenção"),
      this.repository.contarPorStatus("Disponível"),
      this.repository.buscarCategorias(),
      this.repository.buscarStatus(),
      this.repository.buscarUltimosEquipamentos(),
      this.repository.buscarGarantiasVencendo(dataInicial, dataFinal),
    ]);

    const itensGarantia = garantiasVencendo.map((equipamento) => {
      const garantiaAte = equipamento.garantiaAte!;

      const diasRestantes = Math.max(
        0,
        Math.round(
          (obterDataGarantia(garantiaAte).getTime() - dataInicial.getTime()) /
            MILISSEGUNDOS_DIA,
        ),
      );

      return {
        ...equipamento,
        diasRestantes,
      };
    });

    return {
      cards: {
        total,
        emUso,
        manutencao,
        disponivel,
      },

      categorias,
      status,
      ultimos,

      garantias: {
        diasAviso: DIAS_AVISO_GARANTIA,
        total: itensGarantia.length,
        itens: itensGarantia,
      },
    };
  }
}
