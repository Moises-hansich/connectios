import { api } from "./api";

export interface Localizacao {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface EquipamentoColaborador {
  id: number;
  nome: string;
  patrimonio?: string | null;
  status: string;
  zabbixHostId?: string | null;
  nomeZabbix?: string | null;
  ips: string[];
  online: boolean | null;
}

export interface ColaboradorLocalizacao {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  ativo: boolean;
  localizacaoId?: number | null;
  ips: string[];
  setor?: {
    id: number;
    nome: string;
  } | null;

  equipamentos: EquipamentoColaborador[];
}

export interface ResultadoColaboradoresLocalizacao {
  localizacao: {
    id: number;
    nome: string;
    descricao?: string | null;
  };
  colaboradores: ColaboradorLocalizacao[];
}

interface RespostaComData {
  success?: boolean;
  data?: Localizacao[];
}

export const localizacaoService = {
  async listar(): Promise<Localizacao[]> {
    const response = await api.get<RespostaComData | Localizacao[]>(
      "/localizacoes",
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    return [];
  },

  async buscarPorId(id: number): Promise<Localizacao> {
    const response = await api.get<
      | {
          success?: boolean;
          data?: Localizacao;
        }
      | Localizacao
    >(`/localizacoes/${id}`);

    if ("data" in response.data && response.data.data) {
      return response.data.data;
    }

    return response.data as Localizacao;
  },

  async listarColaboradores(
    id: number,
  ): Promise<ResultadoColaboradoresLocalizacao> {
    const response = await api.get<
      | ResultadoColaboradoresLocalizacao
      | {
          success?: boolean;
          data?: ResultadoColaboradoresLocalizacao;
        }
    >(`/localizacoes/${id}/colaboradores`);

    if ("data" in response.data && response.data.data) {
      return response.data.data;
    }

    return response.data as ResultadoColaboradoresLocalizacao;
  },
};
