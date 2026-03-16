import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { sanitizeDecimalInput } from "../../utils/inputFormatters";

type Choice = { value: string; label: string };

export function NovoPetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openMenu } = useClienteShell();

  // Choices carregadas da API
  const [especies, setEspecies] = useState<Choice[]>([]);
  const [portes, setPortes] = useState<Choice[]>([]);
  const [loadingChoices, setLoadingChoices] = useState(true);

  // Campos do formulário
  const [especie, setEspecie] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [raca, setRaca] = useState("");
  const [porte, setPorte] = useState("");
  const [peso, setPeso] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar espécies e portes da API
  useEffect(() => {
    api.obterPetChoices().then((data) => {
      setEspecies(data.especies);
      setPortes(data.portes);
      if (data.especies.length > 0) setEspecie(data.especies[0].value);
      if (data.portes.length > 0) setPorte(data.portes[0].value);
    }).finally(() => setLoadingChoices(false));
  }, []);

  // Data máxima = hoje (sem datas futuras)
  const hoje = new Date().toISOString().split("T")[0];
  // Data mínima = 100 anos atrás (bloqueia anos absurdos < 1924)
  const minDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 100);
    return d.toISOString().split("T")[0];
  })();

  function handleRacaChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Raça não pode ter números
    const val = e.target.value.replace(/[0-9]/g, "");
    setRaca(val);
  }

  function handlePesoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPeso(sanitizeDecimalInput(e.target.value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro(null);

    // Validar data
    if (dataNascimento) {
      const nascimento = new Date(dataNascimento);
      const agora = new Date();
      if (nascimento > agora) {
        setErro("A data de nascimento não pode ser no futuro.");
        return;
      }
      if (nascimento.getFullYear() < 1924) {
        setErro("Data de nascimento inválida.");
        return;
      }
    }

    // Validar peso
    const pesoNum = Number(String(peso || 0).replace(",", "."));
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setErro("Peso inválido. Informe um valor maior que zero.");
      return;
    }

    const clienteId = user.clienteId;
    if (!clienteId) {
      setErro("Não foi possível identificar seu perfil de cliente. Faça logout e login novamente.");
      return;
    }

    setSalvando(true);
    try {
      const pet = await api.criarPet(clienteId, {
        nome,
        raca,
        idade: dataNascimento ? calcIdade(dataNascimento) : 0,
        peso: pesoNum,
        especie,
        dataNascimento: dataNascimento || undefined,
        porte: porte || undefined,
        observacoes: observacoes || undefined,
      });

      // Upload opcional se houver arquivo na memória
      if (fotoFile) {
        await api.uploadFotoPet(pet.id, fotoFile);
      }

      navigate("/app/pets");
    } catch (error: any) {
      if (error?.response?.data) {
        const data = error.response.data;
        const msgs = Object.values(data).flat().join(" ");
        setErro(msgs || "Erro ao cadastrar pet.");
      } else {
        setErro(error instanceof Error ? error.message : "Erro ao cadastrar pet.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (loadingChoices) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Cadastro do Pet" onMenuClick={openMenu} />
        <div className="pt-10 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Ícone dinâmico baseado na espécie
  const iconeEspecie: Record<string, string> = {
    CAO: "🐶", GATO: "🐱", PASSARO: "🐦", COELHO: "🐰", OUTROS: "🐾",
  };

  return (
    <div className="pb-10">
      <TopBarTitle title="Cadastro do Pet" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6">
        {/* Avatar dinâmico / Imagem Upload */}
        <div className="flex flex-col items-center mb-6 animate-fade-in relative">
          <AvatarUpload
            fotoUrl={previewFoto}
            fallbackEmoji={iconeEspecie[especie]}
            nome={nome}
            shape="circle"
            onUpload={async (file) => {
              // Apenas salva o arquivo em memória para upload no submit form
              setFotoFile(file);
              const reader = new FileReader();
              reader.onload = (ev) => setPreviewFoto(ev.target?.result as string);
              reader.readAsDataURL(file);
            }}
          />
          <p className="mt-2 text-xs text-slate-500">Adicione uma foto (opcional)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nome do pet *</label>
              <input
                className="figma-input-white"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Bolinha"
                required
              />
            </div>

            {/* Espécie — select puxado da API */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Espécie *</label>
              <select
                className="figma-input-white"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
                required
              >
                {especies.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>

            {/* Raça — sem números */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Raça</label>
              <input
                className="figma-input-white"
                value={raca}
                onChange={handleRacaChange}
                placeholder="Ex: Labrador, SRD..."
              />
            </div>

            {/* Data de Nascimento — com restrições */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de nascimento</label>
              <input
                className="figma-input-white"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                max={hoje}
                min={minDate}
              />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Peso (kg) *</label>
              <input
                className="figma-input-white"
                value={peso}
                onChange={handlePesoChange}
                placeholder="Ex: 4.5"
                inputMode="decimal"
                required
              />
            </div>

            {/* Porte — select puxado da API */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Porte</label>
              <select
                className="figma-input-white"
                value={porte}
                onChange={(e) => setPorte(e.target.value)}
              >
                <option value="">Selecione o porte</option>
                {portes.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">O porte também é calculado automaticamente pelo peso.</p>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
              <textarea
                className="figma-input-white min-h-[80px] resize-none"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alergias, medicações, comportamento..."
              />
            </div>

            {erro && <StatusMessage type="error" message={erro} />}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={salvando} className="figma-btn w-full">
              {salvando ? "Salvando..." : "Concluir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calcIdade(dateISO: string) {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let idade = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) idade--;
  return Math.max(0, idade);
}
