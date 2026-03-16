import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, Trash2, Edit } from "lucide-react";
import { api, Funcionario, HorarioTrabalho } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";

const DIAS_SEMANA = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" }, // DRF/Python padrao Sunday = 0 ou 6? Ajustamos pro DB map
];

export function FuncionarioDetalhesPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
  const { openMenu } = useAdminShell();

    const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
    const [horarios, setHorarios] = useState<HorarioTrabalho[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [novoHorario, setNovoHorario] = useState({
        dia_semana: 1,
        hora_inicio: "08:00",
        hora_fim: "18:00"
    });
    const [savingHorario, setSavingHorario] = useState(false);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            try {
                const [funcData, horData] = await Promise.all([
                    api.obterFuncionario(Number(id)),
                    api.listarHorariosTrabalhoFuncionario(Number(id))
                ]);

                if (!funcData) {
                    navigate("/admin/funcionarios", { replace: true });
                    return;
                }

                setFuncionario(funcData);
                setHorarios(horData);
            } catch (err) {
                setErrorMsg("Erro ao carregar dados do funcionário.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, navigate]);

    const handleAddHorario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSavingHorario(true);
        try {
            const novo = await api.criarHorarioTrabalho({
                funcionario: Number(id),
                dia_semana: novoHorario.dia_semana,
                hora_inicio: novoHorario.hora_inicio,
                hora_fim: novoHorario.hora_fim
            });
            // Atualiza lista local ordenando pelo dia da semana
            setHorarios([...horarios, novo].sort((a, b) => a.dia_semana - b.dia_semana));
            // Reseta form mantendo o mesmo horario pra facilitar lote
            setNovoHorario({ ...novoHorario, dia_semana: (novoHorario.dia_semana + 1) % 7 });
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data?.non_field_errors?.[0] || "Erro ao adicionar horário. Verifique se já não existe.");
        } finally {
            setSavingHorario(false);
        }
    };

    const handleRemoveHorario = async (horarioId: number) => {
        if (!confirm("Tem certeza que deseja remover este horário?")) return;
        try {
            await api.excluirHorarioTrabalho(horarioId);
            setHorarios(horarios.filter(h => h.id !== horarioId));
        } catch (err) {
            alert("Erro ao remover horário.");
        }
    };

    if (loading) {
        return (
            <div className="pb-10">
                <TopBarTitle title="Detalhes do Funcionário" onMenuClick={openMenu} />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            </div>
        );
    }

    if (!funcionario) return null;

    return (
        <div className="pb-10">
        <TopBarTitle title="Detalhes do Funcionário" onMenuClick={openMenu} />
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pt-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/funcionarios")}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Detalhes do Funcionário</h1>
                        <p className="text-slate-500 text-sm mt-1">Gerencie a conta e a grade de horários de trabalho.</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/admin/funcionarios/${funcionario.id}/editar`)}
                    className="btn-outline flex items-center bg-white"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Cadastro
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Info Card (Left Col) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col items-center text-center">
                            {funcionario.usuario.foto ? (
                                <img
                                    src={funcionario.usuario.foto}
                                    alt={funcionario.usuario.nome}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-3xl shadow-md mb-4 border-4 border-white">
                                    {funcionario.usuario.nome.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-slate-800">{funcionario.usuario.nome}</h2>
                            <span className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                ${funcionario.cargo === 'VETERINARIO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
              `}>
                                {funcionario.cargo_display}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-medium">E-mail</p>
                                <p className="text-sm text-slate-900 font-medium">{funcionario.usuario.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-medium">Telefone</p>
                                <p className="text-sm text-slate-900 font-medium">{funcionario.usuario.telefone || "Não informado"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-medium">Status da Conta</p>
                                <div className="flex items-center mt-1">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${funcionario.ativo ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {funcionario.ativo ? 'Ativo e Operando' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Manager (Right Col) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-slate-800">Grade de Expediente</h3>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Form Add */}
                            <form onSubmit={handleAddHorario} className="flex gap-3 mb-8 items-end flex-wrap sm:flex-nowrap">
                                <div className="w-full sm:flex-1">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Dia da Semana</label>
                                    <select
                                        className="figma-input-white w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={novoHorario.dia_semana}
                                        onChange={(e) => setNovoHorario({ ...novoHorario, dia_semana: Number(e.target.value) })}
                                    >
                                        {DIAS_SEMANA.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Início</label>
                                    <input
                                        type="time"
                                        required
                                        className="figma-input-white border-emerald-200"
                                        value={novoHorario.hora_inicio}
                                        onChange={(e) => setNovoHorario({ ...novoHorario, hora_inicio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Fim</label>
                                    <input
                                        type="time"
                                        required
                                        className="figma-input-white border-emerald-200"
                                        value={novoHorario.hora_fim}
                                        onChange={(e) => setNovoHorario({ ...novoHorario, hora_fim: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={savingHorario}
                                    className="bg-emerald-600 text-white rounded-lg px-4 flex items-center justify-center font-medium shadow-sm hover:bg-emerald-700 transition"
                                    style={{ height: '42px' }}
                                >
                                    <Plus className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Adicionar</span>
                                </button>
                            </form>

                            {/* List */}
                            {horarios.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-600 font-medium">Sem horários configurados</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Adicione os turnos de trabalho acima.<br />
                                        Sem eles, este profissional não receberá agendamentos.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {horarios.map((h) => (
                                        <div key={h.id} className="flex items-center justify-between p-3 sm:p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors shadow-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{h.dia_semana_display}</p>
                                                    <p className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-0.5 font-medium tracking-wide border border-slate-200">
                                                        {h.hora_inicio.slice(0, 5)} - {h.hora_fim.slice(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveHorario(h.id)}
                                                className="text-slate-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors"
                                                title="Remover horário"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
        </div>
    );
}
