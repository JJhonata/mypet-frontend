import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Pet } from "../../services/api";
import { TopBarGreeting } from "../../components/mobile/TopBarGreeting";
import { useClienteShell } from "./ClienteLayout";
import { PawPrint, ChevronRight } from "lucide-react";
import { AvatarUpload } from "../../components/ui/AvatarUpload";

export function PetsPage() {
  const { openMenu, userName } = useClienteShell();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("mypet:user");
      if (!stored) return;
      const userData = JSON.parse(stored) as { id: number; clienteId?: number };
      const clienteId = userData.clienteId ?? userData.id;
      if (!clienteId) return;
      setPets(await api.listarPets(clienteId));
    }
    load();
  }, []);

  return (
    <div className="pb-10">
      <TopBarGreeting nome={userName} onRightClick={openMenu} />

      {pets.length === 0 ? (
        <div className="pt-10 text-center">
          <div className="mx-auto h-40 w-40 rounded-full bg-slate-100 flex items-center justify-center">
            <div className="text-slate-400">
              <PawPrint className="h-16 w-16 mx-auto" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">Ops!</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            Parece que você não tem nenhum pet
            <br />
            cadastrado no momento.
            <br />
            Adicione seu animal de estimação agora!
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/pets/novo")}
            className="figma-btn mt-8 w-full"
          >
            Toque para continuar
          </button>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          <p className="text-sm font-medium text-slate-900 animate-fade-in">Seu Pets</p>

          <ul className="space-y-4">
            {pets.map((pet, index) => (
              <li
                key={pet.id}
                onClick={() => navigate(`/app/pets/${pet.id}/editar`)}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:scale-[1.02] transition-transform hover:shadow-md animate-fade-in flex items-center gap-4 cursor-pointer relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <AvatarUpload
                    readonly
                    fotoUrl={pet.foto}
                    nome={pet.nome}
                    size={56}
                  />
                </div>
                <div className="flex-1 pr-6">
                  <p className="text-lg font-semibold text-slate-900">{pet.nome}</p>
                  <p className="text-sm text-slate-600">
                    {pet.especie ?? "Pet"} | {pet.raca ?? "Raça"}
                  </p>
                </div>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

