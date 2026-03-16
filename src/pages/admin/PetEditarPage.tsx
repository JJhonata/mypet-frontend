import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";
import { sanitizeDecimalInput, sanitizeIntegerInput, sanitizeLetters } from "../../utils/inputFormatters";

export function PetEditarPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [porte, setPorte] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const petId = Number(id);
        if (!petId) {
          setErro("Pet inválido.");
          return;
        }

        const pet = await api.obterPet(petId);
        if (!pet) {
          setErro("Pet não encontrado.");
          return;
        }

        setNome(pet.nome);
        setEspecie(pet.especie);
        setRaca(pet.raca);
        setIdade(String(pet.idade));
        setPeso(String(pet.peso));
        setPorte(pet.porte ?? "");
        setObservacoes(pet.observacoes ?? "");
      } catch (error) {
        setErro("Não foi possível carregar o pet.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function handleEspecieChange(value: string) {
    setEspecie(sanitizeLetters(value));
  }

  function handleRacaChange(value: string) {
    setRaca(sanitizeLetters(value));
  }

  function handleIdadeChange(value: string) {
    setIdade(sanitizeIntegerInput(value));
  }

  function handlePesoChange(value: string) {
    setPeso(sanitizeDecimalInput(value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErro(null);

    try {
      const petId = Number(id);
      await api.atualizarPet(petId, {
        nome,
        especie,
        raca,
        idade: Number(idade || 0),
        peso: Number(peso || 0),
        porte: porte || undefined,
        observacoes: observacoes || undefined
      });

      navigate(`/admin/pets/${petId}`, {
        state: {
          flash: {
            type: "success",
            message: "Pet atualizado com sucesso."
          }
        }
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar pet.");
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
        <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro && !nome) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro}</p>
          <button type="button" onClick={() => navigate("/admin/pets")} className="figma-btn mt-6">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input className="figma-input-white" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Espécie</label>
              <input className="figma-input-white" value={especie} onChange={(e) => handleEspecieChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Raça</label>
              <input className="figma-input-white" value={raca} onChange={(e) => handleRacaChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Porte</label>
              <input className="figma-input-white" value={porte} onChange={(e) => setPorte(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Idade (anos)</label>
              <input className="figma-input-white" type="number" min={0} inputMode="numeric" value={idade} onChange={(e) => handleIdadeChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
              <input className="figma-input-white" type="number" step="0.1" min={0} inputMode="decimal" value={peso} onChange={(e) => handlePesoChange(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea
              className="figma-input-white min-h-[100px]"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
