import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";

import {
  type CreateEquipamentoData,
  type EquipamentoFilters,
  EquipamentoRepository,
} from "../repositories/equipamentoRepository";
import { EmpresaRepository } from "../repositories/empresaRepository";
import { CategoriaRepository } from "../repositories/categoriaRepository";
import { ColaboradorRepository } from "../repositories/colaboradorRepository";
import { LocalizacaoRepository } from "../repositories/localizacaoRepository";
import { movimentacaoRepository } from "../repositories/movimentacaoRepository";
import { SetorRepository } from "../repositories/setorRepository";

interface EquipamentoInput {
  nome: string;
  categoriaId: number | string;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  patrimonio?: string | null;
  status: string;
  setorId?: number | string | null;
  localizacaoId?: number | string | null;
  responsavelId?: number | string | null;
  fornecedorId?: number | string | null;
  observacoes?: string | null;
  dataCompra?: string | Date | null;
  garantiaAte?: string | Date | null;
}

export class EquipamentoService {
  private readonly repository = new EquipamentoRepository();

  private readonly categoriaRepository = new CategoriaRepository();

  private readonly localizacaoRepository = new LocalizacaoRepository();

  private readonly colaboradorRepository = new ColaboradorRepository();

  private readonly setorRepository = new SetorRepository();

  private readonly empresaRepository = new EmpresaRepository();

  private readonly movimentacaoRepository = movimentacaoRepository;

  async listarTodos() {
    return this.repository.findAll();
  }

  async criar(data: EquipamentoInput) {
    if (typeof data.nome !== "string" || data.nome.trim().length < 3) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (typeof data.status !== "string" || data.status.trim() === "") {
      throw new AppError("Status é obrigatório", 400);
    }

    const categoriaId = this.converterIdObrigatorio(
      data.categoriaId,
      "Categoria",
    );

    const setorId = this.converterIdOpcional(data.setorId, "Setor");

    const localizacaoId = this.converterIdOpcional(
      data.localizacaoId,
      "Localização",
    );

    const responsavelId = this.converterIdOpcional(
      data.responsavelId,
      "Responsável",
    );

    const fornecedorId = this.converterIdOpcional(
      data.fornecedorId,
      "Fornecedor",
    );

    const dataCompra =
      this.converterDataOpcional(data.dataCompra, "Data da compra") ?? null;

    const garantiaAte =
      this.converterDataOpcional(data.garantiaAte, "Data da garantia") ?? null;

    this.validarPeriodoGarantia(dataCompra, garantiaAte);

    const numeroSerie = data.numeroSerie?.trim() || null;

    const patrimonio = await this.gerarProximoPatrimonio();

    if (numeroSerie) {
      const equipamentoComMesmoSerial =
        await this.repository.findByNumeroSerie(numeroSerie);

      if (equipamentoComMesmoSerial) {
        throw new AppError("Número de série já cadastrado", 409);
      }
    }

    await this.validarCategoria(categoriaId);
    await this.validarSetor(setorId);
    await this.validarLocalizacao(localizacaoId);
    await this.validarResponsavel(responsavelId);
    await this.validarFornecedor(fornecedorId);

    this.validarFornecedorDaGarantia(garantiaAte, fornecedorId ?? null);

    const equipamentoLimpo: CreateEquipamentoData = {
      nome: data.nome.trim(),
      categoriaId,
      fabricante: data.fabricante?.trim() || null,
      modelo: data.modelo?.trim() || null,
      numeroSerie,
      patrimonio,
      status: data.status.trim(),
      setorId: setorId ?? null,
      localizacaoId: localizacaoId ?? null,
      responsavelId: responsavelId ?? null,
      fornecedorId: fornecedorId ?? null,
      observacoes: data.observacoes?.trim() || null,
      dataCompra,
      garantiaAte,
    };

    return this.repository.create(equipamentoLimpo);
  }

  async buscarPorId(id: number) {
    this.validarId(id, "ID do equipamento");

    const equipamento = await this.repository.findById(id);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return equipamento;
  }

  async buscarCompleto(id: number) {
    this.validarId(id, "ID do equipamento");

    const equipamento = await this.repository.findCompleto(id);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return equipamento;
  }

  async atualizar(
    id: number,
    data: Partial<EquipamentoInput>,
    usuarioId: number | null = null,
  ) {
    this.validarId(id, "ID do equipamento");

    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    if (
      data.nome !== undefined &&
      (typeof data.nome !== "string" || data.nome.trim().length < 3)
    ) {
      throw new AppError("Nome deve ter pelo menos 3 caracteres", 400);
    }

    if (
      data.status !== undefined &&
      (typeof data.status !== "string" || data.status.trim() === "")
    ) {
      throw new AppError("Status não pode ficar vazio", 400);
    }

    const categoriaId = this.converterIdOpcional(data.categoriaId, "Categoria");

    if (categoriaId === null) {
      throw new AppError("Categoria não pode ficar vazia", 400);
    }

    const setorId = this.converterIdOpcional(data.setorId, "Setor");

    const localizacaoId = this.converterIdOpcional(
      data.localizacaoId,
      "Localização",
    );

    const responsavelId = this.converterIdOpcional(
      data.responsavelId,
      "Responsável",
    );

    const fornecedorId = this.converterIdOpcional(
      data.fornecedorId,
      "Fornecedor",
    );

    const dataCompra = this.converterDataOpcional(
      data.dataCompra,
      "Data da compra",
    );

    const garantiaAte = this.converterDataOpcional(
      data.garantiaAte,
      "Data da garantia",
    );

    const dataCompraFinal =
      dataCompra === undefined ? equipamentoExistente.dataCompra : dataCompra;

    const garantiaAteFinal =
      garantiaAte === undefined
        ? equipamentoExistente.garantiaAte
        : garantiaAte;

    const fornecedorIdFinal =
      fornecedorId === undefined
        ? equipamentoExistente.fornecedorId
        : fornecedorId;

    this.validarPeriodoGarantia(dataCompraFinal, garantiaAteFinal);

    if (categoriaId !== undefined) {
      const exigirCategoriaAtiva =
        categoriaId !== equipamentoExistente.categoriaId;

      await this.validarCategoria(categoriaId, exigirCategoriaAtiva);
    }

    await this.validarSetor(setorId);

    await this.validarLocalizacao(localizacaoId);

    await this.validarResponsavel(responsavelId);

    if (fornecedorId !== undefined) {
      const exigirFornecedorAtivo =
        fornecedorId !== equipamentoExistente.fornecedorId;

      await this.validarFornecedor(fornecedorId, exigirFornecedorAtivo);
    }

    this.validarFornecedorDaGarantia(garantiaAteFinal, fornecedorIdFinal);

    if (data.numeroSerie !== undefined) {
      const numeroSerie = data.numeroSerie?.trim() || null;

      if (numeroSerie && numeroSerie !== equipamentoExistente.numeroSerie) {
        const equipamentoComMesmoSerial =
          await this.repository.findByNumeroSerie(numeroSerie);

        if (equipamentoComMesmoSerial && equipamentoComMesmoSerial.id !== id) {
          throw new AppError("Número de série já cadastrado", 409);
        }
      }
    }

    if (data.patrimonio !== undefined) {
      const patrimonio = data.patrimonio?.trim() || null;

      if (patrimonio && patrimonio !== equipamentoExistente.patrimonio) {
        const equipamentoComMesmoPatrimonio =
          await this.repository.findByPatrimonio(patrimonio);

        if (
          equipamentoComMesmoPatrimonio &&
          equipamentoComMesmoPatrimonio.id !== id
        ) {
          throw new AppError("Patrimônio já cadastrado", 409);
        }
      }
    }

    const equipamentoLimpo: Partial<CreateEquipamentoData> = {};

    if (data.nome !== undefined) {
      equipamentoLimpo.nome = data.nome.trim();
    }

    if (categoriaId !== undefined) {
      equipamentoLimpo.categoriaId = categoriaId;
    }

    if (data.fabricante !== undefined) {
      equipamentoLimpo.fabricante = data.fabricante?.trim() || null;
    }

    if (data.modelo !== undefined) {
      equipamentoLimpo.modelo = data.modelo?.trim() || null;
    }

    if (data.numeroSerie !== undefined) {
      equipamentoLimpo.numeroSerie = data.numeroSerie?.trim() || null;
    }

    if (data.patrimonio !== undefined) {
      equipamentoLimpo.patrimonio = data.patrimonio?.trim() || null;
    }

    if (data.status !== undefined) {
      equipamentoLimpo.status = data.status.trim();
    }

    if (setorId !== undefined) {
      equipamentoLimpo.setorId = setorId;
    }

    if (localizacaoId !== undefined) {
      equipamentoLimpo.localizacaoId = localizacaoId;
    }

    if (responsavelId !== undefined) {
      equipamentoLimpo.responsavelId = responsavelId;
    }

    if (fornecedorId !== undefined) {
      equipamentoLimpo.fornecedorId = fornecedorId;
    }

    if (data.observacoes !== undefined) {
      equipamentoLimpo.observacoes = data.observacoes?.trim() || null;
    }

    if (dataCompra !== undefined) {
      equipamentoLimpo.dataCompra = dataCompra;
    }

    if (garantiaAte !== undefined) {
      equipamentoLimpo.garantiaAte = garantiaAte;
    }

    return prisma.$transaction(async (tx) => {
      const equipamentoAnterior = await this.repository.findById(id, tx);

      if (!equipamentoAnterior) {
        throw new AppError("Equipamento não encontrado", 404);
      }

      const equipamentoAtualizado = await this.repository.update(
        id,
        equipamentoLimpo,
        tx,
      );

      const dataHora = new Date();

      if (
        equipamentoAnterior.responsavelId !==
        equipamentoAtualizado.responsavelId
      ) {
        const tipo = equipamentoAtualizado.responsavelId
          ? "ENTREGA"
          : "DEVOLUCAO";

        await this.movimentacaoRepository.create(
          {
            tipo,
            equipamentoId: id,
            responsavelAnteriorId: equipamentoAnterior.responsavelId,
            responsavelNovoId: equipamentoAtualizado.responsavelId,
            usuarioId,
            observacoes:
              tipo === "ENTREGA"
                ? "Responsável alterado na edição do equipamento."
                : "Responsável removido na edição do equipamento.",
            dataHora,
          },
          tx,
        );
      }

      if (equipamentoAnterior.setorId !== equipamentoAtualizado.setorId) {
        await this.movimentacaoRepository.create(
          {
            tipo: "MUDANCA_SETOR",
            equipamentoId: id,
            setorAnteriorId: equipamentoAnterior.setorId,
            setorNovoId: equipamentoAtualizado.setorId,
            usuarioId,
            observacoes: "Setor alterado na edição do equipamento.",
            dataHora,
          },
          tx,
        );
      }

      if (
        equipamentoAnterior.localizacaoId !==
        equipamentoAtualizado.localizacaoId
      ) {
        await this.movimentacaoRepository.create(
          {
            tipo: "MUDANCA_LOCALIZACAO",
            equipamentoId: id,
            localizacaoAnteriorId: equipamentoAnterior.localizacaoId,
            localizacaoNovaId: equipamentoAtualizado.localizacaoId,
            usuarioId,
            observacoes: "Localização alterada na edição do equipamento.",
            dataHora,
          },
          tx,
        );
      }

      if (
        equipamentoAnterior.status !== equipamentoAtualizado.status &&
        this.ehStatusDeBaixa(equipamentoAtualizado.status)
      ) {
        await this.movimentacaoRepository.create(
          {
            tipo: "BAIXA",
            equipamentoId: id,
            usuarioId,
            statusAnterior: equipamentoAnterior.status,
            statusNovo: equipamentoAtualizado.status,
            observacoes: "Equipamento baixado na edição.",
            dataHora,
          },
          tx,
        );
      }

      return equipamentoAtualizado;
    });
  }

  async deletar(id: number) {
    this.validarId(id, "ID do equipamento");

    const equipamentoExistente = await this.repository.findById(id);

    if (!equipamentoExistente) {
      throw new AppError("Equipamento não encontrado", 404);
    }

    return this.repository.delete(id);
  }

  async buscarComFiltros(filters: EquipamentoFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (!Number.isInteger(page) || page <= 0) {
      throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      throw new AppError("Limite deve ser um número entre 1 e 100", 400);
    }

    if (
      filters.categoriaId !== undefined &&
      (!Number.isInteger(filters.categoriaId) || filters.categoriaId <= 0)
    ) {
      throw new AppError("Categoria inválida", 400);
    }

    if (
      filters.localizacaoId !== undefined &&
      (!Number.isInteger(filters.localizacaoId) || filters.localizacaoId <= 0)
    ) {
      throw new AppError("Localização inválida", 400);
    }

    const filtrosNormalizados: EquipamentoFilters = {
      page,
      limit,
    };

    if (filters.search?.trim()) {
      filtrosNormalizados.search = filters.search.trim();
    }

    if (filters.categoria?.trim()) {
      filtrosNormalizados.categoria = filters.categoria.trim();
    }

    if (filters.categoriaId !== undefined) {
      filtrosNormalizados.categoriaId = filters.categoriaId;
    }

    if (filters.status?.trim()) {
      filtrosNormalizados.status = filters.status.trim();
    }

    if (filters.localizacaoId !== undefined) {
      filtrosNormalizados.localizacaoId = filters.localizacaoId;
    }

    return this.repository.findWithFilters(filtrosNormalizados);
  }

  private validarId(id: number, campo: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(`${campo} inválido`, 400);
    }
  }

  private converterIdObrigatorio(valor: number | string, campo: string) {
    const id = Number(valor);

    this.validarId(id, campo);

    return id;
  }

  private converterIdOpcional(
    valor: number | string | null | undefined,
    campo: string,
  ): number | null | undefined {
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null || (typeof valor === "string" && valor.trim() === "")) {
      return null;
    }

    const id = Number(valor);

    this.validarId(id, campo);

    return id;
  }

  private converterDataOpcional(
    valor: string | Date | null | undefined,
    campo: string,
  ): Date | null | undefined {
    if (valor === undefined) {
      return undefined;
    }

    if (valor === null || (typeof valor === "string" && valor.trim() === "")) {
      return null;
    }

    if (valor instanceof Date) {
      if (Number.isNaN(valor.getTime())) {
        throw new AppError(`${campo} inválida`, 400);
      }

      return valor;
    }

    if (typeof valor !== "string") {
      throw new AppError(`${campo} inválida`, 400);
    }

    const texto = valor.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
      const data = new Date(`${texto}T00:00:00.000Z`);

      if (
        Number.isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== texto
      ) {
        throw new AppError(`${campo} inválida`, 400);
      }

      return data;
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
      throw new AppError(`${campo} inválida`, 400);
    }

    return data;
  }

  private validarPeriodoGarantia(
    dataCompra: Date | null,
    garantiaAte: Date | null,
  ) {
    if (
      dataCompra &&
      garantiaAte &&
      garantiaAte.getTime() < dataCompra.getTime()
    ) {
      throw new AppError(
        "A data da garantia não pode ser anterior à data da compra",
        400,
      );
    }
  }

  private async validarCategoria(categoriaId: number, exigirAtiva = true) {
    const categoria = await this.categoriaRepository.findById(categoriaId);

    if (!categoria) {
      throw new AppError("Categoria não encontrada", 404);
    }

    if (exigirAtiva && !categoria.ativo) {
      throw new AppError("A categoria selecionada está desativada", 400);
    }
  }

  private async validarSetor(setorId: number | null | undefined) {
    if (setorId === undefined || setorId === null) {
      return;
    }

    this.validarId(setorId, "Setor");

    const setor = await this.setorRepository.findById(setorId);

    if (!setor) {
      throw new AppError("Setor não encontrado", 404);
    }
  }

  private async validarLocalizacao(localizacaoId: number | null | undefined) {
    if (localizacaoId === undefined || localizacaoId === null) {
      return;
    }

    this.validarId(localizacaoId, "Localização");

    const localizacao =
      await this.localizacaoRepository.findById(localizacaoId);

    if (!localizacao) {
      throw new AppError("Localização não encontrada", 404);
    }
  }

  private async validarResponsavel(responsavelId: number | null | undefined) {
    if (responsavelId === undefined || responsavelId === null) {
      return;
    }

    this.validarId(responsavelId, "Responsável");

    const colaborador =
      await this.colaboradorRepository.findById(responsavelId);

    if (!colaborador) {
      throw new AppError("Colaborador responsável não encontrado", 404);
    }
  }

  private async validarFornecedor(
    fornecedorId: number | null | undefined,
    exigirAtivo = true,
  ) {
    if (fornecedorId === undefined || fornecedorId === null) {
      return;
    }

    this.validarId(fornecedorId, "Fornecedor");

    const empresa = await this.empresaRepository.findById(fornecedorId);

    if (!empresa) {
      throw new AppError("Fornecedor não encontrado", 404);
    }

    if (exigirAtivo && !empresa.ativo) {
      throw new AppError("O fornecedor selecionado está desativado", 400);
    }
  }

  private validarFornecedorDaGarantia(
    garantiaAte: Date | null,
    fornecedorId: number | null,
  ) {
    if (garantiaAte && fornecedorId === null) {
      throw new AppError(
        "Selecione o fornecedor responsável pela garantia",
        400,
      );
    }
  }

  private ehStatusDeBaixa(status: string) {
    const statusNormalizado = status
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();

    return (
      statusNormalizado === "BAIXADO" || statusNormalizado === "DESCARTADO"
    );
  }
  private async gerarProximoPatrimonio(): Promise<string> {
    const equipamentos = await this.repository.findPatrimoniosAutomaticos();

    let maiorNumero = 0;

    for (const equipamento of equipamentos) {
      const patrimonio = equipamento.patrimonio?.trim().toUpperCase();

      if (!patrimonio) {
        continue;
      }

      const resultado = /^PAT(\d+)$/.exec(patrimonio);

      if (!resultado) {
        continue;
      }

      const numero = Number(resultado[1]);

      if (Number.isInteger(numero) && numero > maiorNumero) {
        maiorNumero = numero;
      }
    }

    const proximoNumero = maiorNumero + 1;

    return `PAT${String(proximoNumero).padStart(3, "0")}`;
  }
}
