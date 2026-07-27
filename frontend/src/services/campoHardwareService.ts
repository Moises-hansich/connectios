import { api } from "./api";

import type {
  AtualizarCampoHardwareData,
  CampoHardware,
  CriarCampoHardwareData,
} from "../types/hardware";

export const campoHardwareService = {
  async listar(): Promise<CampoHardware[]> {
    const response = await api.get<CampoHardware[]>("/campos-hardware");

    return response.data;
  },

  async buscarPorId(id: number): Promise<CampoHardware> {
    const response = await api.get<CampoHardware>(`/campos-hardware/${id}`);

    return response.data;
  },

  async listarPorTipo(tipoHardwareId: number): Promise<CampoHardware[]> {
    const campos = await this.listar();

    return campos
      .filter((campo) => campo.tipoHardwareId === tipoHardwareId)
      .sort((campoA, campoB) => campoA.ordem - campoB.ordem);
  },

  async criar(dados: CriarCampoHardwareData): Promise<CampoHardware> {
    const response = await api.post<CampoHardware>("/campos-hardware", dados);

    return response.data;
  },

  async atualizar(
    id: number,
    dados: AtualizarCampoHardwareData,
  ): Promise<CampoHardware> {
    const response = await api.put<CampoHardware>(
      `/campos-hardware/${id}`,
      dados,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/campos-hardware/${id}`);
  },
};
