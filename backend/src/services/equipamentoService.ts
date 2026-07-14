import { EquipamentoRepository } from "../repositories/equipamentoRepository";

export class EquipamentoService {
  private repository: EquipamentoRepository;

  constructor() {
    this.repository = new EquipamentoRepository();
  }

  async listarTodos() {
    return this.repository.findAll();
  }
}
