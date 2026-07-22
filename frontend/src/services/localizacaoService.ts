import { api } from "./api";

export interface Localizacao {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
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
};
