import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { api } from "../../services/api";
import { formatPhoneBR, sanitizeLetters } from "../../utils/inputFormatters";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";

export function FuncionarioNovoPage() {
    const navigate = useNavigate();
  const { openMenu } = useAdminShell();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        senha: "",
        confirmar_senha: "",
        cargo: "VETERINARIO",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "telefone") {
            setFormData({ ...formData, [name]: formatPhoneBR(value) });
        } else if (name === "nome") {
            setFormData({ ...formData, [name]: sanitizeLetters(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.senha !== formData.confirmar_senha) {
            setErrorMsg("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            await api.criarFuncionario({
                usuario: {
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone,
                    senha: formData.senha,
                    confirmar_senha: formData.confirmar_senha
                },
                cargo: formData.cargo
            });
            navigate("/admin/funcionarios");
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Erro ao cadastrar funcionário. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-10">
        <TopBarTitle title="Novo Funcionário" onMenuClick={openMenu} />
        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pt-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Novo Funcionário</h1>
                    <p className="text-slate-500 text-sm mt-1">Cadastre um novo membro da equipe (Veterinário ou Atendente).</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 mb-4">
                                    Dados do Usuário
                                </h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    className="figma-input-white"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    E-mail *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="figma-input-white"
                                    placeholder="joao@farmavet.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Telefone *
                                </label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    required
                                    maxLength={15}
                                    className="figma-input-white"
                                    placeholder="(11) 98888-7777"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Cargo *
                                </label>
                                <select
                                    name="cargo"
                                    value={formData.cargo}
                                    onChange={handleChange}
                                    className="figma-input-white"
                                >
                                    <option value="VETERINARIO">Veterinário(a)</option>
                                    <option value="ATENDENTE">Atendente</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">O cargo definirá as permissões do usuário no sistema.</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-2">
                                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 mb-4">
                                    Acesso (Senha Inicial)
                                </h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="figma-input-white"
                                    placeholder="Crie uma senha de acesso"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirmar Senha *
                                </label>
                                <input
                                    type="password"
                                    name="confirmar_senha"
                                    value={formData.confirmar_senha}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="figma-input-white"
                                    placeholder="Repita a senha"
                                />
                            </div>

                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Salvando...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Save className="w-4 h-4 mr-2" />
                                        Cadastrar Funcionário
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
}
