import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { api, AuthenticatedUser, UserRole, mapGroupsToRole } from "../services/api";

type AuthUser = {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  clienteId?: number;
  telefone?: string;
  foto?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, senha: string) => Promise<AuthUser>;
  register: (dados: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    pontoReferencia?: string;
    senha: string;
    confirmar_senha: string;
    cpf: string;
    cidade: string;
    estado: string;
    cep: string;
  }) => Promise<void>;
  updateUser: (dados: { nome?: string; email?: string; telefone?: string; foto?: string; senhaAtual?: string; novaSenha?: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Restaurar sessão do localStorage
    const stored = localStorage.getItem("mypet:user");
    const accessToken = localStorage.getItem("mypet:access_token");

    if (stored && accessToken) {
      try {
        const parsed = JSON.parse(stored) as Partial<AuthUser>;
        const normalized: AuthUser = {
          id: parsed.id ?? 0,
          nome: parsed.nome ?? "",
          email: parsed.email ?? "",
          role: parsed.role ?? "CLIENTE",
          clienteId: parsed.clienteId,
          telefone: parsed.telefone,
          foto: parsed.foto,
        };
        setUser(normalized);
      } catch {
        // Dados corrompidos, limpa tudo
        localStorage.removeItem("mypet:user");
        localStorage.removeItem("mypet:access_token");
        localStorage.removeItem("mypet:refresh_token");
      }
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    // Chama a API real que faz POST /auth/login/ e GET /me/profile/
    const result = await api.login(email, senha);

    const authUser: AuthUser = {
      id: result.id,
      nome: result.nome,
      email: result.email,
      role: result.role,
      clienteId: result.clienteId,
      telefone: result.telefone,
      foto: result.foto,
    };

    // Tokens já foram salvos dentro de api.login()
    setUser(authUser);
    localStorage.setItem("mypet:user", JSON.stringify(authUser));
    return authUser;
  }, []);

  const register = useCallback(
    async (dados: {
      nome: string;
      email: string;
      telefone: string;
      endereco: string;
      senha: string;
      confirmar_senha: string;
      cpf: string;
      cidade: string;
      estado: string;
      cep: string;
    }) => {
      // 1. Registrar via /auth/register/
      await api.criarCliente(dados);

      // 2. Fazer login automático após registro
      const result = await api.login(dados.email, dados.senha);

      const authUser: AuthUser = {
        id: result.id,
        nome: result.nome,
        email: result.email,
        role: result.role,
        clienteId: result.clienteId,
        telefone: result.telefone,
        foto: result.foto,
      };

      setUser(authUser);
      localStorage.setItem("mypet:user", JSON.stringify(authUser));
    },
    []
  );

  const updateUser = useCallback((dados: { nome?: string; email?: string; telefone?: string; foto?: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...dados };
      localStorage.setItem("mypet:user", JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mypet:user");
    localStorage.removeItem("mypet:access_token");
    localStorage.removeItem("mypet:refresh_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
