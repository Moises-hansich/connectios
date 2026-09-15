import axios from "axios";

interface ZabbixResponse<T> {
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
  id: number;
}

interface ZabbixHostGroup {
  groupid: string;
  name: string;
}

export interface ZabbixInterface {
  interfaceid: string;
  ip: string;
  dns: string;
  port: string;
  type: string;
  main: string;
  available: string;
  useip: string;
}

export interface ZabbixHost {
  hostid: string;
  host: string;
  name: string;
  status: string;
  interfaces: ZabbixInterface[];
}

class ZabbixService {
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly nomeGrupo: string;

  constructor() {
    this.apiUrl = process.env.ZABBIX_API_URL ?? "";
    this.apiToken = process.env.ZABBIX_API_TOKEN ?? "";
    this.nomeGrupo = process.env.ZABBIX_HOST_GROUP ?? "PCS INTERNOS";

    if (!this.apiUrl) {
      throw new Error("ZABBIX_API_URL não configurada no .env");
    }

    if (!this.apiToken) {
      throw new Error("ZABBIX_API_TOKEN não configurado no .env");
    }
  }

  private async executar<T>(
    method: string,
    params: Record<string, unknown>,
  ): Promise<T> {
    const response = await axios.post<ZabbixResponse<T>>(
      this.apiUrl,
      {
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        timeout: 10000,
      },
    );

    if (response.data.error) {
      throw new Error(
        `${response.data.error.message} ${response.data.error.data}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error("O Zabbix não retornou um resultado");
    }

    return response.data.result;
  }

  private async buscarIdGrupo(): Promise<string> {
    const grupos = await this.executar<ZabbixHostGroup[]>("hostgroup.get", {
      output: ["groupid", "name"],
      filter: {
        name: [this.nomeGrupo],
      },
    });

    const grupo = grupos[0];

    if (!grupo) {
      throw new Error(
        `Grupo de hosts "${this.nomeGrupo}" não encontrado no Zabbix`,
      );
    }

    return grupo.groupid;
  }

  async listarComputadores(): Promise<ZabbixHost[]> {
    const groupid = await this.buscarIdGrupo();

    return this.executar<ZabbixHost[]>("host.get", {
      groupids: [groupid],

      output: ["hostid", "host", "name", "status"],

      filter: {
        status: "0",
      },

      selectInterfaces: [
        "interfaceid",
        "ip",
        "dns",
        "port",
        "type",
        "main",
        "available",
        "useip",
      ],

      sortfield: "name",
    });
  }

  async buscarComputadorPorHostId(hostid: string): Promise<ZabbixHost | null> {
    const computadores = await this.listarComputadores();

    return (
      computadores.find((computador) => computador.hostid === hostid) ?? null
    );
  }
}

export const zabbixService = new ZabbixService();
