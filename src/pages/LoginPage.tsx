import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { Eye, EyeOff, User } from "lucide-react";
import { StatusMessage } from "../components/ui/StatusMessage";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const logged = await login(email, senha);
      const nextPath =
        logged.role === "ADMINISTRADOR" || logged.role === "SUPER_USUARIO"
          ? "/admin"
          : logged.role === "FUNCIONARIO"
            ? "/funcionario"
            : "/app";
      navigate(nextPath, {
        state: {
          flash: {
            type: "success",
            message: "Login realizado com sucesso."
          }
        }
      });
    } catch (error: any) {
      if (error?.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          setErro(data.detail);
        } else if (typeof data === 'string') {
          setErro(data);
        } else {
          setErro("Credenciais inválidas. Verifique seu email e senha.");
        }
      } else {
        setErro(
          error instanceof Error ? error.message : "Não foi possível fazer login."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-stretch">
      <div className="fixed right-4 top-4 z-50">
        <DarkModeToggle />
      </div>

      {/* Coluna da imagem + coração: desktop com mais espaço, coração maior e visível */}
      <div className="relative h-[200px] md:h-auto md:min-h-[520px] md:w-[48%] bg-slate-50 dark:bg-slate-800 flex items-end justify-center overflow-visible">
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <img
            src={logo}
            alt="MyPet"
            className="w-[200px] md:w-[320px] lg:w-[380px] max-w-[85%] h-[180px] md:h-[320px] lg:h-[380px] object-contain object-center"
          />
        </div>
        {/* Bolinha com ícone de perfil (mobile) - se junta à parte verde, por cima para o ícone aparecer */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 h-16 w-16 md:hidden rounded-full bg-emerald-700 flex items-center justify-center shadow-md z-10">
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Coluna do formulário - Login (verde se junta à bolinha no mobile) */}
      <div className="flex-1 flex flex-col md:justify-center md:py-12 md:pl-4 md:mt-0 pt-6 px-3 sm:px-4 md:px-0">
        <div className="relative rounded-[28px] md:rounded-xl bg-emerald-700 px-5 pt-12 pb-8 md:pt-12 md:pb-12 md:px-10 text-white max-w-full md:max-w-lg w-full mx-auto shadow-xl">
          <p className="text-center md:text-left text-sm font-medium leading-snug">
            Bem-vindo de volta!
            <br />
            Faça login para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              className="figma-input-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <div className="relative">
              <input
                className="figma-input-white pr-12"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                className="text-xs text-white/90 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {erro && <StatusMessage type="error" message={erro} />}

            <button
              className="figma-btn-white w-full font-semibold py-3.5"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-center text-xs text-white/90 pt-1">
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => navigate("/cadastro")}
                className="font-semibold underline hover:no-underline"
              >
                Criar conta
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

