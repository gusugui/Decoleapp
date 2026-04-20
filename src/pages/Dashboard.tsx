import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SimulationResult, Subject } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { BookOpen, Trophy, Clock, AlertTriangle, ArrowRight, Plane, ListChecks, BarChart3, ShieldCheck, CheckCircle2, Crown, Zap } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import SmartRevision from "../components/SmartRevision";
import { doc, updateDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lastSimulations, setLastSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Handle Stripe Success Callback or Manual Simulate Success
    const successParam = searchParams.get('success');
    if (successParam === 'true' && profile && !profile.isPremium) {
      const activatePremium = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { isPremium: true });
          setShowSuccessToast(true);
          
          // Clear params after activation
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('success');
          newParams.delete('session_id');
          setSearchParams(newParams);
          
          setTimeout(() => setShowSuccessToast(false), 5000);
        } catch (err) {
          console.error("Erro ao ativar premium:", err);
        }
      };
      activatePremium();
    }

    const fetchSims = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "simulations"),
          orderBy("date", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        setLastSimulations(snap.docs.map(d => ({ id: d.id, ...d.data() } as SimulationResult)));
      } catch (err) {
        console.error("Error fetching simulations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSims();
  }, [user, profile, searchParams]); // Added profile and searchParams to dependencies

  const COLORS = ['#1a365d', '#10B981', '#38a169', '#2b6cb0', '#a0aec0'];

  const subjectPerformance = profile?.statsBySubject 
    ? Object.entries(profile.statsBySubject).map(([name, stats]) => {
        const s = stats as { total: number; correct: number };
        return {
          name,
          porcentagem: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        };
      })
    : [];

  return (
    <div className={`p-6 md:p-8 space-y-6 max-w-7xl mx-auto relative min-h-screen transition-colors duration-1000 ${profile?.isPremium ? 'bg-white' : ''}`}>
      {profile?.isPremium && (
        <>
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.03),transparent_40%)] pointer-events-none -z-10 animate-pulse"></div>
          {/* Top Sticky Badge for Pro */}
          <div className="flex justify-center mb-4">
             <div className="bg-slate-900 border border-accent/30 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                <div className="bg-accent p-1 rounded-full">
                  <Crown className="w-3 h-3 text-slate-900" />
                </div>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Acesso Comandante PRO Liberado</span>
             </div>
          </div>
        </>
      )}
      
      {showSuccessToast && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-success text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Acesso Premium Ativado!</p>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Bem-vindo a bordo, Comandante.</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="ml-4 opacity-50 hover:opacity-100">
            <AlertTriangle className="w-4 h-4 rotate-45" />
          </button>
        </motion.div>
      )}

      {/* Welcome Hero */}
      <div className={`card p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-all duration-500 ${profile?.isPremium ? 'border-accent/40 shadow-[0_0_40px_-10px_rgba(249,115,22,0.1)]' : 'border-slate-100'}`}>
        {profile?.isPremium && (
          <div className="absolute top-0 right-0">
            <div className="bg-accent text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] px-12 py-1.5 rotate-45 translate-x-10 translate-y-3 shadow-lg">
              Plano Pro
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-8 relative z-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-inner transition-all duration-500 bg-slate-900 text-white ${profile?.isPremium ? 'ring-4 ring-accent/20' : ''}`}>
            {profile?.isPremium ? <Crown className="w-10 h-10 text-accent" /> : <Plane className="w-10 h-10" />}
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                {profile?.isPremium ? 'Comandante Pro' : 'Cadete em Treinamento'}
              </h1>
              {profile?.isPremium ? (
                <span className="bg-success/10 text-success text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-success/20">Acesso Total Ativo</span>
              ) : (
                <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">Acesso Limitado</span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
              {profile?.isPremium 
                ? "Sua preparação está no nível de elite. Utilize todas as ferramentas para garantir sua aprovação de primeira."
                : "Aprovação requer prática constante. Treine hoje no formato real da prova para evitar surpresas na banca."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
          {!profile?.isPremium && (
            <Link to="/upgrade" className="btn-outline border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white whitespace-nowrap px-10 py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all">
              <Zap className="w-4 h-4" /> Desbloquear Tudo
            </Link>
          )}
          <Link to="/simulado" className="btn-primary bg-primary hover:bg-primary/90 text-white whitespace-nowrap px-10 py-4 flex items-center justify-center font-black uppercase tracking-widest text-xs group shadow-xl shadow-primary/20">
            {profile?.isPremium ? 'Iniciar Simulado Pro' : 'Simulado Grátis'} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Questões Respondidas</span>
          <div className="text-2xl font-bold text-slate-900">{profile?.totalAnswered || 0}</div>
        </div>
        <div className="card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Média de Acerto</span>
          <div className="text-2xl font-bold text-slate-900">
            {profile?.totalAnswered && profile.totalAnswered > 0 
              ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100) 
              : 0}%
            <span className="text-xs text-success ml-2 font-medium">+2%</span>
          </div>
        </div>
        <div className="card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tempo de Estudo</span>
          <div className="text-2xl font-bold text-slate-900">12h 45m</div>
        </div>
        <div className="card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Simulados Feitos</span>
          <div className="text-2xl font-bold text-slate-900">{lastSimulations.length}</div>
        </div>
      </div>

      {/* Bottom Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subjects Progress */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Progresso por Disciplina</h3>
            <Link to="/simulado" className="text-xs font-bold text-primary hover:underline">Ver todas</Link>
          </div>
          
          <div className="space-y-4">
            {subjectPerformance.length > 0 ? (
              subjectPerformance.map(subject => (
                <div key={subject.name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                  <div className="flex-grow">
                    <span className="text-sm font-semibold text-slate-800 mb-2 block leading-none">{subject.name}</span>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${subject.porcentagem}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link 
                    to={`/simulado?subject=${encodeURIComponent(subject.name)}`}
                    className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-all"
                  >
                    Treinar {subject.porcentagem}%
                  </Link>
                </div>
              ))
            ) : (
              ["Navegação Aérea", "Meteorologia", "Regulamentos de Tráfego Aéreo", "Teoria de Voo"].map(name => (
                <div key={name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                  <div className="flex-grow">
                    <span className="text-sm font-semibold text-slate-800 mb-2 block leading-none">{name}</span>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                  </div>
                  <Link 
                    to={`/simulado?subject=${encodeURIComponent(name)}`}
                    className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-all"
                  >
                    Treinar 0%
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Premium Upgrade / Status */}
        <div className="space-y-6">
          <SmartRevision />
          {!profile?.isPremium ? (
            <div className="bg-gradient-to-br from-primary to-slate-950 text-white p-8 rounded-xl shadow-xl flex flex-col items-center text-center">
              <span className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-4">Acesso Vitalício</span>
              <h3 className="text-xl font-bold mb-2">Desbloqueie o Decole Simulados Premium</h3>
              <p className="text-blue-100/70 text-sm mb-8">Tenha acesso a mais de 2.000 questões comentadas e simulados ilimitados.</p>
              
              <div className="mb-8">
                <span className="text-4xl font-black">R$ 49,90</span>
                <span className="text-[10px] opacity-60 block mt-1 uppercase tracking-widest">/ pagamento único</span>
              </div>
              
              <Link to="/upgrade" className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors text-center">
                QUERO SER PREMIUM
              </Link>
              <p className="text-[10px] opacity-40 mt-6 leading-relaxed capitalize">Garantia de aprovação ou seu dinheiro de volta.</p>
            </div>
          ) : (
            <div className="card p-6 bg-success/5 border-success/20 text-center">
              <div className="w-12 h-12 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Status: Premium ✅</h3>
              <p className="text-slate-500 text-xs mb-6">Você tem acesso ilimitado a todos os módulos de treinamento.</p>
              <Link to="/simulado" className="btn-outline w-full py-3">Iniciar Prática</Link>
            </div>
          )}

          {/* Last simulations mini-table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">Últimas Atividades</h4>
              <Link to="/historico" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Ver tudo</Link>
            </div>
            <div className="space-y-3">
              {lastSimulations.map(sim => (
                <div key={sim.id} className="flex justify-between items-center text-xs p-2 rounded hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{sim.subject}</span>
                    <span className="text-[10px] text-slate-400">{new Date(sim.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-black ${sim.score >= 70 ? 'text-success' : 'text-danger'}`}>{sim.score}%</span>
                </div>
              ))}
              {lastSimulations.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum simulado ainda.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

