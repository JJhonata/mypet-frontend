import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api, Cliente } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";
import { sanitizeDecimalInput } from "../../utils/inputFormatters";

type Choice = { value: string; label: string };

export function PetNovoPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const { user } = useAuth();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [especies, setEspecies] = useState<Choice[]>([]);
  const [portes, setPortes] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState("");
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [porte, setPorte] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Data máxima = hoje | mínima = 100 anos atrás
  const hoje = new Date().toISOString().split("T")[0];
  const minDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 100);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {
    async function load() {
      try {
        const [lista, choices] = await Promise.all([
          api.listarTodosClientes(),
          api.obterPetChoices(),
        ]);

        setClientes(lista);
        if (lista.length > 0) setClienteId(String(lista[0].id));

        setEspecies(choices.especies);
        setPortes(choices.portes);
        if (choices.especies.length > 0) setEspecie(choices.especies[0].value);
        if (choices.portes.length > 0) setPorte(choices.portes[0].value);
      } catch {
        setErro("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleRacaChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Raça não pode ter números
    setRaca(e.target.value.replace(/[0-9]/g, ""));
  }

  function handlePesoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPeso(sanitizeDecimalInput(e.target.value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    // Validar data
    if (dataNascimento) {
      const nascimento = new Date(dataNascimento);
      if (nascimento > new Date()) {
        setErro("A data de nascimento não pode ser no futuro.");
        return;
      }
      if (nascimento.getFullYear() < 1924) {
        setErro("Data de nascimento inválida.");
        return;
      }
    }

    const pesoNum = Number(String(peso || 0).replace(",", "."));
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setErro("Peso inválido. Informe um valor maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const novo = await api.criarPet(Number(clienteId), {
        nome,
        especie,
        raca,
        idade: dataNascimento ? calcIdade(dataNascimento) : 0,
        peso: pesoNum,
        porte: porte || undefined,
        dataNascimento: dataNascimento || undefined,
        observacoes: observacoes || undefined,
      });

      navigate(`/admin/pets/${novo.id}`, {
        state: {
          flash: {
            type: "success",
            message: "Pet criado com sucesso.",
          },
        },
      });
    } catch (error: any) {
      if (error?.response?.data) {
        const data = error.response.data;
        const msgs = Object.values(data).flat().join(" ");
        setErro(msgs || "Erro ao criar pet.");
      } else {
        setErro(error instanceof Error ? error.message : "Erro ao criar pet.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (user?.role !== "ADMINISTRADOR") {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Novo Pet" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Novo Pet" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">

          {/* Tutor */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Tutor *</label>
            <select
              className="figma-input-white"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} ({cliente.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Nome *</label>
              <input
                className="figma-input-white"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Rex"
                required
              />
            </div>

            {/* Espécie — select da API */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Espécie *</label>
              <select
                className="figma-input-white"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                required
              >
                {especies.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>

            {/* Raça — sem números */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Raça</label>
              <input
                className="figma-input-white"
                value={raca}
                onChange={handleRacaChange}
                placeholder="Ex: Golden Retriever, SRD..."
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Data de nascimento</label>
              <input
                className="figma-input-white"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                max={hoje}
                min={minDate}
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Peso (kg) *</label>
              <input
                className="figma-input-white"
                value={peso}
                onChange={handlePesoChange}
                placeholder="Ex: 12.5"
                inputMode="decimal"
                required
              />
            </div>

            {/* Porte — select da API */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Porte</label>
              <select
                className="figma-input-white"
                value={porte}
                onChange={(e) => setPorte(e.target.value)}
              >
                <option value="">Calculado pelo peso</option>
                {portes.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea
              className="figma-input-white min-h-[100px] resize-none"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Alergias, medicações, comportamento..."
            />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Criar pet"}
            </button>
            <button type="button" onClick={() => navigate("/admin/pets")} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calcIdade(dateISO: string) {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let idade = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) idade--;
  return Math.max(0, idade);
}
