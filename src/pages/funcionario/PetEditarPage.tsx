import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";

function calcPorte(peso: number): string {
  if (peso < 5) return "Mini (até 5kg)";
  if (peso < 10) return "Pequeno (5-10kg)";
  if (peso < 20) return "Médio (10-20kg)";
  if (peso < 40) return "Grande (20-40kg)";
  return "Gigante (acima de 40kg)";
}

export function FuncionarioPetEditarPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
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
        setObservacoes(pet.observacoes ?? "");
      } catch (error) {
        setErro("Não foi possível carregar o pet.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErro(null);

    try {
      const petId = Number(id);
      const pesoNum = Math.round(Number(peso || 0) * 100) / 100;
      await api.atualizarPet(petId, {
        nome,
        especie,
        raca,
        idade: Number(idade || 0),
        peso: pesoNum,
        observacoes: observacoes || undefined
      });

      navigate(`/funcionario/pets/${petId}`, {
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
          <button type="button" onClick={() => navigate("/funcionario/pets")} className="figma-btn mt-6">
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
              <select className="figma-input-white" value={especie} onChange={(e) => setEspecie(e.target.value)} required>
                <option value="CAO">Cão</option>
                <option value="GATO">Gato</option>
                <option value="PASSARO">Pássaro</option>
                <option value="COELHO">Coelho</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Raça</label>
              <input className="figma-input-white" value={raca} onChange={(e) => setRaca(e.target.value.replace(/[0-9]/g, ""))} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Idade (anos)</label>
              <input className="figma-input-white" type="number" min={0} value={idade} onChange={(e) => setIdade(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
              <input className="figma-input-white" type="number" step="0.01" min={0} value={peso} onChange={(e) => setPeso(e.target.value)} required />
              {peso && (() => { const p = Number(peso); return !isNaN(p) && p > 0 ? <p className="text-xs text-slate-500 mt-1">Porte: {calcPorte(p)}</p> : null; })()}
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
