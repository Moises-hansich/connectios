import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

import {
  buscarUsuarioLogado,
  fazerLogin,
  type Usuario,
} from "../services/authService";
import { TOKEN_KEY } from "../services/api";
import { permissaoService } from "../services/permissaoService";

interface LoginInput {
  email: string;
  senha: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;

  permissoes: string[];
  carregandoPermissoes: boolean;
  erroPermissoes: string;

  temPermissao: (chave: string) => boolean;
  temTodasPermissoes: (...chaves: string[]) => boolean;
  atualizarPermissoes: () => Promise<void>;

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

  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);
  const [erroPermissoes, setErroPermissoes] = useState("");
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);

  // Invalidam respostas antigas após logout ou troca de sessão.
  const versaoSessao = useRef(0);
  const versaoConsulta = useRef(0);

  const logout = useCallback(() => {
    versaoSessao.current += 1;
    versaoConsulta.current += 1;

    localStorage.removeItem(TOKEN_KEY);

    setUsuario(null);
    setPermissoes([]);
    setPermissoesCarregadas(false);
    setErroPermissoes("");
    setCarregandoPermissoes(false);
    setCarregando(false);
  }, []);

  const login = useCallback(
    async ({ email, senha }: LoginInput) => {
      logout();

      const sessaoAtual = versaoSessao.current;
      setCarregando(true);

      try {
        const resultado = await fazerLogin({ email, senha });

        if (sessaoAtual !== versaoSessao.current) {
          throw new Error("A tentativa de login foi cancelada.");
        }

        localStorage.setItem(TOKEN_KEY, resultado.token);
        setCarregandoPermissoes(true);

        const acesso = await permissaoService.minhas();

        if (sessaoAtual !== versaoSessao.current) {
          throw new Error("A tentativa de login foi cancelada.");
        }

        setUsuario({
          ...resultado.usuario,
          perfil: acesso.perfil,
        });

        setPermissoes(acesso.permissoes);
        setPermissoesCarregadas(true);
        setErroPermissoes("");
      } catch (error) {
        if (sessaoAtual === versaoSessao.current) {
          logout();
        }

        throw error;
      } finally {
        if (sessaoAtual === versaoSessao.current) {
          setCarregando(false);
          setCarregandoPermissoes(false);
        }
      }
    },
    [logout],
  );

  useEffect(() => {
    let ativo = true;
    const sessaoAtual = versaoSessao.current;

    async function carregarSessao() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setCarregando(false);
        return;
      }

      setCarregandoPermissoes(true);

      try {
        const [usuarioLogado, acesso] = await Promise.all([
          buscarUsuarioLogado(),
          permissaoService.minhas(),
        ]);

        if (!ativo || sessaoAtual !== versaoSessao.current) {
          return;
        }

        setUsuario({
          ...usuarioLogado,
          perfil: acesso.perfil,
        });

        setPermissoes(acesso.permissoes);
        setPermissoesCarregadas(true);
        setErroPermissoes("");
      } catch {
        if (ativo && sessaoAtual === versaoSessao.current) {
          logout();
        }
      } finally {
        if (ativo && sessaoAtual === versaoSessao.current) {
          setCarregando(false);
          setCarregandoPermissoes(false);
        }
      }
    }

    void carregarSessao();

    return () => {
      ativo = false;
    };
  }, [logout]);

  const atualizarPermissoes = useCallback(async () => {
    if (!usuario) {
      return;
    }

    if (!localStorage.getItem(TOKEN_KEY)) {
      logout();
      return;
    }

    const sessaoAtual = versaoSessao.current;
    const consultaAtual = ++versaoConsulta.current;

    const consultaValida = () =>
      sessaoAtual === versaoSessao.current &&
      consultaAtual === versaoConsulta.current;

    setCarregandoPermissoes(true);
    setErroPermissoes("");

    try {
      const acesso = await permissaoService.minhas();

      if (!consultaValida()) {
        return;
      }

      setUsuario((atual) =>
        atual ? { ...atual, perfil: acesso.perfil } : null,
      );

      setPermissoes(acesso.permissoes);
      setPermissoesCarregadas(true);
    } catch (error) {
      if (!consultaValida()) {
        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        return;
      }

      // Uma falha na consulta não concede acesso.
      setPermissoes([]);
      setPermissoesCarregadas(false);
      setErroPermissoes(
        "Não foi possível atualizar suas permissões. Tente novamente.",
      );
    } finally {
      if (consultaValida()) {
        setCarregandoPermissoes(false);
      }
    }
  }, [usuario, logout]);

  // Atualiza o acesso quando o usuário volta para a janela.
  useEffect(() => {
    if (!usuario) {
      return;
    }

    const aoFocar = () => {
      void atualizarPermissoes();
    };

    window.addEventListener("focus", aoFocar);

    return () => {
      window.removeEventListener("focus", aoFocar);
    };
  }, [usuario, atualizarPermissoes]);

  const conjuntoPermissoes = useMemo(() => new Set(permissoes), [permissoes]);

  const temPermissao = useCallback(
    (chave: string): boolean => {
      if (!usuario || carregando || !permissoesCarregadas || erroPermissoes) {
        return false;
      }

      // O backend já retorna todas as permissões para ADMIN.
      return conjuntoPermissoes.has(chave);
    },
    [
      usuario,
      carregando,
      permissoesCarregadas,
      erroPermissoes,
      conjuntoPermissoes,
    ],
  );

  const temTodasPermissoes = useCallback(
    (...chaves: string[]): boolean =>
      chaves.length > 0 && chaves.every(temPermissao),
    [temPermissao],
  );

  const valor = useMemo<AuthContextData>(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      carregando,
      permissoes,
      carregandoPermissoes,
      erroPermissoes,
      temPermissao,
      temTodasPermissoes,
      atualizarPermissoes,
      login,
      logout,
    }),
    [
      usuario,
      carregando,
      permissoes,
      carregandoPermissoes,
      erroPermissoes,
      temPermissao,
      temTodasPermissoes,
      atualizarPermissoes,
      login,
      logout,
    ],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
