import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import logo from "../assets/logo.png";
import { api } from "../services/api";
import { StatusMessage } from "../components/ui/StatusMessage";
import { DarkModeToggle } from "../components/ui/DarkModeToggle";

export function RedefinirSenhaPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const uid = searchParams.get("uid") ?? "";
    const token = searchParams.get("token") ?? "";

    const [senhaNova, setSenhaNova] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    // Link inválido (sem uid ou token na URL)
    if (!uid || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                <div className="fixed top-4 right-4 z-50">
                    <DarkModeToggle />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow p-10 text-center max-w-sm">
                    <p className="text-red-600 dark:text-red-400 font-semibold mb-4">Link inválido ou expirado.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                        Voltar para o login
                    </button>
                </div>
            </div>
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErro(null);
        setSucesso(null);

        if (senhaNova !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await api.confirmarRedefinicaoSenha({
                uid,
                token,
                senha_nova: senhaNova,
                confirmar_senha: confirmarSenha,
            });
            setSucesso("Senha redefinida com sucesso! Você já pode fazer login.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error: any) {
            const message =
                error?.response?.data?.detail ||
                error?.response?.data?.senha_nova?.[0] ||
                "Não foi possível redefinir a senha. O link pode ter expirado.";
            setErro(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col md:flex-row md:items-stretch">
            <div className="fixed top-4 right-4 z-50">
                <DarkModeToggle />
            </div>

            {/* Lado esquerdo — logo */}
            <div className="relative h-[220px] md:h-auto md:min-h-[560px] md:w-[46%] bg-transparent flex items-end justify-center overflow-hidden">
                <div className="absolute -top-16 -left-12 h-56 w-56 rounded-full bg-emerald-200/60 blur-2xl" />
                <div className="absolute bottom-0 -right-16 h-64 w-64 rounded-full bg-cyan-200/60 blur-2xl" />
                <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                    <img
                        src={logo}
                        alt="MyPet"
                        className="w-[220px] md:w-[330px] lg:w-[390px] max-w-[85%] h-[190px] md:h-[330px] lg:h-[390px] object-contain object-center drop-shadow-[0_18px_26px_rgba(15,23,42,0.18)]"
                    />
                </div>
            </div>

            {/* Lado direito — formulário */}
            <div className="flex-1 flex flex-col md:justify-center md:py-12 md:pr-6 pt-4 md:pt-0">
                <div className="relative rounded-t-[28px] md:rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 px-5 pt-8 pb-8 md:pt-10 md:pb-10 md:px-10 text-slate-900 dark:text-slate-100 max-w-full md:max-w-xl w-full mx-auto shadow-[0_25px_65px_rgba(2,6,23,0.12)]">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 mb-5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para login
                    </button>

                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            Crie sua nova senha
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Escolha uma senha segura para sua conta MyPet.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Nova senha */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-10 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/40"
                                type="password"
                                value={senhaNova}
                                onChange={(e) => setSenhaNova(e.target.value)}
                                placeholder="Nova senha (mínimo 8 caracteres)"
                                required
                                minLength={8}
                            />
                        </div>

                        {/* Confirmar senha */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-10 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/40"
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="Confirme a nova senha"
                                required
                                minLength={8}
                            />
                        </div>

                        {erro && <StatusMessage type="error" message={erro} />}
                        {sucesso && <StatusMessage type="success" message={sucesso} />}

                        <button
                            className="w-full rounded-xl bg-emerald-700 text-white font-semibold py-3.5 transition-colors hover:bg-emerald-800 disabled:opacity-70"
                            type="submit"
                            disabled={loading || !!sucesso}
                        >
                            {loading ? "Salvando..." : "Redefinir senha"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
