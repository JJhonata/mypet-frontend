import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, User } from "lucide-react";
import { api, Funcionario } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";

export function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { openMenu } = useAdminShell();

    useEffect(() => {
        async function loadFuncionarios() {
            try {
                const dados = await api.listarFuncionarios();
                setFuncionarios(dados);
            } catch (err) {
                console.error("Erro ao carregar funcionários", err);
            } finally {
                setLoading(false);
            }
        }
        loadFuncionarios();
    }, []);

    const filtered = funcionarios.filter((f) =>
        f.usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.usuario.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-10">
            <TopBarTitle title="Funcionários" onMenuClick={openMenu} />

            <div className="pt-6 space-y-6 animate-fade-in">
            {/* Cabeçalho e Ações */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Funcionários</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie a equipe e acesse os expedientes profissionais.</p>
                </div>

                <button
                    onClick={() => navigate("/admin/funcionarios/novo")}
                    className="btn-primary w-full sm:w-auto shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Funcionário
                </button>
            </div>

            {/* Busca */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar veterinário ou atendente por nome/e-mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="figma-input-white pl-10"
                    />
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum funcionário encontrado</h3>
                    <p className="text-slate-500">
                        {searchQuery ? "Nenhum resultado para a sua busca." : "O seu quadro de funcionários está vazio."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Cards mobile */}
                    <div className="sm:hidden divide-y divide-slate-100">
                        {filtered.map((func) => (
                            <div key={func.id} className="p-4 flex items-center gap-3">
                                {func.usuario?.foto ? (
                                    <img
                                        src={func.usuario.foto}
                                        alt={func.usuario.nome}
                                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                                        {func.usuario?.nome.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900 truncate">{func.usuario?.nome}</p>
                                    <p className="text-xs text-slate-500 truncate">{func.usuario?.email}</p>
                                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                                        ${func.cargo === 'VETERINARIO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                        {func.cargo_display}
                                    </span>
                                </div>
                                <Link
                                    to={`/admin/funcionarios/${func.id}`}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors flex-shrink-0"
                                >
                                    Ver
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Tabela desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nome</th>
                                    <th className="px-6 py-4 font-medium">E-mail</th>
                                    <th className="px-6 py-4 font-medium">Cargo</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((func) => (
                                    <tr key={func.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {func.usuario?.foto ? (
                                                    <img
                                                        src={func.usuario.foto}
                                                        alt={func.usuario.nome}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                                                        {func.usuario?.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-900">{func.usuario?.nome}</p>
                                                    <p className="text-xs text-slate-500">{func.usuario?.telefone || "Sem telefone"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{func.usuario?.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${func.cargo === 'VETERINARIO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}
                                            >
                                                {func.cargo_display}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/funcionarios/${func.id}`}
                                                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                            >
                                                Ver Detalhes / Grade
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
