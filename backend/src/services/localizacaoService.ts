import { AppError } from "../errors/AppError";

import {
  localizacaoRepository,
  type CreateLocalizacaoData,
  type UpdateLocalizacaoData,
} from "../repositories/localizacaoRepository";

import { zabbixService, type ZabbixHost } from "./zabbixService";

export class LocalizacaoService {
  async listar() {
    return localizacaoRepository.findAll();
  }

  async buscarPorId(id: number) {
    this.validarId(id);

    const localizacao = await localizacaoRepository.findById(id);

    if (!localizacao) {
      throw new AppError("Localização não encontrada.", 404);
    }

    return localizacao;
  }

  async listarColaboradores(id: number) {
    const localizacao = await this.buscarPorId(id);

    const colaboradores = await localizacaoRepository.findColaboradores(id);

    // Consulta os hosts uma vez e relaciona pelo zabbixHostId.
    let hostsZabbix: ZabbixHost[] = [];

    try {
      hostsZabbix = await zabbixService.listarComputadores();
    } catch (error) {
      console.error("Não foi possível consultar os IPs no Zabbix:", error);
    }

    const hostsPorId = new Map(hostsZabbix.map((host) => [host.hostid, host]));

    const colaboradoresComIps = colaboradores.map((colaborador) => {
      const equipamentos = colaborador.equipamentos.map((equipamento) => {
        const hostZabbix = equipamento.zabbixHostId
          ? hostsPorId.get(equipamento.zabbixHostId)
          : undefined;

        const ips = [
          ...new Set(
            (hostZabbix?.interfaces ?? [])
              .map((interfaceRede) => interfaceRede.ip.trim())
              .filter((ip) => ip !== ""),
          ),
        ];

        const online = hostZabbix
          ? hostZabbix.interfaces.some(
              (interfaceRede) => interfaceRede.available === "1",
            )
          : null;

        return {
          ...equipamento,
          nomeZabbix: hostZabbix?.name ?? null,
          ips,
          online,
        };
      });

      const ips = [
        ...new Set(equipamentos.flatMap((equipamento) => equipamento.ips)),
      ];

      return {
        ...colaborador,
        ips,
        equipamentos,
      };
    });

    return {
      localizacao: {
        id: localizacao.id,
        nome: localizacao.nome,
        descricao: localizacao.descricao,
      },
      colaboradores: colaboradoresComIps,
    };
  }

  async criar(data: CreateLocalizacaoData) {
    this.validarCorpo(data);

    const nome = this.validarNome(data.nome);
    const descricao = this.validarDescricao(data.descricao);

    const existente = await localizacaoRepository.findByNome(nome);

    if (existente) {
      throw new AppError("Já existe uma localização com esse nome.", 409);
    }

    const dados: CreateLocalizacaoData = { nome };

    if (descricao !== undefined) {
      dados.descricao = descricao;
    }

    return localizacaoRepository.create(dados);
  }

  async atualizar(id: number, data: UpdateLocalizacaoData) {
    this.validarId(id);
    this.validarCorpo(data);

    const dados: UpdateLocalizacaoData = {};

    // Se o nome não foi enviado, preserva o valor existente.
    if (data.nome !== undefined) {
      dados.nome = this.validarNome(data.nome);
    }

    if (data.descricao !== undefined) {
      dados.descricao = this.validarDescricao(data.descricao)!;
    }

    await this.buscarPorId(id);

    if (dados.nome !== undefined) {
      const existente = await localizacaoRepository.findByNome(dados.nome);

      if (existente && existente.id !== id) {
        throw new AppError("Já existe uma localização com esse nome.", 409);
      }
    }

    return localizacaoRepository.update(id, dados);
  }

  async excluir(id: number) {
    await this.buscarPorId(id);

    return localizacaoRepository.delete(id);
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("ID da localização inválido.", 400);
    }
  }

  private validarCorpo(data: unknown): void {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new AppError("Envie um objeto com os dados da localização.", 400);
    }
  }

  private validarNome(valor: unknown): string {
    if (typeof valor !== "string") {
      throw new AppError("O nome da localização deve ser um texto.", 400);
    }

    const nome = valor.trim();

    if (!nome) {
      throw new AppError("O nome da localização é obrigatório.", 400);
    }

    return nome;
  }

  private validarDescricao(valor: unknown): string | undefined {
    if (valor === undefined) {
      return undefined;
    }

    if (typeof valor !== "string") {
      throw new AppError("A descrição da localização deve ser um texto.", 400);
    }

    // Uma string vazia permite limpar a descrição na edição.
    return valor.trim();
  }
}

export const localizacaoService = new LocalizacaoService();
