import { useEffect, useState } from "react";
import { api, Servico } from "../../services/api";
import { useAdminShell } from "./AdminLayout";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { Scissors, Plus, Pencil, Trash2, X } from "lucide-react";
import { StatusMessage } from "../../components/ui/StatusMessage";

const inputClass =
  "w-full rounded-lg bg-white px-4 py-3 text-sm text-slate-900 shadow border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

const CARGOS_DISPONIVEIS = [
  { value: "VETERINARIO", label: "Veterinário" },
  { value: "TOSADOR", label: "Tosador" },
  { value: "ATENDENTE", label: "Atendente" },
  { value: "GERENTE", label: "Gerente" },
];

type FormData = {
  nome: string;
  descricao: string;
  preco: string;
  duracao_minutos: string;
  cargos: string[];
};

const emptyForm: FormData = {
  nome: "",
  descricao: "",
  preco: "",
  duracao_minutos: "",
  cargos: [],
};

export function ServicosPage() {
  const { openMenu } = useAdminShell();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function carregar() {
    try {
      const lista = await api.listarServicos();
      setServicos(lista);
    } catch {
      setErro("Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditingId(null);
    setForm(emptyForm);
    setErro(null);
    setModalOpen(true);
  }

  function abrirEditar(s: Servico) {
    setEditingId(s.id);
    setForm({
      nome: s.nome,
      descricao: s.descricao ?? "",
      preco: String(s.preco),
      duracao_minutos: String(s.duracao_minutos),
      cargos: s.cargos ? s.cargos.map(c => c.cargo) : [],
    });
    setErro(null);
    setModalOpen(true);
  }

  async function salvar() {
    if (!form.preco || !form.duracao_minutos) {
      setErro("Preencha preço e duração.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      if (!form.nome || form.cargos.length === 0) {
        setErro("Preencha nome e selecione ao menos um cargo.");
        setSalvando(false);
        return;
      }
      const payload = {
        nome: form.nome,
        descricao: form.descricao || form.nome,
        preco: Number(form.preco.replace(",", ".")),
        duracao_minutos: Number(form.duracao_minutos),
        cargos: form.cargos,
      };

      if (editingId) {
        await api.atualizarServico(editingId, payload);
        setSucesso("Serviço atualizado com sucesso!");
      } else {
        await api.criarServico(payload);
        setSucesso("Serviço criado com sucesso!");
      }

      setModalOpen(false);
      await carregar();
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.message;
      setErro(typeof msg === "string" ? msg : "Erro ao salvar serviço.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;
    setErro(null);
    try {
      await api.excluirServico(id);
      setSucesso("Serviço excluído com sucesso!");
      await carregar();
      setTimeout(() => setSucesso(null), 3000);
    } catch {
      setErro("Erro ao excluir serviço. Verifique se não há agendamentos vinculados.");
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Serviços" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Gerenciar Serviços</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Adicione, edite preços e durações dos serviços.
            </p>
          </div>
          <button onClick={abrirNovo} className="figma-btn inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </button>
        </div>

        {sucesso && <StatusMessage type="success" message={sucesso} />}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Carregando...</div>
        ) : servicos.length === 0 ? (
          <div className="rounded-xl bg-white shadow border border-slate-200 p-8 text-center">
            <Scissors className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Nenhum serviço cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Serviço</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Preço (R$)</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Duração (min)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden sm:table-cell">Cargos</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servicos.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.nome}</p>
                      {s.descricao && s.descricao !== s.nome && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.descricao}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      R$ {Number(s.preco).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{s.duracao_minutos} min</td>
                    <td className="px-4 py-3 text-left text-slate-600 hidden sm:table-cell text-xs">
                      {s.cargos && s.cargos.length > 0
                        ? s.cargos.map((c) => c.cargo_display).join(", ")
                        : "Nenhum"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => abrirEditar(s)}
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => excluir(s.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Banho e Tosa Completo"
                  disabled={!!editingId}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">
                  Descrição
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição do serviço"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="Ex: 89.90"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={form.duracao_minutos}
                    onChange={(e) => setForm({ ...form, duracao_minutos: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-700 mb-2 mt-1 sm:mt-0">
                    Cargos que realizam
                  </label>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                    {CARGOS_DISPONIVEIS.map((cargo) => (
                      <label key={cargo.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                          checked={form.cargos.includes(cargo.value)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setForm((prev) => {
                              const newCargos = isChecked
                                ? [...prev.cargos, cargo.value]
                                : prev.cargos.filter((c) => c !== cargo.value);
                              return { ...prev, cargos: newCargos };
                            });
                          }}
                        />
                        <span className="text-sm text-slate-700">{cargo.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {erro && <p className="text-sm text-red-600">{erro}</p>}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="figma-btn-white"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button type="button" onClick={salvar} className="figma-btn" disabled={salvando}>
                {salvando ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Serviço"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
