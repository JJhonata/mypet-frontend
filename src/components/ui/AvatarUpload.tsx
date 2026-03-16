import { useRef, useState } from "react";
import { Camera } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AvatarUploadProps {
    /** URL atual da foto (pode ser null/undefined para usar o fallback) */
    fotoUrl?: string | null;
    /** Nome para gerar iniciais caso não haja foto */
    nome?: string;
    /** Tamanho do avatar em px (padrão: 96) */
    size?: number;
    /** Chamado após upload bem-sucedido — recebe a nova URL da foto */
    onUpload?: (arquivo: File) => Promise<void>;
    /** Forma do avatar: 'circle' ou 'rounded' (padrão: 'circle') */
    shape?: "circle" | "rounded";
    /** Emoji ou texto para usar quando nem foto nem nome estiverem disponíveis */
    fallbackEmoji?: string;
    /** Desativa a exibição do botão de câmera e a interação de clique */
    readonly?: boolean;
}

function iniciais(nome: string): string {
    return nome
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";
}

/** Converte caminho relativo do media do Django para URL absoluta */
export function resolverFotoUrl(foto?: string | null): string | null {
    if (!foto) return null;
    if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;
    // Retira barra inicial duplicada
    const path = foto.startsWith("/") ? foto : `/${foto}`;
    return `${API_BASE_URL}${path}`;
}

/**
 * Componente reutilizável de avatar com suporte a upload de foto.
 * - Mostra a foto se disponível
 * - Mostra iniciais do nome se não houver foto
 * - Mostra emoji fallback se nem nome estiver disponível
 * - Botão de câmera para upload via clique
 */
export function AvatarUpload({
    fotoUrl,
    nome,
    size = 96,
    onUpload,
    shape = "circle",
    fallbackEmoji = "🐾",
    readonly = false,
}: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
    const fotoFinal = preview ?? resolverFotoUrl(fotoUrl);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validações básicas
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png"];

        if (!ALLOWED_TYPES.includes(file.type)) {
            setErro("Formato inválido. Use JPG ou PNG.");
            return;
        }
        if (file.size > MAX_SIZE) {
            setErro("Foto muito grande. Máximo 5MB.");
            return;
        }

        // Preview imediato antes do upload
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setLoading(true);
        setErro(null);
        try {
            if (onUpload) {
                await onUpload(file);
            }
        } catch {
            setErro("Erro ao enviar a foto. Tente novamente.");
            setPreview(null);
        } finally {
            setLoading(false);
            // Reseta o input para permitir selecionar o mesmo arquivo novamente
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`relative ${shapeClass} bg-emerald-700/90 shadow-md ring-4 ring-emerald-600/40 overflow-hidden flex items-center justify-center`}
                style={{ width: size, height: size }}
            >
                {fotoFinal ? (
                    <img
                        src={fotoFinal}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                    />
                ) : nome ? (
                    <span
                        className="font-semibold text-white select-none"
                        style={{ fontSize: size * 0.28 }}
                    >
                        {iniciais(nome)}
                    </span>
                ) : (
                    <span style={{ fontSize: size * 0.42 }}>{fallbackEmoji}</span>
                )}

                {/* Overlay de carregamento */}
                {!readonly && loading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </div>
                )}

                {/* Botão de câmera */}
                {!readonly && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={loading}
                        className="absolute bottom-0 inset-x-0 h-8 bg-black/45 hover:bg-black/60 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Alterar foto"
                    >
                        <Camera className="h-4 w-4 text-white" />
                    </button>
                )}
            </div>

            {!readonly && erro && (
                <p className="text-xs text-red-500 text-center max-w-[200px]">{erro}</p>
            )}

            {/* Input oculto */}
            {!readonly && (
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-label="Selecionar foto"
                />
            )}
        </div>
    );
}
