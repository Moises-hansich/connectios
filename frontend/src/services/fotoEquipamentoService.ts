import { api } from "./api";

export interface FotoEquipamento {
  id: number;
  nomeArquivo: string;
  nomeOriginal: string;
  tipoMime: string;
  tamanho: number;
  principal: boolean;
  equipamentoId: number;
  criadoEm: string;
  atualizadoEm: string;
}

interface RespostaApi<T> {
  success: boolean;
  message?: string;
  data: T;
}

const rotaFotos = (equipamentoId: number) =>
  `/equipamentos/${equipamentoId}/fotos`;

export const fotoEquipamentoService = {
  async listar(equipamentoId: number): Promise<FotoEquipamento[]> {
    const response = await api.get<RespostaApi<FotoEquipamento[]>>(
      rotaFotos(equipamentoId),
    );

    return response.data.data;
  },

  async adicionar(
    equipamentoId: number,
    arquivos: File[] | FileList,
  ): Promise<FotoEquipamento[]> {
    const formData = new FormData();

    Array.from(arquivos).forEach((arquivo) => {
      formData.append("fotos", arquivo);
    });

    const response = await api.post<RespostaApi<FotoEquipamento[]>>(
      rotaFotos(equipamentoId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },

  async definirPrincipal(
    equipamentoId: number,
    fotoId: number,
  ): Promise<FotoEquipamento> {
    const response = await api.patch<RespostaApi<FotoEquipamento>>(
      `${rotaFotos(equipamentoId)}/${fotoId}/principal`,
    );

    return response.data.data;
  },

  async excluir(equipamentoId: number, fotoId: number): Promise<void> {
    await api.delete(`${rotaFotos(equipamentoId)}/${fotoId}`);
  },
};
