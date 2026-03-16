import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { api, Cliente, Pet } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { User } from "lucide-react";
import { AvatarUpload } from "../../components/ui/AvatarUpload";

export function FuncionarioPetDetalhesPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();
  const location = useLocation();
  const { id } = useParams();
  const flash = (location.state as { flash?: { type: "success" | "error" | "info"; message: string } } | null)?.flash;

  const [pet, setPet] = useState<Pet | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const petId = Number(id);
        if (!petId) {
          setErro("Pet inválido.");
          return;
        }

        const dadosPet = await api.obterPet(petId);
        if (!dadosPet) {
          setErro("Pet não encontrado.");
          return;
        }

        const dono = await api.obterCliente(dadosPet.clienteId);
        setPet(dadosPet);
        setCliente(dono ?? null);
      } catch (error) {
        setErro("Não foi possível carregar os dados do pet.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Pet" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro || !pet) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Pet" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro ?? "Pet não encontrado."}</p>
          <button
            type="button"
            onClick={() => navigate("/funcionario/pets")}
            className="figma-btn mt-6"
          >
            Voltar para pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Detalhes do Pet" onMenuClick={openMenu} />

      <div className="pt-6 space-y-5 max-w-2xl mx-auto">
        {flash && <StatusMessage type={flash.type} message={flash.message} />}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <AvatarUpload
              readonly
              fotoUrl={pet.foto}
              nome={pet.nome}
              size={56}
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{pet.nome}</h1>
              <p className="text-sm text-slate-600">{pet.especie} • {pet.raca}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <p><span className="font-medium">Idade:</span> {pet.idade} anos</p>
            <p><span className="font-medium">Peso:</span> {pet.peso}kg</p>
            <p><span className="font-medium">Porte:</span> {pet.porte ?? "Não informado"}</p>
            <p><span className="font-medium">Data de nascimento:</span> {pet.dataNascimento ?? "Não informada"}</p>
            <p className="sm:col-span-2">
              <span className="font-medium">Observações:</span> {pet.observacoes ?? "Sem observações"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">Tutor</h2>
          </div>
          <p className="text-sm text-slate-700">{cliente?.nome ?? "Cliente não encontrado"}</p>
          <p className="text-xs text-slate-500 mt-1">{cliente?.email ?? "-"}</p>
          <p className="text-xs text-slate-500">{cliente?.telefone ?? "-"}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(`/funcionario/pets/${pet.id}/editar`)}
            className="figma-btn"
          >
            Editar pet
          </button>
          <button
            type="button"
            onClick={() => navigate("/funcionario/pets")}
            className="figma-btn-white"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
