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
    const localizacao = await localizacaoRepository.findById(id);

    if (!localizacao) {
      throw new Error("Localização não encontrada.");
    }

    return localizacao;
  }
  async listarColaboradores(id: number) {
    const localizacao = await this.buscarPorId(id);

    const colaboradores = await localizacaoRepository.findColaboradores(id);

    /*
     * Consulta o grupo PCS INTERNOS uma única vez.
     * Depois relaciona os hosts pelo zabbixHostId.
     */
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
    const nome = data.nome.trim();

    if (!nome) {
      throw new Error("O nome da localização é obrigatório.");
    }

    const existente = await localizacaoRepository.findByNome(nome);

    if (existente) {
      throw new Error("Já existe uma localização com esse nome.");
    }

    return localizacaoRepository.create({
      nome,
      descricao: data.descricao?.trim() || undefined,
    });
  }

  async atualizar(id: number, data: UpdateLocalizacaoData) {
    await this.buscarPorId(id);

    if (data.nome) {
      const existente = await localizacaoRepository.findByNome(
        data.nome.trim(),
      );

      if (existente && existente.id !== id) {
        throw new Error("Já existe uma localização com esse nome.");
      }
    }

    return localizacaoRepository.update(id, {
      nome: data.nome?.trim(),
      descricao: data.descricao?.trim() || undefined,
    });
  }

  async excluir(id: number) {
    await this.buscarPorId(id);

    return localizacaoRepository.delete(id);
  }
}

export const localizacaoService = new LocalizacaoService();
