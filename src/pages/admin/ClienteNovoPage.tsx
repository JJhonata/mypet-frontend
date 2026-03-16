import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useAdminShell } from "./AdminLayout";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { formatCpf, formatPhoneBR, sanitizeIntegerInput, sanitizeLetters } from "../../utils/inputFormatters";

export function ClienteNovoPage() {
  const navigate = useNavigate();
  const { openMenu } = useAdminShell();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [senha, setSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!user || (user.role !== "ADMINISTRADOR" && user.role !== "SUPER_USUARIO")) {
    return <Navigate to="/acesso-negado" replace />;
  }

  function handleNomeChange(value: string) {
    setNome(sanitizeLetters(value));
  }

  function handleTelefoneChange(value: string) {
    setTelefone(formatPhoneBR(value));
  }

  function handleCpfChange(value: string) {
    setCpf(formatCpf(value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSaving(true);

    try {
      const novo = await api.criarClienteAdmin({
        nome,
        email,
        telefone: sanitizeIntegerInput(telefone),
        cpf,
        endereco,
        pontoReferencia,
        senha: senha || undefined
      });
      navigate(`/admin/clientes/${novo.id}`, {
        state: {
          flash: {
            type: "success",
            message: "Cliente criado com sucesso."
          }
        }
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar cliente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Novo Cliente" onMenuClick={openMenu} />

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
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">CPF</label>
            <input className="figma-input-white" inputMode="numeric" maxLength={14} value={cpf} onChange={(e) => handleCpfChange(e.target.value)} placeholder="000.000.000-00" required />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input className="figma-input-white" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Ponto de Referência</label>
            <input className="figma-input-white" value={pontoReferencia} onChange={(e) => setPontoReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado" />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Senha inicial (opcional)</label>
            <input className="figma-input-white" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Criar cliente"}
            </button>
            <button type="button" onClick={() => navigate("/admin/clientes")} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
