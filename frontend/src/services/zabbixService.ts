import { api } from "./api";

export interface ZabbixInterface {
  interfaceid: string;
  ip: string;
  dns: string;
  porta: string;
  tipo: string;
  principal: boolean;
  disponivel: boolean;
}

export interface ZabbixHost {
  hostid: string;
  host: string;
  nome: string;
  ativo: boolean;
  interfaces: ZabbixInterface[];
  ips: string[];
}

interface ListarHostsResponse {
  success: boolean;
  data: ZabbixHost[];
}

export const zabbixService = {
  async listarHosts(): Promise<ZabbixHost[]> {
    const response = await api.get<ListarHostsResponse>("/zabbix/hosts");

    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};
