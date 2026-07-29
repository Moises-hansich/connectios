import { AppError } from "../errors/AppError";

import {
  type ColaboradorFilters,
  type CreateColaboradorData,
  ColaboradorRepository,
} from "../repositories/colaboradorRepository";

import { LocalizacaoRepository } from "../repositories/localizacaoRepository";

export class ColaboradorService {
  private repository: ColaboradorRepository;
  private localizacaoRepository: LocalizacaoRepository;

  constructor() {
    this.repository = new ColaboradorRepository();
    this.localizacaoRepository = new LocalizacaoRepository();
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async criar(data: CreateColaboradorData) {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (data.email?.trim()) {
      const emailNormalizado = data.email.trim().toLowerCase();

      const colaboradorComMesmoEmail =
        await this.repository.findByEmail(emailNormalizado);

      if (colaboradorComMesmoEmail) {
        throw new AppError("E-mail já cadastrado", 409);
      }
    }

    if (data.localizacaoId !== undefined && data.localizacaoId !== null) {
      if (!Number.isInteger(data.localizacaoId) || data.localizacaoId <= 0) {
        throw new AppError("Localização inválida", 400);
      }

      const localizacao = await this.localizacaoRepository.findById(
        data.localizacaoId,
      );

      if (!localizacao) {
        throw new AppError("Localização não encontrada", 404);
      }
    }

    const colaboradorLimpo: CreateColaboradorData = {
      nome: data.nome.trim(),
      email: data.email?.trim().toLowerCase() || undefined,
      telefone: data.telefone?.trim() || undefined,
      cargo: data.cargo?.trim() || undefined,
      localizacaoId: data.localizacaoId ?? null,
      ativo: data.ativo ?? true,
    };

    return this.repository.create(colaboradorLimpo);
  }

  async buscarPorId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do colaborador inválido", 400);
    }

    const colaborador = await this.repository.findById(id);

    if (!colaborador) {
      throw new AppError("Colaborador não encontrado", 404);
    }

    return colaborador;
  }
  async buscarCompleto(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do colaborador inválido", 400);
    }

    const colaborador = await this.repository.findCompleto(id);

    if (!colaborador) {
      throw new AppError("Colaborador não encontrado", 404);
    }

    return colaborador;
  }
  async atualizar(id: number, data: Partial<CreateColaboradorData>) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do colaborador inválido", 400);
    }

    const colaboradorExistente = await this.repository.findById(id);

    if (!colaboradorExistente) {
      throw new AppError("Colaborador não encontrado", 404);
    }

    if (data.nome !== undefined && data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (data.email !== undefined && data.email.trim() !== "") {
      const emailNormalizado = data.email.trim().toLowerCase();

      if (emailNormalizado !== colaboradorExistente.email?.toLowerCase()) {
        const colaboradorComMesmoEmail =
          await this.repository.findByEmail(emailNormalizado);

        if (colaboradorComMesmoEmail && colaboradorComMesmoEmail.id !== id) {
          throw new AppError("E-mail já cadastrado", 409);
        }
      }
    }

    if (data.localizacaoId !== undefined && data.localizacaoId !== null) {
      if (!Number.isInteger(data.localizacaoId) || data.localizacaoId <= 0) {
        throw new AppError("Localização inválida", 400);
      }

      const localizacao = await this.localizacaoRepository.findById(
        data.localizacaoId,
      );

      if (!localizacao) {
        throw new AppError("Localização não encontrada", 404);
      }
    }

    const colaboradorLimpo: Partial<CreateColaboradorData> = {};

    if (data.nome !== undefined) {
      colaboradorLimpo.nome = data.nome.trim();
    }

    if (data.email !== undefined) {
      colaboradorLimpo.email = data.email.trim().toLowerCase() || undefined;
    }

    if (data.telefone !== undefined) {
      colaboradorLimpo.telefone = data.telefone.trim() || undefined;
    }

    if (data.cargo !== undefined) {
      colaboradorLimpo.cargo = data.cargo.trim() || undefined;
    }

    if (data.localizacaoId !== undefined) {
      colaboradorLimpo.localizacaoId = data.localizacaoId;
    }

    if (data.ativo !== undefined) {
      colaboradorLimpo.ativo = data.ativo;
    }

    return this.repository.update(id, colaboradorLimpo);
  }

  async deletar(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("ID do colaborador inválido", 400);
    }

    const colaboradorExistente = await this.repository.findById(id);

    if (!colaboradorExistente) {
      throw new AppError("Colaborador não encontrado", 404);
    }

    if (colaboradorExistente.equipamentos.length > 0) {
      throw new AppError(
        "Não é possível excluir um colaborador que possui equipamentos vinculados",
        409,
      );
    }

    return this.repository.delete(id);
  }

  async buscarComFiltros(filters: ColaboradorFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new AppError("Limite deve ser um número entre 1 e 100", 400);
    }

    if (
      filters.localizacaoId !== undefined &&
      (!Number.isInteger(filters.localizacaoId) || filters.localizacaoId <= 0)
    ) {
      throw new AppError("Localização inválida", 400);
    }

    return this.repository.findWithFilters({
      ...filters,
      search: filters.search?.trim() || undefined,
      page,
      limit,
    });
  }
}
