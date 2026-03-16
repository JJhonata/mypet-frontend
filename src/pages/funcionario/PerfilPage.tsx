import { FormEvent, useState } from "react";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useFuncionarioShell } from "./Layout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { formatPhoneBR, sanitizeLetters } from "../../utils/inputFormatters";

export function FuncionarioPerfilPage() {
  const { openMenu } = useFuncionarioShell();
  const { user, updateUser } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function handleNomeChange(value: string) {
    setNome(sanitizeLetters(value));
  }

  function handleTelefoneChange(value: string) {
    setTelefone(formatPhoneBR(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (novaSenha || confirmarSenha || senhaAtual) {
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        setErro("Para alterar senha, preencha os três campos de senha.");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setErro("A confirmação de senha não confere.");
        return;
      }
    }

    setLoading(true);
    try {
      await api.atualizarPerfil({ nome, telefone });
      updateUser({ nome, telefone });

      if (novaSenha) {
        await api.alterarSenha({
          senha_atual: senhaAtual,
          senha_nova: novaSenha,
          confirmar_senha_nova: confirmarSenha,
        });
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso("Perfil atualizado com sucesso.");
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Não foi possível atualizar o perfil.";
      setErro(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Meu Perfil" onMenuClick={openMenu} />

      <div className="pt-6 max-w-2xl mx-auto space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col items-center">
            <AvatarUpload
              fotoUrl={user?.foto}
              nome={nome || user?.nome}
              onUpload={async (file) => {
                const res = await api.uploadFotoUsuario(file);
                if (res.fotoUrl) updateUser({ foto: res.fotoUrl });
              }}
            />
            <p className="mt-3 text-sm text-slate-600">Atualize sua foto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Nome</label>
            <input className="figma-input-white" value={nome} onChange={(e) => handleNomeChange(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input className="figma-input-white" value={user?.email ?? ""} readOnly />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Telefone</label>
            <input className="figma-input-white" type="tel" inputMode="numeric" maxLength={15} value={telefone} onChange={(e) => handleTelefoneChange(e.target.value)} />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900">Alterar senha</p>
            <p className="text-xs text-slate-600 mt-1">Opcional</p>
          </div>

          <input
            className="figma-input-white"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Senha atual"
          />
          <input
            className="figma-input-white"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Nova senha"
          />
          <input
            className="figma-input-white"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Confirmar nova senha"
          />

          {erro && <StatusMessage type="error" message={erro} />}
          {sucesso && <StatusMessage type="success" message={sucesso} />}

          <button type="submit" disabled={loading} className="figma-btn w-full">
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
