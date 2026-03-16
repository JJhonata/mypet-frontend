import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { api, Cliente, Pet } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";

export function FuncionarioClienteDetalhesPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();
  const location = useLocation();
  const { id } = useParams();
  const flash = (location.state as { flash?: { type: "success" | "error" | "info"; message: string } } | null)?.flash;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const clienteId = Number(id);
        if (!clienteId) {
          setErro("Cliente inválido.");
          return;
        }

        const [dadosCliente, todosPets] = await Promise.all([
          api.obterCliente(clienteId),
          api.listarTodosPets()
        ]);

        if (!dadosCliente) {
          setErro("Cliente não encontrado.");
          return;
        }

        setCliente(dadosCliente);
        setPets(todosPets.filter((pet) => pet.clienteId === clienteId));
      } catch (error) {
        setErro("Não foi possível carregar os dados do cliente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Cliente" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro || !cliente) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Detalhes do Cliente" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro ?? "Cliente não encontrado."}</p>
          <button type="button" onClick={() => navigate("/funcionario/clientes")} className="figma-btn mt-6">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Detalhes do Cliente" onMenuClick={openMenu} />

      <div className="pt-6 space-y-5 max-w-2xl mx-auto">
        {flash && <StatusMessage type={flash.type} message={flash.message} />}

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">{cliente.nome}</h1>
          <p className="text-sm text-slate-700"><span className="font-medium">Email:</span> {cliente.email}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Telefone:</span> {cliente.telefone}</p>
          <p className="text-sm text-slate-700"><span className="font-medium">Endereço:</span> {cliente.endereco}</p>
          {cliente.pontoReferencia && (
            <p className="text-sm text-slate-700"><span className="font-medium">Ponto de Referência:</span> {cliente.pontoReferencia}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Pets do cliente</h2>
          {pets.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhum pet cadastrado.</p>
          ) : (
            <ul className="space-y-2">
              {pets.map((pet) => (
                <li
                  key={pet.id}
                  className="text-sm text-slate-700 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/funcionario/pets/${pet.id}`)}
                >
                  {pet.nome} • {pet.especie} • {pet.raca}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(`/funcionario/clientes/${cliente.id}/editar`)}
            className="figma-btn"
          >
            Editar cliente
          </button>
          <button
            type="button"
            onClick={() => navigate("/funcionario/pets/novo")}
            className="figma-btn-white"
          >
            Cadastrar pet para cliente
          </button>
        </div>
      </div>
    </div>
  );
}
