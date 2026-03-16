import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Cliente } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { Users, Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { AvatarUpload } from "../../components/ui/AvatarUpload";

export function ClientesPage() {
  const { openMenu } = useAdminShell();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRADOR";
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      alert("Somente administradores podem excluir clientes.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await api.excluirCliente(id);
        setClientes(clientes.filter(c => c.id !== id));
      } catch (error) {
        alert("Erro ao excluir cliente");
      }
    }
  };

  useEffect(() => {
    async function loadClientes() {
      try {
        const data = await api.listarTodosClientes();
        setClientes(data);
        setFilteredClientes(data);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClientes();
  }, []);

  useEffect(() => {
    const filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm)
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Clientes" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Clientes" onMenuClick={openMenu} />

      <div className="pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Gerenciar Clientes</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Total de {filteredClientes.length} clientes cadastrados
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/clientes/novo")}
            className="figma-btn inline-flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="figma-input-white pl-10 text-sm"
          />
        </div>

        {/* Clientes List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredClientes.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 font-medium">Nenhum cliente encontrado</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {searchTerm ? "Tente outra busca" : "Comece cadastrando um novo cliente"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="sm:hidden space-y-4 p-4">
                {filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <AvatarUpload
                        readonly
                        size={40}
                        fotoUrl={cliente.foto}
                        nome={cliente.nome}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{cliente.nome}</p>
                        <p className="text-xs text-slate-500">ID: #{cliente.id}</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-600">Email</p>
                        <p className="text-sm text-slate-900 truncate">{cliente.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Telefone</p>
                        <p className="text-sm text-slate-900">{cliente.telefone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Endereço</p>
                        <p className="text-sm text-slate-900 truncate">{cliente.endereco}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                        className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/admin/clientes/${cliente.id}/editar`)}
                        className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Endereço
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <AvatarUpload
                              readonly
                              size={40}
                              fotoUrl={cliente.foto}
                              nome={cliente.nome}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900">{cliente.nome}</p>
                              <p className="text-xs text-slate-500">ID: #{cliente.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-900">{cliente.email}</p>
                            <p className="text-sm text-slate-600">{cliente.telefone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-sm text-slate-900">{cliente.endereco}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/clientes/${cliente.id}/editar`)}
                              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(cliente.id)}
                                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
