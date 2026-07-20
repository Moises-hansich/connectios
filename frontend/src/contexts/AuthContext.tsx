import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  buscarUsuarioLogado,
  fazerLogin,
  type Usuario,
} from "../services/authService";
import { TOKEN_KEY } from "../services/api";

interface LoginInput {
  email: string;
  senha: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;
  login: (dados: LoginInput) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData | undefined>(
  undefined,
);

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  const login = useCallback(async ({ email, senha }: LoginInput) => {
    const resultado = await fazerLogin({
      email,
      senha,
    });

    localStorage.setItem(TOKEN_KEY, resultado.token);
    setUsuario(resultado.usuario);
  }, []);

  useEffect(() => {
    async function carregarUsuario() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setCarregando(false);
        return;
      }

      try {
        const usuarioLogado = await buscarUsuarioLogado();
        setUsuario(usuarioLogado);
      } catch {
        logout();
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuario();
  }, [logout]);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      carregando,
      login,
      logout,
    }),
    [usuario, carregando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
