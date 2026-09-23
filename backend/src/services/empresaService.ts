import { AppError } from "../errors/AppError";

import {
  empresaRepository,
  type CreateEmpresaData,
  type UpdateEmpresaData,
} from "../repositories/empresaRepository";

export class EmpresaService {
  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("ID da empresa inválido.", 400);
    }
  }

  private validarCorpo(data: unknown): void {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new AppError("Envie um objeto com os dados da empresa.", 400);
    }
  }

  private validarNome(valor: unknown): string {
    if (typeof valor !== "string") {
      throw new AppError("O nome da empresa deve ser um texto.", 400);
    }

    const nome = valor.trim();

    if (!nome) {
      throw new AppError("O nome da empresa é obrigatório.", 400);
    }

    return nome;
  }

  private validarAtivo(valor: unknown): boolean {
    if (typeof valor !== "boolean") {
      throw new AppError("O campo ativo deve ser verdadeiro ou falso.", 400);
    }

    return valor;
  }

  private normalizarTextoOpcional(
    valor: unknown,
    nomeCampo: string,
  ): string | null {
    if (valor === undefined || valor === null) {
      return null;
    }

    if (typeof valor !== "string") {
      throw new AppError(`O campo ${nomeCampo} deve ser um texto.`, 400);
    }

    return valor.trim() || null;
  }

  private normalizarCnpj(valor: unknown): string | null {
    const cnpj = this.normalizarTextoOpcional(valor, "CNPJ");

    if (cnpj === null) {
      return null;
    }

    // Remove somente os separadores de formatação.
    // Outros caracteres serão rejeitados na validação.
    return cnpj.replace(/[./\-\s]/g, "").toUpperCase();
  }

  private validarFormatoCnpj(cnpj: string): void {
    // Verifica o formato; não calcula os dígitos verificadores.
    const formatoValido = /^[A-Z0-9]{12}[0-9]{2}$/.test(cnpj);

    if (!formatoValido) {
      throw new AppError(
        "CNPJ inválido. Informe 14 caracteres, com os dois últimos numéricos.",
        400,
      );
    }
  }

  private normalizarEmail(valor: unknown): string | null {
    const email = this.normalizarTextoOpcional(valor, "e-mail");

    return email === null ? null : email.toLowerCase();
  }

  private validarEmail(email: string): void {
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!formatoValido) {
      throw new AppError("E-mail inválido.", 400);
    }
  }

  async listar() {
    return empresaRepository.findAll();
  }

  async listarAtivas() {
    return empresaRepository.findAtivas();
  }

  async buscarPorId(id: number) {
    this.validarId(id);

    const empresa = await empresaRepository.findById(id);

    if (!empresa) {
      throw new AppError("Empresa não encontrada.", 404);
    }

    return empresa;
  }

  async criar(data: CreateEmpresaData) {
    this.validarCorpo(data);

    const nome = this.validarNome(data.nome);

    const ativo =
      data.ativo === undefined ? true : this.validarAtivo(data.ativo);

    const cnpj = this.normalizarCnpj(data.cnpj);
    const email = this.normalizarEmail(data.email);

    const telefone = this.normalizarTextoOpcional(data.telefone, "telefone");

    const endereco = this.normalizarTextoOpcional(data.endereco, "endereço");

    const observacoes = this.normalizarTextoOpcional(
      data.observacoes,
      "observações",
    );

    if (cnpj !== null) {
      this.validarFormatoCnpj(cnpj);
    }

    if (email !== null) {
      this.validarEmail(email);
    }

    if (cnpj !== null) {
      const empresaExistente = await empresaRepository.findByCnpj(cnpj);

      if (empresaExistente) {
        throw new AppError(
          "Já existe uma empresa cadastrada com esse CNPJ.",
          409,
        );
      }
    }

    return empresaRepository.create({
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      observacoes,
      ativo,
    });
  }

  async atualizar(id: number, data: UpdateEmpresaData) {
    this.validarId(id);
    this.validarCorpo(data);

    const dadosAtualizados: UpdateEmpresaData = {};

    if (data.nome !== undefined) {
      dadosAtualizados.nome = this.validarNome(data.nome);
    }

    if (data.cnpj !== undefined) {
      const cnpj = this.normalizarCnpj(data.cnpj);

      if (cnpj !== null) {
        this.validarFormatoCnpj(cnpj);
      }

      dadosAtualizados.cnpj = cnpj;
    }

    if (data.telefone !== undefined) {
      dadosAtualizados.telefone = this.normalizarTextoOpcional(
        data.telefone,
        "telefone",
      );
    }

    if (data.email !== undefined) {
      const email = this.normalizarEmail(data.email);

      if (email !== null) {
        this.validarEmail(email);
      }

      dadosAtualizados.email = email;
    }

    if (data.endereco !== undefined) {
      dadosAtualizados.endereco = this.normalizarTextoOpcional(
        data.endereco,
        "endereço",
      );
    }

    if (data.observacoes !== undefined) {
      dadosAtualizados.observacoes = this.normalizarTextoOpcional(
        data.observacoes,
        "observações",
      );
    }

    if (data.ativo !== undefined) {
      dadosAtualizados.ativo = this.validarAtivo(data.ativo);
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new AppError("Nenhum dado foi informado para atualização.", 400);
    }

    await this.buscarPorId(id);

    if (dadosAtualizados.cnpj !== undefined && dadosAtualizados.cnpj !== null) {
      const empresaExistente = await empresaRepository.findByCnpj(
        dadosAtualizados.cnpj,
      );

      if (empresaExistente && empresaExistente.id !== id) {
        throw new AppError(
          "Já existe uma empresa cadastrada com esse CNPJ.",
          409,
        );
      }
    }

    return empresaRepository.update(id, dadosAtualizados);
  }

  async excluir(id: number) {
    await this.buscarPorId(id);

    const [quantidadeEquipamentos, quantidadeManutencoes] = await Promise.all([
      empresaRepository.countEquipamentos(id),
      empresaRepository.countManutencoes(id),
    ]);

    const vinculos: string[] = [];

    if (quantidadeEquipamentos > 0) {
      vinculos.push(`${quantidadeEquipamentos} equipamento(s)`);
    }

    if (quantidadeManutencoes > 0) {
      vinculos.push(`${quantidadeManutencoes} manutenção(ões)`);
    }

    if (vinculos.length > 0) {
      throw new AppError(
        `Esta empresa está vinculada a ${vinculos.join(
          " e ",
        )}. Desative-a em vez de excluir.`,
        409,
      );
    }

    return empresaRepository.delete(id);
  }
}

export const empresaService = new EmpresaService();
