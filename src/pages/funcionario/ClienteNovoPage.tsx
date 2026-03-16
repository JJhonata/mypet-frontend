import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { api } from "../../services/api";
import { StatusMessage } from "../../components/ui/StatusMessage";

function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatarCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatarCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function FuncionarioClienteNovoPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (senha && senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (senha && senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      const novo = await api.criarClienteAdmin({
        nome,
        email,
        telefone: telefone.replace(/\D/g, ""),
        cpf: cpf.replace(/\D/g, ""),
        endereco,
        pontoReferencia,
        cidade,
        estado,
        cep: cep.replace(/\D/g, ""),
        senha: senha || undefined,
        confirmar_senha: confirmarSenha || undefined,
      });
      navigate(`/funcionario/clientes/${novo.id}`, {
        state: {
          flash: { type: "success", message: "Cliente criado com sucesso." }
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
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Nome *</label>
            <input className="figma-input-white" value={nome} onChange={(e) => setNome(e.target.value.replace(/[0-9]/g, ""))} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input className="figma-input-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Telefone *</label>
              <input className="figma-input-white" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} maxLength={15} placeholder="(00) 00000-0000" required />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">CPF *</label>
            <input className="figma-input-white" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} maxLength={14} placeholder="000.000.000-00" required />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Endereço *</label>
            <input className="figma-input-white" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Ponto de Referência</label>
            <input className="figma-input-white" value={pontoReferencia} onChange={(e) => setPontoReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Cidade *</label>
              <input className="figma-input-white" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Estado *</label>
              <input className="figma-input-white" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} placeholder="CE" required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">CEP *</label>
              <input className="figma-input-white" value={cep} onChange={(e) => setCep(formatarCep(e.target.value))} maxLength={9} placeholder="00000-000" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Senha inicial *</label>
              <input className="figma-input-white" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={8} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Confirmar senha *</label>
              <input className="figma-input-white" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
            </div>
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="figma-btn">
              {saving ? "Salvando..." : "Criar cliente"}
            </button>
            <button type="button" onClick={() => navigate("/funcionario/clientes")} className="figma-btn-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
