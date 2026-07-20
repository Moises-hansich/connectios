import { DashboardRepository } from "../repositories/dashboardRepository";

export class DashboardService {
  constructor(private repository = new DashboardRepository()) {}

  async obterDashboard() {
    const [total, emUso, manutencao, disponivel, categorias, status, ultimos] =
      await Promise.all([
        this.repository.contarEquipamentos(),
        this.repository.contarPorStatus("Em uso"),
        this.repository.contarPorStatus("Manutenção"),
        this.repository.contarPorStatus("Disponível"),
        this.repository.buscarCategorias(),
        this.repository.buscarStatus(),
        this.repository.buscarUltimosEquipamentos(),
      ]);

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
    };
  }
}
