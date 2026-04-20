import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SimulationResult, Question } from "../types";
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight, MessageSquare, BookOpen, RotateCcw, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { formatSeconds } from "../lib/utils";
import PremiumOverlay from "../components/PremiumOverlay";

export default function ResultsPage() {
  const { simulationId } = useParams();
  const { user, profile } = useAuth();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !simulationId) return;

    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid, "simulations", simulationId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data() as SimulationResult;
        setResult(data);
        
        // Fetch question details for explanations
        const qIds = data.answers.map(a => a.questionId);
        const qSnap = await getDocs(query(collection(db, "questions"), where("__name__", "in", qIds)));
        const qMap: Record<string, Question> = {};
        qSnap.docs.forEach(d => { qMap[d.id] = { id: d.id, ...d.data() } as Question; });
        setQuestions(qMap);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, simulationId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10">
      <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sincronizando Dados...</p>
    </div>
  );
  
  if (!result) return <div className="p-20 text-center">Resultado não encontrado.</div>;

  const isApproved = result.score >= 70;

  // Adaptive recommendation logic
  const mistakesBySubject: Record<string, number> = {};
  result.answers.forEach(ans => {
    if (!ans.isCorrect) {
      const q = questions[ans.questionId];
      if (q) {
        mistakesBySubject[q.subject] = (mistakesBySubject[q.subject] || 0) + 1;
      }
    }
  });

  const criticalSubject = Object.entries(mistakesBySubject)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* ANAC Branding Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="bg-slate-900 px-6 py-2 rounded-lg mb-4">
           <span className="text-white font-black text-sm uppercase tracking-[0.5em] leading-none">DECOLE SIMULADOS</span>
        </div>
        
        <div className={`w-28 h-28 rounded-full flex items-center justify-center relative ${isApproved ? 'bg-success/10' : 'bg-red-50 text-red-500'}`}>
          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isApproved ? 'bg-success' : 'bg-danger'}`}></div>
          {isApproved ? (
            <Trophy className="w-14 h-14 text-success relative z-10" />
          ) : (
            <XCircle className="w-14 h-14 relative z-10" />
          )}
        </div>
        
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                {isApproved ? 'APTO PARA O VOO' : 'REVISÃO NECESSÁRIA'}
            </h1>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Este resultado é baseado nos critérios de avaliação padronizados no formato ANAC (mínimo de 70% de acerto).
            </p>
        </div>
      </div>

      {/* Performance Recommendation (New Feature) */}
      <div className="card p-8 bg-slate-900 text-white relative overflow-hidden border-none shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" strokeWidth={1} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-grow space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-accent">
                    <AlertCircle className="w-5 h-5 fill-accent hover:animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Plano de Treinamento Adaptativo</span>
                </div>
                {criticalSubject ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-black leading-tight uppercase tracking-tight mb-1">
                            Ponto Crucial: <span className="text-accent underline decoration-4 underline-offset-4">{criticalSubject[0]}</span>
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nível de acerto crítico detectado nesta disciplina</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mt-6 backdrop-blur-md relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                          <p className="text-accent text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                             <RotateCcw className="w-3 h-3" /> Recomendação de Instrutor:
                          </p>
                          <p className="text-white text-sm font-medium leading-relaxed">
                            Treine imediatamente um bloco de <span className="text-accent font-black underline">20 QUESTÕES</span> desta matéria. Nosso sistema adaptativo priorizará seus erros anteriores para consolidar sua base técnica.
                          </p>
                      </div>
                    </div>
                ) : (
                    <h3 className="text-2xl font-black leading-tight uppercase tracking-tight">
                        Seu desempenho está de acordo com os padrões ouro em todas as matérias.
                    </h3>
                )}
            </div>
            {criticalSubject && (
                <Link to={`/simulado?subject=${encodeURIComponent(criticalSubject[0])}&mode=intelligent`} className="btn-primary bg-accent text-white hover:scale-105 px-10 py-6 font-black uppercase tracking-widest text-xs whitespace-nowrap shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all">
                    Iniciar Treino Inteligente
                </Link>
            )}
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card p-6 text-center border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Aproveitamento</span>
          <div className={`text-4xl font-black ${isApproved ? 'text-success' : 'text-danger'} tracking-tighter`}>{result.score}%</div>
        </div>
        <div className="card p-6 text-center border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Acertos</span>
          <div className="text-4xl font-black text-slate-900 tracking-tighter">{result.correctCount}/{result.totalQuestions}</div>
        </div>
        <div className="card p-6 text-center border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tempo total</span>
          <div className="text-4xl font-black text-slate-900 tracking-tighter">{formatSeconds(result.timeSpentSeconds)}</div>
        </div>
        <div className="card p-6 text-center border-success/20 bg-success/5 shadow-sm">
          <span className="text-[10px] font-black text-success uppercase tracking-widest block mb-2">Média ANAC</span>
          <div className="text-4xl font-black text-success tracking-tighter">70%</div>
        </div>
      </div>

      {/* Questions list with Premium Lock */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border-base pb-6">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Relatório Técnico</h3>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full uppercase tracking-widest">Geração Padrão RBAC</span>
        </div>
        
        {!profile?.isPremium ? (
          <PremiumOverlay 
            title="Relatório Detalhado Bloqueado" 
            description="Para visualizar a explicação de cada erro e o gabarito completo, você precisa de uma conta Premium."
            benefits={[
               "Explicações detalhadas por instrutores",
               "Gabarito completo e comentado",
               "Análise de desempenho vitalícia",
               "Simulados ilimitados"
            ]}
          />
        ) : (
          <div className="space-y-6">
            {result.answers.map((ans, idx) => {
              const q = questions[ans.questionId];
              if (!q) return null;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={ans.questionId} 
                  className="card overflow-hidden border-slate-100 hover:border-slate-200 transition-all shadow-sm group"
                >
                  <div className={`p-4 flex justify-between items-center px-8 border-b ${ans.isCorrect ? 'bg-success/5 border-success/10' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questão {idx + 1}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{q.subject}</span>
                    </div>
                    {ans.isCorrect ? (
                      <span className="text-success text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 bg-success/10 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acerto Técnico
                      </span>
                    ) : (
                      <span className="text-danger text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 bg-danger/10 px-3 py-1 rounded-full">
                         <XCircle className="w-3.5 h-3.5" /> Erro Procedimental
                      </span>
                    )}
                  </div>
                  <div className="p-8 md:p-12 space-y-8">
                    <h4 className="text-xl font-bold text-slate-900 leading-snug">{q.statement}</h4>
                    
                    <div className="grid gap-3 max-w-2xl">
                      {(['a', 'b', 'c', 'd'] as const).map(letter => {
                        const isCorrect = q.correctAnswer === letter;
                        const isSelected = ans.selectedOption === letter;
                        return (
                          <div key={letter} className={`p-5 rounded-xl border flex items-center gap-6 text-sm transition-all ${
                            isCorrect ? 'border-success bg-emerald-50 text-emerald-900 shadow-sm' : 
                            isSelected ? 'border-danger bg-red-50 text-red-900 opacity-100' :
                            'border-slate-50 bg-white text-slate-400 opacity-60'
                          }`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border-2 ${
                              isCorrect ? 'bg-success text-white border-success' : 
                              isSelected ? 'bg-danger text-white border-danger' :
                              'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                              {letter.toUpperCase()}
                            </div>
                            <span className="flex-grow font-semibold text-base leading-tight">{q.options[letter]}</span>
                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                            {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-danger" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-10 p-6 bg-slate-50 border border-slate-100 rounded-2xl relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <MessageSquare className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
                          <BookOpen className="w-4 h-4" /> Comentários do Instrutor
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed italic text-lg">
                            <span className="text-primary font-black text-2xl leading-none">"</span>
                            {q.explanation}
                            <span className="text-primary font-black text-2xl leading-none">"</span>
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-slate-100">
        <Link to="/simulado" className="btn-primary w-full sm:w-auto px-12 py-5 flex items-center gap-3 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
          <RotateCcw className="w-5 h-5" /> Refazer Treinamento
        </Link>
        <Link to="/dashboard" className="btn-outline w-full sm:w-auto px-12 py-5 font-black uppercase tracking-widest text-sm">
          Ir ao Dashboard
        </Link>
      </div>
    </div>
  );
}

