import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ShieldCheck, Zap, Star, CreditCard, Lock, ArrowRight, FlaskConical } from "lucide-react";
import { motion } from "motion/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function Upgrade() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSimulateUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { isPremium: true });
      navigate("/dashboard?success=true");
    } catch (err) {
      console.error(err);
      alert("Erro ao simular ativação.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, email: user?.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento. Verifique o console ou a configuração do Stripe.");
      }
    } catch (err) {
      console.error(err);
      alert("Houve um erro na integração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 space-y-20">
      <div className="text-center space-y-4">
        <span className="bg-primary/5 text-primary text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest inline-block">Planos e Preços</span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">INVESTIMENTO NO SEU <span className="text-accent underline underline-offset-8">FUTURO</span></h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">Escolha o plano que melhor se adapta à sua jornada. Da introdução teórica ao comando da aeronave.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch pt-12">
        {/* Free Plan */}
        <div className="card p-10 flex flex-col items-start border-slate-100 bg-slate-50/50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Cadete</div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Simulado Grátis</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Ideal para quem está começando a entender a banca da ANAC.</p>
          
          <div className="mb-10">
            <span className="text-4xl font-black text-slate-900">R$ 0</span>
            <span className="text-slate-400 text-xs font-bold ml-2">por tempo ilimitado</span>
          </div>

          <ul className="space-y-4 mb-12 flex-grow">
            {[
              "Coleção reduzida (100 questões)",
              "Apenas 1 simulado por dia",
              "Sem suporte a dúvidas",
              "Histórico limitado a 3 dias"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-slate-200" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          
          <button disabled className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${!profile?.isPremium ? 'border-primary text-primary' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {!profile?.isPremium ? 'Seu Plano Atual' : 'Disponível'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`card p-1 p-10 flex flex-col items-start border-slate-900 bg-slate-900 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${profile?.isPremium ? 'ring-4 ring-accent ring-offset-4 ring-offset-white' : ''}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-12 -translate-y-4">
            <Zap className="w-32 h-32 text-white" />
          </div>
          
          <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-6 relative z-10">Comandante</div>
          <h3 className="text-2xl font-black mb-2 relative z-10">Acesso Premium</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">O kit completo para garantir sua aprovação de primeira em conformidade com o formato ANAC.</p>
          
          <div className="mb-10 relative z-10">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-slate-600 text-lg line-through">R$ 99,90</span>
               <span className="bg-success/20 text-success text-[10px] font-black px-2 py-0.5 rounded uppercase">Economia 50%</span>
            </div>
            <span className="text-5xl font-black text-white">R$ 49,90</span>
            <span className="text-slate-500 text-xs font-bold ml-2">Pagamento Único</span>
          </div>

          <ul className="space-y-4 mb-12 flex-grow relative z-10">
            {[
              "Mais de 3.000 questões atualizadas",
              "Simulados ilimitados padrão ANAC",
              "Comentários técnicos detalhados",
              "Análise de desempenho por matéria",
              "Revisão Inteligente via IA",
              "Acesso vitalício & atualizações",
              "Suporte especializado"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={handleUpgrade}
            disabled={loading || profile?.isPremium}
            className="w-full btn-primary bg-white text-slate-900 hover:bg-slate-100 border-none py-5 text-sm font-black uppercase tracking-[0.2em] relative z-10 mb-3"
          >
            {loading ? "Sincronizando..." : profile?.isPremium ? "Licença Ativa" : "Ativar Licença Agora"}
          </button>

          {!profile?.isPremium && (
            <button 
              onClick={handleSimulateUpgrade}
              className="w-full py-3 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest relative z-10 transition-all flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-3 h-3" /> Simular Ativação (Ambiente de Teste)
            </button>
          )}
          
          <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest mx-auto relative z-10">Ativação instantânea via Stripe <Lock className="inline w-3 h-3 ml-1" /></p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-slate-100">
        {[
          { icon: ShieldCheck, title: "Segurança Stripe", desc: "Transações criptografadas pelo maior processador de pagamentos do mundo." },
          { icon: Zap, title: "Upgrade Instantâneo", desc: "Não espere para decolar. Seu acesso é liberado no exato momento da confirmação." },
          { icon: Star, title: "Satisfação Garantida", desc: "Conteúdo focado nos Editais da ANAC e atualizado constantemente." }
        ].map((item, i) => (
          <div key={i} className="space-y-3">
            <item.icon className="w-8 h-8 text-primary" />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

