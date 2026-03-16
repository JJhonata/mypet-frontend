import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { api, Pet } from "../../services/api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { StatusMessage } from "../../components/ui/StatusMessage";
import { useAuth } from "../../context/AuthContext";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { sanitizeDecimalInput, sanitizeLetters } from "../../utils/inputFormatters";

export function EditarPetPage() {
    const navigate = useNavigate();
  const { openMenu } = useClienteShell();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [pet, setPet] = useState<Pet | null>(null);

    // Campos do formulário
    const [nome, setNome] = useState("");
    const [especie, setEspecie] = useState("");
    const [raca, setRaca] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [peso, setPeso] = useState("");
    const [porte, setPorte] = useState("");
    const [observacoes, setObservacoes] = useState("");

    // Foto guardada separada (enviada via onUpload diretamente se quiser ou salvando aqui para upload)
    // No caso de edição, a foto já faz upload instantâneo pelo componente AvatarUpload

    useEffect(() => {
        async function load() {
            try {
                const petId = Number(id);
                if (!petId) {
                    setErro("Pet inválido.");
                    return;
                }

                const dadosPet = await api.obterPet(petId);
                if (!dadosPet) {
                    setErro("Pet não encontrado.");
                    return;
                }

                // Cliente só pode editar seu próprio pet
                if (dadosPet.clienteId !== user?.clienteId && dadosPet.clienteId !== user?.id) {
                    setErro("Você não tem permissão para editar este pet.");
                    return;
                }

                setPet(dadosPet);
                setNome(dadosPet.nome);
                setEspecie(dadosPet.especie ?? "");
                setRaca(dadosPet.raca ?? "");
                setDataNascimento(dadosPet.dataNascimento ?? "");
                setPeso(String(dadosPet.peso ?? ""));
                setPorte(dadosPet.porte ?? "");
                setObservacoes(dadosPet.observacoes ?? "");

            } catch (error) {
                setErro("Não foi possível carregar os dados do pet.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, user]);

    function handleRacaChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/[0-9]/g, "");
        setRaca(val);
    }

    function handleEspecieChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEspecie(sanitizeLetters(e.target.value));
    }

    function handlePesoChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPeso(sanitizeDecimalInput(e.target.value));
    }

    const hoje = new Date().toISOString().split("T")[0];
    const minDate = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 100);
        return d.toISOString().split("T")[0];
    })();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSalvando(true);
        setErro(null);

        // Validação data
        if (dataNascimento) {
            const nas = new Date(dataNascimento);
            const agora = new Date();
            if (nas > agora) {
                setErro("A data de nascimento não pode estar no futuro.");
                setSalvando(false);
                return;
            }
            if (nas.getFullYear() < 1924) {
                setErro("A data de nascimento inválida.");
                setSalvando(false);
                return;
            }
        }

        // Validação de peso
        const pesoNum = Number(String(peso || 0).replace(",", "."));
        if (isNaN(pesoNum) || pesoNum <= 0) {
            setErro("Peso inválido. Informe um valor maior que zero.");
            setSalvando(false);
            return;
        }

        try {
            const petId = Number(id);
            await api.atualizarPet(petId, {
                nome,
                especie,
                raca,
                peso: pesoNum,
                porte: porte || undefined,
                dataNascimento: dataNascimento || undefined,
                observacoes: observacoes || undefined
            });

            navigate("/app/pets", {
                state: {
                    flash: {
                        type: "success",
                        message: "Perfil do seu pet editado com sucesso!"
                    }
                }
            });
        } catch (error: any) {
            if (error?.response?.data) {
                const data = error.response.data;
                const msgs = Object.values(data).flat().join(" ");
                setErro(msgs || "Erro ao atualizar dados do pet.");
            } else {
                setErro(error instanceof Error ? error.message : "Erro ao atualizar pet.");
            }
        } finally {
            setSalvando(false);
        }
    }

    if (loading) {
        return (
            <div className="pb-10">
                <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />
                <div className="pt-10 flex justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (erro && !pet) {
        return (
            <div className="pb-10">
                <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />
                <div className="pt-10 text-center">
                    <p className="text-slate-700">{erro}</p>
                    <button type="button" onClick={() => navigate("/app/pets")} className="figma-btn mt-6">
                        Voltar para Meus Pets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <TopBarTitle title="Editar Pet" onMenuClick={openMenu} />

            <div className="px-4 sm:px-6 pt-6 max-w-2xl mx-auto">
                {/* Header foto perfil iterativo */}
                {pet && (
                    <div className="flex flex-col items-center mb-6">
                        <AvatarUpload
                            fotoUrl={pet.foto}
                            nome={pet.nome}
                            size={110}
                            shape="circle"
                            onUpload={async (file) => {
                                const res = await api.uploadFotoPet(pet.id, file);
                                setPet({ ...pet, foto: res.fotoUrl });
                            }}
                        />
                        <p className="mt-2 text-xs text-slate-500 font-medium">Toque para atualizar a foto</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Nome do pet *</label>
                            <input
                                className="figma-input-white"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Espécie *</label>
                                <input
                                    className="figma-input-white"
                                    value={especie}
                                    onChange={handleEspecieChange}
                                    placeholder="Ex: CAO, GATO..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Raça</label>
                                <input
                                    className="figma-input-white"
                                    value={raca}
                                    onChange={handleRacaChange}
                                />
                            </div>

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

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Peso (kg) *</label>
                                <input
                                    className="figma-input-white"
                                    value={peso}
                                    onChange={handlePesoChange}
                                    inputMode="decimal"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Porte</label>
                                <select
                                    className="figma-input-white"
                                    value={porte}
                                    onChange={(e) => setPorte(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="MINI">Mini (até 5kg)</option>
                                    <option value="PEQUENO">Pequeno (5-10kg)</option>
                                    <option value="MEDIO">Médio (10-20kg)</option>
                                    <option value="GRANDE">Grande (20-40kg)</option>
                                    <option value="GIGANTE">Gigante (acima de 40kg)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                            <textarea
                                className="figma-input-white min-h-[80px]"
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                            />
                        </div>

                        {erro && <StatusMessage type="error" message={erro} />}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="submit" disabled={salvando} className="figma-btn flex-1">
                            {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="figma-btn-white flex-1">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
