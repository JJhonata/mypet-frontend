import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { api } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";

function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function FuncionarioClienteEditarPage() {
  const navigate = useNavigate();
  const { openMenu } = useFuncionarioShell();
  const { id } = useParams();

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

      navigate(`/funcionario/clientes/${clienteId}`, {
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
          <button type="button" onClick={() => navigate("/funcionario/clientes")} className="figma-btn mt-6">
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
            <input className="figma-input-white" value={nome} onChange={(e) => setNome(e.target.value.replace(/[0-9]/g, ""))} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email</label>
              <input className="figma-input-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input className="figma-input-white" type="tel" maxLength={15} value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(00) 00000-0000" required />
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
