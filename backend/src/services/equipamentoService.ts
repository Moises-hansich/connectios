import {
  CreateEquipamentoData,
  EquipamentoRepository,
} from "../repositories/equipamentoRepository";
import { AppError } from "../errors/AppError";

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
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (!data.categoria || data.categoria.trim() === "") {
      throw new AppError("Categoria é obrigatória", 400);
    }

    if (!data.status || data.status.trim() === "") {
      throw new AppError("Status é obrigatório", 400);
    }

    if (data.numeroSerie) {
      const equipamentoComMesmoSerial = await this.repository.findByNumeroSerie(
        data.numeroSerie.trim(),
      );

      if (equipamentoComMesmoSerial) {
        throw new AppError("Número de série já cadastrado", 409);
      }
    }

    if (data.patrimonio) {
      const equipamentoComMesmoPatrimonio =
        await this.repository.findByPatrimonio(data.patrimonio.trim());

      if (equipamentoComMesmoPatrimonio) {
        throw new AppError("Patrimônio já cadastrado", 409);
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
      throw new AppError("Equipamento não encontrado", 404);
    }
    return equipamento;
  }
  async atualizar(id: number, data: Partial<CreateEquipamentoData>) {
    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (data.categoria !== undefined && data.categoria.trim() === "") {
      throw new AppError("Categoria não pode ficar vazia", 400);
    }

    if (data.status !== undefined && data.status.trim() === "") {
      throw new AppError("Status não pode ficar vazio", 400);
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
        throw new AppError("Número de série já cadastrado", 409);
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
        throw new AppError("Patrimônio já cadastrado", 409);
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
  async deletar(id: number) {
    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return this.repository.delete(id);
  }
}
