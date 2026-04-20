import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { ShieldCheck, BookOpen, BarChart3, Clock, CheckCircle2, Star, PlaneTakeoff, Plane } from "lucide-react";

export default function Home() {
  const { loginWithGoogle, user } = useAuth();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-white py-24 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="bg-accent text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] mb-8 inline-block shadow-lg shadow-accent/20">A ferramenta que aprova pilotos</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[0.9] uppercase">
              Simulados <span className="text-accent underline decoration-8 underline-offset-8">Estilo ANAC</span> para Piloto Privado
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 font-medium leading-relaxed opacity-90 italic">
              Treine no formato da prova real e aumente drasticamente suas chances de aprovação. +80% dos aprovados utilizam simulados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="btn-primary bg-white text-primary hover:bg-blue-50 text-lg px-10 py-5 font-black tracking-widest uppercase">
                  Acessar Dashboard
                </Link>
              ) : (
                <button onClick={loginWithGoogle} className="btn-primary bg-accent hover:opacity-90 text-lg px-10 py-5 font-black tracking-widest uppercase shadow-xl shadow-accent/20">
                  Começar agora gratuitamente
                </button>
              )}
              <a href="#features" className="btn-outline border-white/20 text-blue-100 hover:bg-white/10 text-lg px-10 py-5 font-bold uppercase tracking-widest bg-white/5">
                Saiba Mais
              </a>
            </div>
            <p className="mt-8 text-[10px] text-blue-200/40 font-bold uppercase tracking-[0.3em] font-mono">Plataforma independente de treinamento especializado</p>
          </motion.div>
        </div>
      </section>

      {/* Stats Line */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Taxa de Aprovação", value: "94%" },
            { label: "Questões Comentadas", value: "+3.000" },
            { label: "Simulados Estilo ANAC", value: "Ilimitados" },
            { label: "Atualização Base", value: "2024" },
          ].map((stat, i) => (
            <div key={i} className="card p-6 md:p-8 text-center bg-white shadow-2xl border-none ring-1 ring-slate-100">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-4">
          <span className="text-accent font-black text-[10px] uppercase tracking-[0.4em]">Metodologia</span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Estude do jeito certo</h2>
          <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: BookOpen, 
              title: "Simulados Estilo Real", 
              desc: "Treine com o mesmo tempo, quantidade de questões e interface que você encontrará no dia da sua prova ANAC." 
            },
            { 
              icon: BarChart3, 
              title: "Análise de Pontos Fracos", 
              desc: "Identifique exatamente em quais matérias você precisa focar mais. O sistema aprende com seus erros." 
            },
            { 
              icon: ShieldCheck, 
              title: "Correção Detalhada", 
              desc: "Não apenas saiba se errou, mas entenda o PORQUÊ. Todas as questões possuem explicação técnica." 
            },
          ].map((feature, i) => (
            <div key={i} className="card p-10 group hover:border-accent/30 transition-all cursor-default border-slate-100">
              <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-colors group-hover:bg-primary group-hover:text-white border border-slate-100">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Conversion Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-16">O que você ganha ao ser Premium</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    "Acesso ilimitado a todas as matérias",
                    "Mais de 3.000 questões com comentários",
                    "Simulados completos estilo prova real",
                    "Estatísticas avançadas de desempenho",
                    "Acesso vitalício (Pague apenas uma vez)",
                    "Filtros de questões inéditas",
                    "Suporte prioritário via especialistas",
                    "Treinamento adaptativo via IA"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-primary rounded-3xl p-10 md:p-16 relative overflow-hidden text-center border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
            <Plane className="w-80 h-80 text-white" />
          </div>
          <div className="relative z-10">
            <span className="bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest mb-8 inline-block shadow-lg">Oferta de Lançamento</span>
            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">PASSE DE PRIMEIRA NA <br/> BANCA DA ANAC</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-12 text-lg font-medium opacity-80">
                Pare de perder tempo com simulados desatualizados. Comece hoje seu treinamento de elite por um investimento único.
            </p>
            <div className="mb-12 bg-white/5 inline-flex flex-col p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-blue-300 line-through text-2xl font-bold">R$ 99,90</span>
                <span className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Economia 50%</span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-white text-6xl font-black tracking-tighter">R$ 49,90</span>
              </div>
              <span className="text-blue-100/40 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">Pagamento Único • Acesso Vitalício</span>
            </div>
            <div className="block">
                <Link to="/upgrade" className="btn-primary bg-accent text-white hover:opacity-90 px-16 py-6 text-xl font-black transition-transform hover:scale-105 inline-block text-center shadow-xl shadow-accent/20 uppercase tracking-widest">
                GARANTIR MEU ACESSO AGORA
                </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> Pagamento Seguro
                </div>
                <div className="flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
                    <Star className="w-4 h-4 fill-accent text-accent" /> Aprovado por Pilotos
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
