import { api } from "./api";

export interface DefinicaoPermissao {
  chave: string;
  nome: string;
}

export interface GrupoPermissoes {
  chave: string;
  nome: string;
  permissoes: DefinicaoPermissao[];
}

export interface PermissoesUsuario {
  usuario: {
    id: number;
    nome: string;
    perfil: string;
  };
  permissoes: string[];
}

export interface MinhasPermissoes {
  perfil: string;
  permissoes: string[];
}

interface ApiResponse<T> {
  sucesso: boolean;
  data: T;
}

export const permissaoService = {
  async minhas(): Promise<MinhasPermissoes> {
    const response = await api.get<ApiResponse<MinhasPermissoes>>(
      "/usuarios/minhas-permissoes",
    );

    return response.data.data;
  },

  async catalogo(): Promise<GrupoPermissoes[]> {
    const response = await api.get<ApiResponse<GrupoPermissoes[]>>(
      "/usuarios/permissoes/catalogo",
    );

    return response.data.data;
  },

  async buscar(usuarioId: number): Promise<PermissoesUsuario> {
    const response = await api.get<ApiResponse<PermissoesUsuario>>(
      `/usuarios/${usuarioId}/permissoes`,
    );

    return response.data.data;
  },

  async atualizar(
    usuarioId: number,
    permissoes: string[],
  ): Promise<PermissoesUsuario> {
    const response = await api.put<ApiResponse<PermissoesUsuario>>(
      `/usuarios/${usuarioId}/permissoes`,
      { permissoes },
    );

    return response.data.data;
  },
};
