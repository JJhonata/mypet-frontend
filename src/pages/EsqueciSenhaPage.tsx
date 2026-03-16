import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import logo from "../assets/logo.png";
import { api } from "../services/api";
import { StatusMessage } from "../components/ui/StatusMessage";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";

export function EsqueciSenhaPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    try {
      await api.solicitarRecuperacaoSenha(email);
      setSucesso(
        "Se este email estiver cadastrado, enviaremos as instruções para redefinir sua senha."
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Não foi possível processar sua solicitação agora.";
      setErro(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-stretch">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="relative h-[200px] md:h-auto md:min-h-[520px] md:w-[48%] bg-slate-50 dark:bg-slate-800 flex items-end justify-center overflow-visible">
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <img
            src={logo}
            alt="MyPet"
            className="w-[200px] md:w-[320px] lg:w-[380px] max-w-[85%] h-[180px] md:h-[320px] lg:h-[380px] object-contain object-center"
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 h-16 w-16 md:hidden rounded-full bg-emerald-700 flex items-center justify-center shadow-md z-10">
          <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:justify-center md:py-12 md:pl-4 md:mt-0 pt-6 px-3 sm:px-4 md:px-0 pb-4 md:pb-0">
        <div className="relative rounded-[28px] md:rounded-xl bg-emerald-700 px-5 pt-12 pb-8 md:pt-12 md:pb-12 md:px-10 text-white max-w-full md:max-w-lg w-full mx-auto shadow-xl">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-xs text-white/90 hover:text-white mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </button>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Esqueceu sua senha?
            </h1>
            <p className="text-sm text-white/85 leading-relaxed">
              Sem problema. Informe seu email e vamos te enviar o caminho para recuperar sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-300" />
              <input
                className="figma-input-white pl-10"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                required
              />
            </div>

            {erro && <StatusMessage type="error" message={erro} />}
            {sucesso && <StatusMessage type="success" message={sucesso} />}

            <button
              className="figma-btn-white w-full font-semibold py-3.5"
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar instruções"}
            </button>

            <p className="text-[11px] text-white/85 text-center leading-relaxed">
              Se não encontrar o email, verifique também sua caixa de spam.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
