import { api } from "./api";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface LoginInput {
  email: string;
  senha: string;
}

interface LoginResponse {
  sucesso: boolean;
  data: {
    token: string;
    usuario: Usuario;
  };
}

interface UsuarioLogadoResponse {
  sucesso: boolean;
  data: Usuario;
}

export async function fazerLogin(dados: LoginInput) {
  const response = await api.post<LoginResponse>("/auth/login", dados);

  return response.data.data;
}

export async function buscarUsuarioLogado() {
  const response = await api.get<UsuarioLogadoResponse>("/auth/me");

  return response.data.data;
}
