import { api } from "./api";

import type {
  AtualizarHardwareValorData,
  CriarHardwareValorData,
  HardwareValor,
} from "../types/hardware";

export const hardwareValorService = {
  async listar(): Promise<HardwareValor[]> {
    const response = await api.get<HardwareValor[]>("/hardware-valores");

    return response.data;
  },

  async buscarPorId(id: number): Promise<HardwareValor> {
    const response = await api.get<HardwareValor>(`/hardware-valores/${id}`);

    return response.data;
  },

  async listarPorHardware(hardwareId: number): Promise<HardwareValor[]> {
    const response = await api.get<HardwareValor[]>(
      `/hardware-valores/hardware/${hardwareId}`,
    );

    return response.data;
  },

  async criar(dados: CriarHardwareValorData): Promise<HardwareValor> {
    const response = await api.post<HardwareValor>("/hardware-valores", dados);

    return response.data;
  },

  async atualizar(
    id: number,
    dados: AtualizarHardwareValorData,
  ): Promise<HardwareValor> {
    const response = await api.put<HardwareValor>(
      `/hardware-valores/${id}`,
      dados,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/hardware-valores/${id}`);
  },
};
