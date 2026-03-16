import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { formatPhoneBR, sanitizeLetters } from "../../utils/inputFormatters";

export function EditarPerfilPage() {
  const { user, updateUser } = useAuth();
  const { openMenu } = useClienteShell();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatPhoneBR(e.target.value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    // Validações
    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha && novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha && !senhaAtual) {
      setErro("Digite a senha atual para alterar para uma nova senha.");
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        nome,
        email,
        telefone,
        senhaAtual,
        novaSenha
      });
      setSucesso("Perfil atualizado com sucesso!");

      // Limpa campos de senha após sucesso
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível atualizar o perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Editar Perfil" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6 max-w-2xl mx-auto">
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <AvatarUpload
            fotoUrl={user?.foto}
            nome={nome || user?.nome}
            onUpload={async (file) => {
              const res = await api.uploadFotoUsuario(file);
              updateUser({ foto: res.fotoUrl });
              setSucesso("Foto atualizada com sucesso!");
            }}
          />
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">Alterar foto de perfil</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome completo
                </label>
                <input
                  className="figma-input-white"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(sanitizeLetters(e.target.value))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  className="figma-input-white"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  className="figma-input-white"
                  type="tel"
                  value={telefone}
                  onChange={handleTelefoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
              </div>
            </div>
          </div>

          {/* Campos de Senha */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Alterar Senha</h3>
              <p className="text-sm text-slate-600 mb-4">
                Deixe em branco se não desejar alterar a senha
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  className="figma-input-white pr-12"
                  type={mostrarSenhaAtual ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                >
                  {mostrarSenhaAtual ? (
                    <EyeOff className="h-5 w-5 text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    className="figma-input-white pr-12"
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                  >
                    {mostrarNovaSenha ? (
                      <EyeOff className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    className="figma-input-white pr-12"
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                  >
                    {mostrarConfirmarSenha ? (
                      <EyeOff className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagens de erro/sucesso */}
          {erro && <StatusMessage type="error" message={erro} />}
          {sucesso && <StatusMessage type="success" message={sucesso} />}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <AnimatedButton
              type="button"
              onClick={() => navigate(-1)}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              loading={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </div>
  );
}
