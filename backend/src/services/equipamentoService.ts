import {
  CreateEquipamentoData,
  EquipamentoRepository,
} from "../repositories/equipamentoRepository";

export class EquipamentoService {
  private repository: EquipamentoRepository;

  constructor() {
    this.repository = new EquipamentoRepository();
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async criar(data: CreateEquipamentoData) {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    if (!data.categoria || data.categoria.trim() === "") {
      throw new Error("Categoria é obrigatória");
    }

    if (!data.status || data.status.trim() === "") {
      throw new Error("Status é obrigatório");
    }

    if (data.numeroSerie) {
      const equipamentoComMesmoSerial = await this.repository.findByNumeroSerie(
        data.numeroSerie.trim(),
      );

      if (equipamentoComMesmoSerial) {
        throw new Error("Número de série já cadastrado");
      }
    }

    if (data.patrimonio) {
      const equipamentoComMesmoPatrimonio =
        await this.repository.findByPatrimonio(data.patrimonio.trim());

      if (equipamentoComMesmoPatrimonio) {
        throw new Error("Patrimônio já cadastrado");
      }
    }

    const equipamentoLimpo: CreateEquipamentoData = {
      nome: data.nome.trim(),
      categoria: data.categoria.trim(),
      fabricante: data.fabricante?.trim() || undefined,
      modelo: data.modelo?.trim() || undefined,
      numeroSerie: data.numeroSerie?.trim() || undefined,
      patrimonio: data.patrimonio?.trim() || undefined,
      status: data.status.trim(),
      localizacao: data.localizacao?.trim() || undefined,
      observacoes: data.observacoes?.trim() || undefined,
    };

    return this.repository.create(equipamentoLimpo);
  }
  async buscarPorId(id: number) {
    const equipamento = await this.repository.findById(id);
    if (!equipamento) {
      throw new Error("Equipamento não encontrado");
    }
    return equipamento;
  }
  async atualizar(id: number, data: Partial<CreateEquipamentoData>) {
    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new Error("Equipamento não encontrado");
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    if (data.categoria !== undefined && data.categoria.trim() === "") {
      throw new Error("Categoria não pode ficar vazia");
    }

    if (data.status !== undefined && data.status.trim() === "") {
      throw new Error("Status não pode ficar vazio");
    }

    if (
      data.numeroSerie !== undefined &&
      data.numeroSerie.trim() !== "" &&
      data.numeroSerie.trim() !== equipamentoExistente.numeroSerie
    ) {
      const equipamentoComMesmoSerial = await this.repository.findByNumeroSerie(
        data.numeroSerie.trim(),
      );

      if (equipamentoComMesmoSerial && equipamentoComMesmoSerial.id !== id) {
        throw new Error("Número de série já cadastrado");
      }
    }

    if (
      data.patrimonio !== undefined &&
      data.patrimonio.trim() !== "" &&
      data.patrimonio.trim() !== equipamentoExistente.patrimonio
    ) {
      const equipamentoComMesmoPatrimonio =
        await this.repository.findByPatrimonio(data.patrimonio.trim());

      if (
        equipamentoComMesmoPatrimonio &&
        equipamentoComMesmoPatrimonio.id !== id
      ) {
        throw new Error("Patrimônio já cadastrado");
      }
    }

    const equipamentoLimpo: Partial<CreateEquipamentoData> = {};

    if (data.nome !== undefined) {
      equipamentoLimpo.nome = data.nome.trim();
    }

    if (data.categoria !== undefined) {
      equipamentoLimpo.categoria = data.categoria.trim();
    }

    if (data.fabricante !== undefined) {
      equipamentoLimpo.fabricante = data.fabricante.trim() || undefined;
    }

    if (data.modelo !== undefined) {
      equipamentoLimpo.modelo = data.modelo.trim() || undefined;
    }

    if (data.numeroSerie !== undefined) {
      equipamentoLimpo.numeroSerie = data.numeroSerie.trim() || undefined;
    }

    if (data.patrimonio !== undefined) {
      equipamentoLimpo.patrimonio = data.patrimonio.trim() || undefined;
    }

    if (data.status !== undefined) {
      equipamentoLimpo.status = data.status.trim();
    }

    if (data.localizacao !== undefined) {
      equipamentoLimpo.localizacao = data.localizacao.trim() || undefined;
    }

    if (data.observacoes !== undefined) {
      equipamentoLimpo.observacoes = data.observacoes.trim() || undefined;
    }

    return this.repository.update(id, equipamentoLimpo);
  }
}
