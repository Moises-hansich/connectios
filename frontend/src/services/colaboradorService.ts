import { api } from "./api";

import type {
  Colaborador,
  ColaboradorCompletoResponse,
  ColaboradorCreateData,
  ColaboradorPorIdResponse,
  ColaboradorResponse,
  ColaboradorUpdateData,
} from "../types/colaborador";

export const colaboradorService = {
  async listar(params?: {
    search?: string;
    ativo?: boolean;
    localizacaoId?: number;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<ColaboradorResponse>("/colaboradores", {
      params,
    });

    return response.data.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<ColaboradorPorIdResponse>(
      `/colaboradores/${id}`,
    );

    return response.data;
  },

  async buscarCompleto(id: number) {
    const response = await api.get<ColaboradorCompletoResponse>(
      `/colaboradores/${id}/completo`,
    );

    return response.data;
  },

  async criar(data: ColaboradorCreateData) {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Colaborador;
    }>("/colaboradores", data);

    return response.data;
  },

  async atualizar(id: number, data: ColaboradorUpdateData) {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Colaborador;
    }>(`/colaboradores/${id}`, data);

    return response.data;
  },

  async excluir(id: number) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/colaboradores/${id}`);

    return response.data;
  },
};
