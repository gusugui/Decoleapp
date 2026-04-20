import React from "react";
import { Link } from "react-router-dom";
import { Lock, Crown, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface PremiumOverlayProps {
  title?: string;
  description?: string;
  benefits?: string[];
}

export default function PremiumOverlay({
  title = "Conteúdo limitado",
  description = "Você atingiu o limite gratuito. Desbloqueie o acesso completo por apenas R$ 49,90",
  benefits = [
    "Simulados ilimitados",
    "Correção comentada",
    "Estatísticas por matéria",
    "Treino estilo prova ANAC"
  ]
}: PremiumOverlayProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px] z-50 rounded-2xl flex items-center justify-center p-6 text-center border border-white/20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-slate-900 text-white p-10 rounded-3xl shadow-2xl border border-white/10"
        >
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-accent/20">
            <Lock className="w-8 h-8 text-slate-900" />
          </div>
          
          <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{title}</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            {description}
          </p>
          
          <div className="space-y-3 mb-10 text-left">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Link 
            to="/upgrade" 
            className="w-full btn-primary bg-accent hover:opacity-90 py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20"
          >
            Desbloquear agora
          </Link>
          
          <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Investimento único • Sem mensalidades
          </p>
        </motion.div>
      </div>
      
      {/* Blurred background content skeleton for "feeling" of value */}
      <div className="opacity-20 pointer-events-none select-none">
        <div className="h-20 bg-slate-100 rounded-xl mb-4 w-full"></div>
        <div className="h-20 bg-slate-100 rounded-xl mb-4 w-[90%]"></div>
        <div className="h-20 bg-slate-100 rounded-xl mb-4 w-[95%]"></div>
      </div>
    </div>
  );
}
