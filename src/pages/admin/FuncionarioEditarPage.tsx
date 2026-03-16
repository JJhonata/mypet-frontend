import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, AlertTriangle, User } from "lucide-react";
import { api, Funcionario } from "../../services/api";
import { formatPhoneBR, sanitizeLetters } from "../../utils/inputFormatters";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";

export function FuncionarioEditarPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
  const { openMenu } = useAdminShell();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        cargo: "",
    });

    useEffect(() => {
        async function loadFuncionario() {
            if (!id) return;
            try {
                const dados = await api.obterFuncionario(Number(id));
                if (!dados) {
                    navigate("/admin/funcionarios", { replace: true });
                    return;
                }
                setFormData({
                    nome: dados.usuario.nome,
                    email: dados.usuario.email,
                    telefone: dados.usuario.telefone || "",
                    cargo: dados.cargo,
                });
            } catch (err) {
                setErrorMsg("Erro ao carregar os dados do funcionário.");
            } finally {
                setLoading(false);
            }
        }
        loadFuncionario();
    }, [id, navigate]);

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
        if (!id) return;

        setSaving(true);
        setErrorMsg("");

        try {
            // O endpoint do DRF vai precisar estar mapeando isso.
            // Se a view de update do Funcionario permitir editar usuario nested:
            await api.atualizarFuncionario(Number(id), {
                usuario: {
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone
                },
                cargo: formData.cargo
            });
            navigate(`/admin/funcionarios/${id}`);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Erro ao atualizar dados.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        try {
            await api.excluirFuncionario(Number(id));
            navigate("/admin/funcionarios");
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Erro ao inativar funcionário.");
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="pb-10">
                <TopBarTitle title="Editar Funcionário" onMenuClick={openMenu} />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
        <TopBarTitle title="Editar Funcionário" onMenuClick={openMenu} />
        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pt-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Editar Funcionário</h1>
                    <p className="text-slate-500 text-sm mt-1">Altere as informações de cadastro e cargo.</p>
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
                                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-400" />
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
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center text-red-600 hover:text-red-700 font-medium px-2 py-1 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Inativar Funcionário
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <span className="text-sm text-red-700 flex items-center font-medium">
                                            <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                                            Tem certeza?
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {deleting ? "Inativando..." : "Sim, confirmar"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleting}
                                            className="px-3 py-1 bg-white text-slate-600 text-sm font-medium border border-slate-200 rounded-md hover:bg-slate-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    disabled={saving || deleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || deleting}
                                    className="btn-primary"
                                >
                                    {saving ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Salvando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
}
