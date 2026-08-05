import {
  empresaRepository,
  type CreateEmpresaData,
  type UpdateEmpresaData,
} from "../repositories/empresaRepository";

export class EmpresaService {
  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID da empresa inválido.");
    }
  }

  private normalizarTextoOpcional(
    valor: unknown,
    nomeCampo: string,
  ): string | null {
    if (valor === undefined || valor === null || valor === "") {
      return null;
    }

    if (typeof valor !== "string") {
      throw new Error(`O campo ${nomeCampo} deve ser um texto.`);
    }

    return valor.trim() || null;
  }

  private normalizarCnpj(valor: unknown): string | null {
    const cnpj = this.normalizarTextoOpcional(valor, "CNPJ");

    if (!cnpj) {
      return null;
    }

    return cnpj.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }

  private validarFormatoCnpj(cnpj: string) {
    /*
     * O CNPJ possui 14 posições.
     * As 12 primeiras podem conter letras ou números.
     * As duas últimas são os dígitos verificadores numéricos.
     */
    const formatoValido = /^[A-Z0-9]{12}[0-9]{2}$/.test(cnpj);

    if (!formatoValido) {
      throw new Error(
        "CNPJ inválido. Informe 14 caracteres, com os dois últimos numéricos.",
      );
    }
  }

  private normalizarEmail(valor: unknown): string | null {
    const email = this.normalizarTextoOpcional(valor, "e-mail");

    if (!email) {
      return null;
    }

    return email.toLowerCase();
  }

  private validarEmail(email: string) {
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!formatoValido) {
      throw new Error("E-mail inválido.");
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
      throw new Error("Empresa não encontrada.");
    }

    return empresa;
  }

  async criar(data: CreateEmpresaData) {
    if (typeof data.nome !== "string") {
      throw new Error("O nome da empresa é obrigatório.");
    }

    const nome = data.nome.trim();

    if (!nome) {
      throw new Error("O nome da empresa é obrigatório.");
    }

    if (data.ativo !== undefined && typeof data.ativo !== "boolean") {
      throw new Error("O campo ativo deve ser verdadeiro ou falso.");
    }

    const cnpj = this.normalizarCnpj(data.cnpj);

    if (cnpj) {
      this.validarFormatoCnpj(cnpj);

      const empresaExistente = await empresaRepository.findByCnpj(cnpj);

      if (empresaExistente) {
        throw new Error("Já existe uma empresa cadastrada com esse CNPJ.");
      }
    }

    const email = this.normalizarEmail(data.email);

    if (email) {
      this.validarEmail(email);
    }

    return empresaRepository.create({
      nome,
      cnpj,
      telefone: this.normalizarTextoOpcional(data.telefone, "telefone"),
      email,
      endereco: this.normalizarTextoOpcional(data.endereco, "endereço"),
      observacoes: this.normalizarTextoOpcional(
        data.observacoes,
        "observações",
      ),
      ativo: data.ativo ?? true,
    });
  }

  async atualizar(id: number, data: UpdateEmpresaData) {
    await this.buscarPorId(id);

    const dadosAtualizados: UpdateEmpresaData = {};

    if (data.nome !== undefined) {
      if (typeof data.nome !== "string") {
        throw new Error("O nome da empresa deve ser um texto.");
      }

      const nome = data.nome.trim();

      if (!nome) {
        throw new Error("O nome da empresa é obrigatório.");
      }

      dadosAtualizados.nome = nome;
    }

    if (data.cnpj !== undefined) {
      const cnpj = this.normalizarCnpj(data.cnpj);

      if (cnpj) {
        this.validarFormatoCnpj(cnpj);

        const empresaExistente = await empresaRepository.findByCnpj(cnpj);

        if (empresaExistente && empresaExistente.id !== id) {
          throw new Error("Já existe uma empresa cadastrada com esse CNPJ.");
        }
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

      if (email) {
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
      if (typeof data.ativo !== "boolean") {
        throw new Error("O campo ativo deve ser verdadeiro ou falso.");
      }

      dadosAtualizados.ativo = data.ativo;
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new Error("Nenhum dado foi informado para atualização.");
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
      throw new Error(
        `Esta empresa está vinculada a ${vinculos.join(
          " e ",
        )}. Desative-a em vez de excluir.`,
      );
    }

    return empresaRepository.delete(id);
  }
}

export const empresaService = new EmpresaService();
