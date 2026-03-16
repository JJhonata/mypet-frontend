import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, Cliente } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

export function ClientePerfil() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { openMenu } = useClienteShell();
  const [form, setForm] = useState<Omit<Cliente, "id">>({
    nome: "",
    email: "",
    telefone: "",
    endereco: ""
  });
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const clienteId = user.clienteId;
      const dados = clienteId ? await api.obterCliente(clienteId) : undefined;
      if (dados) {
        setForm({
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          endereco: dados.endereco
        });
      } else {
        setForm((old) => ({ ...old, email: user.email, nome: user.nome }));
      }
    }
    load();
  }, [user]);

  function handleChange(
    field: keyof Omit<Cliente, "id">,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="pb-10">
      <TopBarTitle title="Conta" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6">
        <div className="flex flex-col items-center">
          <AvatarUpload
            fotoUrl={user?.foto}
            nome={form.nome || user?.nome}
            onUpload={async (file) => {
              const res = await api.uploadFotoUsuario(file);
              updateUser({ foto: res.fotoUrl });
              setMensagem("Foto de perfil atualizada!");
            }}
          />
        </div>

        <div className="mt-6 animate-slide-up">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <Field
              label="Nome"
              value={form.nome}
              onChange={(v) => handleChange("nome", v)}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
            />
            <Field
              label="Telefone"
              value={form.telefone}
              onChange={(v) => handleChange("telefone", v)}
            />
            <Field
              label="Endereço"
              value={form.endereco}
              onChange={(v) => handleChange("endereco", v)}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate("/app/perfil/editar")}
              className="figma-btn-white w-full flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Editar Perfil
            </button>
          </div>

          {mensagem && (
            <div className="mt-3">
              <StatusMessage type="success" message={mensagem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type ?? "text"}
        className="figma-input-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

