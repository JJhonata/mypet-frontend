import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import { TopBarTitle } from "../../components/mobile/TopBarTitle";
import { useClienteShell } from "./ClienteLayout";
import { StatusMessage } from "../../components/ui/StatusMessage";

export function ContatosPage() {
  const navigate = useNavigate();
  const { openMenu } = useClienteShell();
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEnviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) {
      setErro("Por favor, digite sua mensagem");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSucesso(true);
      setMensagem("");
    } catch (error) {
      setErro("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="pb-10">
        <TopBarTitle title="Contatos" onMenuClick={openMenu} />
        
        <div className="pt-10 text-center animate-fade-in">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <MessageCircle className="h-10 w-10 text-emerald-700" />
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">
            Mensagem Enviada!
          </h1>
          
          <p className="text-sm text-slate-700 leading-relaxed">
            Sua mensagem foi enviada com sucesso.
            <br />
            Entraremos em contato em breve.
          </p>

          <button
            onClick={() => navigate("/app")}
            className="figma-btn mt-8 w-full"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  const ContactCard = ({ icon: Icon, title, desc, delay }: any) => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-2 animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: `${delay}ms` }}>
      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
        <Icon className="h-5 w-5 text-emerald-700" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="pb-10">
      <TopBarTitle title="Contatos" onMenuClick={openMenu} />

      <div className="px-4 sm:px-6 pt-6 space-y-6">
        {/* Infos */}
        <div className="space-y-3">
          <p className="text-sm text-slate-600 animate-fade-in">Encontre-nos através de múltiplos canais</p>
          
          <ContactCard
            icon={Phone}
            title="Telefone"
            desc="+55 88 9613-0229"
            delay={0}
          />
          
          <ContactCard
            icon={Mail}
            title="Email"
            desc="farmavetbv@gmail.com"
            delay={100}
          />
          
          <ContactCard
            icon={MapPin}
            title="Endereço"
            desc="R. José Rangel de Araújo, 120 - Centro, Boa Viagem - CE, 63870-000"
            delay={200}
          />
          
          <ContactCard
            icon={Clock}
            title="Horário"
            desc="Seg-Sex: 07:00-17:30 • Sáb: 08:00-12:00"
            delay={300}
          />
        </div>

        {/* Redes Sociais */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Redes Sociais</h2>
          </div>
          
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/522538637613581/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-lg border border-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-all hover:scale-110 text-emerald-700"
              title="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            
            <a
              href="https://www.instagram.com/farmavet_oficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-lg border border-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-all hover:scale-110 text-emerald-700"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            
            <a
              href="https://api.whatsapp.com/send/?phone=5588996130229&text&type=phone_number&app_absent=0&utm_source=ig"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-lg border border-emerald-700 flex items-center justify-center hover:bg-emerald-50 transition-all hover:scale-110 text-emerald-700"
              title="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleEnviarMensagem} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Envie uma mensagem</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Sua mensagem
            </label>
            <textarea
              className="figma-input-white min-h-[120px] resize-none"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva sua dúvida ou sugestão..."
              required
            />
          </div>

          {erro && <StatusMessage type="error" message={erro} />}

          <button
            type="submit"
            disabled={loading}
            className="figma-btn w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? "Enviando..." : "Enviar Mensagem"}
          </button>
        </form>
      </div>
    </div>
  );
}
