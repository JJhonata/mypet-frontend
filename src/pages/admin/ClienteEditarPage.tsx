import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";
import { formatPhoneBR, sanitizeLetters } from "../../utils/inputFormatters";

export function ClienteEditarPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const { id } = useParams();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const clienteId = Number(id);
        if (!clienteId) {
          setErro("Cliente inválido.");
          return;
        }

        const dados = await api.obterCliente(clienteId);
        if (!dados) {
          setErro("Cliente não encontrado.");
          return;
        }

        setNome(dados.nome);
        setEmail(dados.email);
        setTelefone(dados.telefone);
        setEndereco(dados.endereco);
        setPontoReferencia(dados.pontoReferencia ?? "");
      } catch (error) {
        setErro("Não foi possível carregar os dados do cliente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (!user || (user.role !== "ADMINISTRADOR" && user.role !== "SUPER_USUARIO")) {
    return <Navigate to="/acesso-negado" replace />;
  }

  function handleNomeChange(value: string) {
    setNome(sanitizeLetters(value));
  }

  function handleTelefoneChange(value: string) {
    setTelefone(formatPhoneBR(value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSaving(true);

    try {
      const clienteId = Number(id);
      await api.atualizarCliente(clienteId, {
        nome,
        email,
        telefone,
        endereco,
        pontoReferencia
      });

      navigate(`/admin/clientes/${clienteId}`, {
        state: {
          flash: {
            type: "success",
            message: "Cliente atualizado com sucesso."
          }
        }
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível atualizar cliente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Editar Cliente" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (erro && !nome) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Editar Cliente" onMenuClick={openMenu} />
        <div className="pt-10 text-center">
          <p className="text-slate-700">{erro}</p>
          <button type="button" onClick={() => navigate("/admin/clientes")} className="figma-btn mt-6">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Editar Cliente" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input className="figma-input-white" value={nome} onChange={(e) => handleNomeChange(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="figma-input-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input className="figma-input-white" type="tel" inputMode="numeric" maxLength={15} value={telefone} onChange={(e) => handleTelefoneChange(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input className="figma-input-white" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Ponto de Referência</label>
            <input className="figma-input-white" value={pontoReferencia} onChange={(e) => setPontoReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado" />
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
