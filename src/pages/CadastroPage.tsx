import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { Eye, EyeOff, User } from "lucide-react";
import { StatusMessage } from "../components/ui/StatusMessage";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";
import { formatCpf, formatPhoneBR, sanitizeLetters } from "../utils/inputFormatters";

export function CadastroPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const CIDADE_PADRAO = "Boa Viagem";
  const ESTADO_PADRAO = "CE";
  const CEP_PADRAO = "63870000";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatPhoneBR(e.target.value));
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpf(e.target.value));
  }

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register({
        nome,
        email,
        telefone,
        endereco,
        pontoReferencia,
        senha,
        confirmar_senha: confirmarSenha,
        cpf: cpf.replace(/\D/g, ""),
        cidade: CIDADE_PADRAO,
        estado: ESTADO_PADRAO,
        cep: CEP_PADRAO,
      });
      navigate("/app", {
        state: {
          flash: {
            type: "success",
            message: "Conta criada com sucesso. Seja bem-vindo!"
          }
        }
      });
    } catch (error: any) {
      // Extrair mensagem de erro do backend (axios error)
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          setErro(data);
        } else if (data.detail) {
          setErro(data.detail);
        } else {
          // Agrupar erros de campo
          const msgs = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
          setErro(msgs || "Não foi possível criar a conta.");
        }
      } else {
        setErro(
          error instanceof Error ? error.message : "Não foi possível criar a conta."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen md:h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-stretch md:overflow-hidden">
      <div className="fixed right-4 top-4 z-50">
        <DarkModeToggle />
      </div>

      {/* Coluna da imagem + coração */}
      <div className="relative h-[180px] md:h-full md:w-[48%] bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-visible shrink-0">
        <div className="absolute inset-0 flex items-center justify-center overflow-visible p-4">
          <img
            src={logo}
            alt="MyPet"
            className="w-[180px] md:w-[280px] lg:w-[320px] max-w-[85%] h-[160px] md:h-[280px] lg:h-[320px] object-contain object-center"
          />
        </div>
        {/* Bolinha com ícone de perfil (mobile) */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 h-16 w-16 md:hidden rounded-full bg-emerald-700 flex items-center justify-center shadow-md z-10">
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Coluna do formulário - Cadastro */}
      <div className="flex-1 flex flex-col md:justify-center md:min-h-0 md:py-6 md:pl-4 -mt-2 md:mt-0 overflow-y-auto px-3 sm:px-4 md:px-0 pb-4 md:pb-0">
        <div className="relative rounded-[28px] md:rounded-xl bg-emerald-700 px-4 sm:px-6 pt-14 pb-8 md:pt-6 md:pb-6 md:px-8 text-white max-w-md md:max-w-2xl w-full mx-auto shadow-xl md:overflow-visible">
          <p className="text-center md:text-left text-sm font-medium leading-snug md:mb-4">
            Crie sua conta
            <br />
            e cuide do seu pet com a gente.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 md:mt-0 space-y-3 md:space-y-2">
            {/* Desktop: 2 colunas */}
            <div className="md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-2 space-y-3 md:space-y-0">
              <input
                className="figma-input-white md:py-2.5"
                type="text"
                value={nome}
                onChange={(e) => setNome(sanitizeLetters(e.target.value))}
                placeholder="Nome completo"
                required
              />
              <input
                className="figma-input-white md:py-2.5"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                className="figma-input-white md:py-2.5"
                type="tel"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
              />
              <input
                className="figma-input-white md:py-2.5"
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="CPF (000.000.000-00)"
                maxLength={14}
                required
              />
              <input
                className="figma-input-white md:py-2.5"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Endereço (rua, nº, bairro)"
                required
              />
              <input
                className="figma-input-white md:py-2.5"
                type="text"
                value={pontoReferencia}
                onChange={(e) => setPontoReferencia(e.target.value)}
                placeholder="Ponto de referência"
              />
              <div className="relative md:col-span-2">
                <input
                  className="figma-input-white pr-12 md:py-2.5"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha (mín. 8 caracteres)"
                  required
                  minLength={8}
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
              <div className="relative md:col-span-2">
                <input
                  className="figma-input-white pr-12 md:py-2.5"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirmar senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                  aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {erro && <StatusMessage type="error" message={erro} />}

            <button
              className="figma-btn-white w-full font-semibold py-3.5 md:py-3 md:mt-1"
              type="submit"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>

            <p className="text-center text-xs text-white/90 pt-1">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold underline hover:no-underline"
              >
                Entrar
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
