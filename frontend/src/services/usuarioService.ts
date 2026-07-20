import { api } from "./api";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}

export interface AtualizarUsuarioDTO {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
}

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const response = await api.get("/usuarios");
    return response.data.data;
  },

  async buscar(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.data;
  },

  async criar(dados: CriarUsuarioDTO): Promise<Usuario> {
    const response = await api.post("/usuarios", dados);
    return response.data.data;
  },

  async atualizar(id: number, dados: AtualizarUsuarioDTO): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data.data;
  },

  async alterarStatus(id: number, ativo: boolean): Promise<Usuario> {
    const response = await api.patch(`/usuarios/${id}/status`, {
      ativo,
    });

    return response.data.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
