import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Pet, Cliente } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { PawPrint, Search, Plus, Edit, Eye } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { AvatarUpload } from "../../components/ui/AvatarUpload";

export function PetsPage() {
  const { openMenu } = useAdminShell();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [clientesData, petsData] = await Promise.all([
          api.listarTodosClientes(),
          api.listarTodosPets()
        ]);

        setPets(petsData);
        setClientes(clientesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getClienteNome = (pet: Pet) =>
    pet.nomeCliente || clientes.find(c => c.id === pet.clienteId)?.nome || "Cliente não encontrado";

  const filteredPets = pets.filter(pet =>
    pet.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.raca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteNome(pet).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Pets" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Pets" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Gerenciar Pets</h1>
            <p className="text-sm text-slate-600">Total de {filteredPets.length} pets cadastrados</p>
          </div>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => {
              if (isAdmin) navigate("/admin/pets/novo");
            }}
            title={
              isAdmin
                ? "Cadastrar novo pet"
                : "Apenas administradores podem criar pets pela área admin"
            }
            className="figma-btn inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Novo Pet
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="figma-input-white pl-10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <AvatarUpload
                  readonly
                  fotoUrl={pet.foto}
                  nome={pet.nome}
                  size={48}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Visualizar pet"
                    onClick={() => navigate(`/admin/pets/${pet.id}`)}
                    className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      title="Editar pet"
                      onClick={() => navigate(`/admin/pets/${pet.id}/editar`)}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{pet.nome}</h3>
              <div className="space-y-1 text-xs sm:text-sm text-slate-600">
                <p><span className="font-medium">Espécie:</span> {pet.especie}</p>
                <p><span className="font-medium">Raça:</span> {pet.raca}</p>
                <p><span className="font-medium">Idade:</span> {pet.idade} anos</p>
                <p><span className="font-medium">Peso:</span> {pet.peso}kg</p>
                <p className="truncate"><span className="font-medium">Dono:</span> {getClienteNome(pet)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
