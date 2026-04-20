import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { Question, Subject, SimulationResult } from "../types";
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle2, AlertCircle, X, House, BookOpen, Plane, ArrowRight } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { formatSeconds } from "../lib/utils";

export default function ExamPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retryId = searchParams.get('retry');
  const subjectParam = searchParams.get('subject');

  const [step, setStep] = useState<'setup' | 'exam' | 'saving'>('setup');
  const [selectedSubject, setSelectedSubject] = useState<Subject | "Simulado Completo">("Simulado Completo");

  useEffect(() => {
    if (subjectParam) {
      setSelectedSubject(subjectParam as any);
    }
  }, [subjectParam]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (retryId && step === 'setup') {
      const loadSingle = async () => {
        setLoading(true);
        try {
          const docSnap = await getDoc(doc(db, "questions", retryId));
          if (docSnap.exists()) {
            setQuestions([{ id: docSnap.id, ...docSnap.data() } as Question]);
            setStep('exam');
            setTimeLeft(300);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadSingle();
    }
  }, [retryId]);

  const startExam = async () => {
    // Conversion Pressure: Daily Limit check for non-premium
    if (!profile?.isPremium) {
      const today = new Date().toISOString().split('T')[0];
      const qSims = query(
        collection(db, "users", user!.uid, "simulations"),
        where("date", ">=", today)
      );
      const simSnap = await getDocs(qSims);
      if (simSnap.docs.length >= 1) {
        alert("Limite Diário Atingido: Usuários Cadetes podem realizar apenas 1 simulado por dia. Desbloqueie o Plano Premium para simulados ilimitados!");
        navigate("/upgrade");
        return;
      }
    }

    setLoading(true);
    try {
      const isIntelligentMode = searchParams.get('mode') === 'intelligent';
      
      let q;
      if (selectedSubject === "Simulado Completo") {
        q = query(collection(db, "questions"), where("isActive", "==", true));
      } else {
        q = query(collection(db, "questions"), where("subject", "==", selectedSubject), where("isActive", "==", true));
      }
      
      const snap = await getDocs(q);
      let allQ = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Question));
      
      if (allQ.length === 0) {
        setLoading(false);
        alert("Banca Vazia: Nenhuma questão encontrada para esta categoria. Ative as questões no Painel Administrativo.");
        return;
      }
      
      // Simulado Adaptativo: Se o usuário tem erros registrados, priorize-os
      let selected: Question[] = [];
      if (isIntelligentMode || profile?.isPremium) {
        const wrongSnap = await getDocs(collection(db, "users", user!.uid, "wrong_questions"));
        const wrongIds = new Set(wrongSnap.docs.map(d => d.id));
        
        if (wrongIds.size > 0) {
          const wrongPool = allQ.filter(q => wrongIds.has(q.id));
          const otherPool = allQ.filter(q => !wrongIds.has(q.id));
          
          // Preenche até 50% com erros anteriores se estiver no modo inteligente/premium
          const targetWrongCount = isIntelligentMode ? Math.min(wrongPool.length, 12) : Math.min(wrongPool.length, 6);
          const selectedWrong = wrongPool.sort(() => 0.5 - Math.random()).slice(0, targetWrongCount);
          const selectedOthers = otherPool.sort(() => 0.5 - Math.random()).slice(0, 20 - selectedWrong.length);
          
          selected = [...selectedWrong, ...selectedOthers].sort(() => 0.5 - Math.random());
        } else {
          selected = allQ.sort(() => 0.5 - Math.random()).slice(0, 20);
        }
      } else {
        selected = allQ.sort(() => 0.5 - Math.random()).slice(0, 20);
      }

      setQuestions(selected);
      setStep('exam');
      setTimeLeft(20 * 120); // 2 minutes per question
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const finishExam = async () => {
    if (isFinished || !user) return;
    setIsFinished(true);
    setStep('saving');

    try {
      const resultAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id] || "",
        isCorrect: answers[q.id] === q.correctAnswer
      }));

      const correctCount = resultAnswers.filter(a => a.isCorrect).length;
      const totalQ = questions.length || 1;
      const score = Math.round((correctCount / totalQ) * 100);

      const simulationData: Omit<SimulationResult, "id"> = {
        userId: user.uid,
        date: new Date().toISOString(),
        score,
        correctCount,
        totalQuestions: questions.length,
        timeSpentSeconds: Math.max(0, (questions.length * 120) - timeLeft),
        subject: selectedSubject,
        answers: resultAnswers
      };

      const docRef = await addDoc(collection(db, "users", user.uid, "simulations"), simulationData);
      
      // Update global user stats
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        totalAnswered: increment(questions.length),
        totalCorrect: increment(correctCount),
      });

      // Track wrong questions (Sequential is safer for simple demo, but could be batch)
      for (const ans of resultAnswers) {
        const wrongRef = doc(db, "users", user.uid, "wrong_questions", ans.questionId);
        if (!ans.isCorrect) {
          await setDoc(wrongRef, {
            userId: user.uid,
            questionId: ans.questionId,
            lastAttemptDate: new Date().toISOString(),
            errorCount: increment(1)
          }, { merge: true });
        } else if (retryId === ans.questionId) {
          await deleteDoc(wrongRef);
        }
      }

      navigate(`/resultados/${docRef.id}`);
    } catch (err) {
      console.error("Erro ao finalizar simulado:", err);
      alert("Houve um erro ao salvar seus resultados. Verifique sua conexão e tente novamente.");
      setIsFinished(false);
      setStep('exam');
    }
  };

  const [loading, setLoading] = useState(false);

  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 pb-40">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl mb-4">
             <Plane className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-display">Prep-Check de Voo</h2>
          <div className="w-20 h-1.5 bg-accent rounded-full"></div>
          <p className="text-slate-500 font-medium max-w-sm">Configure os parâmetros do seu treinamento antes da decolagem.</p>
        </div>

        <div className="card p-8 md:p-12 space-y-10 border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <BookOpen className="w-32 h-32" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Plano de Matéria</label>
                {!profile?.isPremium && (
                    <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Limite: 1/dia</span>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Simulado Completo",
                "Meteorologia",
                "Navegação Aérea",
                "Teoria de Voo",
                "Regulamentos de Tráfego Aéreo",
                "Conhecimentos Técnicos"
              ].map((m: any) => (
                <button
                  key={m}
                  onClick={() => setSelectedSubject(m)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative group overflow-hidden ${
                    selectedSubject === m 
                      ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                      : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="font-bold text-sm tracking-tight">{m}</span>
                    <div className={`w-3 h-3 rounded-full border-2 ${selectedSubject === m ? 'border-white bg-accent' : 'border-slate-300'}`}></div>
                  </div>
                  {selectedSubject === m && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-10 flex flex-col gap-6">
                <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Informações Técnicas</p>
                        <ul className="text-xs text-slate-500 space-y-1 font-medium italic">
                            <li>• Formato baseado no edital vigente da ANAC</li>
                            <li>• Tempo de prova estimado em 40 minutos</li>
                            <li>• Média de aprovação: 70%</li>
                        </ul>
                    </div>
                </div>

                <button 
                  onClick={startExam}
                  disabled={loading}
                  className="w-full btn-primary py-6 text-sm font-black uppercase tracking-[0.3em] bg-slate-900 border-none shadow-2xl hover:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-b-white rounded-full animate-spin"></div>
                  ) : (
                      <>
                        AUTORIZAR DECOLAGEM <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ao iniciar, o cronômetro passará a contar automaticamente.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'saving') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-primary/5 p-8 rounded-full mb-8"
        >
          <Plane className="w-16 h-16 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">Processando resultados...</h2>
        <p className="text-slate-500">Aguarde enquanto calculamos seu desempenho.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  if (step === 'exam' && !currentQ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <div className="bg-slate-50 p-8 rounded-full">
           <AlertCircle className="w-12 h-12 text-slate-300 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Falha na Inicialização da Banca</h3>
          <p className="text-slate-500 text-sm max-w-xs">Não foi possível carregar as questões. Verifique sua conexão ou a disponibilidade do banco de dados.</p>
        </div>
        <button onClick={() => setStep('setup')} className="btn-outline">Voltar para Ajustes</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2 rounded-xl">
               <Plane className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{currentQ?.subject}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Simulado Estilo ANAC • Ambiente Controlado</p>
            </div>
          </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 font-mono text-xl font-bold">
            <Clock className="w-5 h-5 text-slate-400" />
            {formatSeconds(timeLeft)}
          </div>
          <button 
            onClick={() => setFlagged(prev => ({ ...prev, [currentQ?.id || '']: !prev[currentQ?.id || ''] }))}
            className={`p-2.5 rounded-lg border transition-all ${
              currentQ && flagged[currentQ.id]
                ? 'bg-success/5 border-success/20 text-success' 
                : 'bg-white border-border-base text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Flag className={`w-5 h-5 ${currentQ && flagged[currentQ.id] ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-10">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`flex-grow h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'bg-primary' : 
              answers[q.id] ? 'bg-slate-300' : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="card p-8 md:p-12 mb-8 flex-grow shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20"></div>
        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4 block">Questão {currentIndex + 1} de {questions.length}</span>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-12">
          {currentQ.statement}
        </h3>

        <div className="space-y-4">
          {(['a', 'b', 'c', 'd'] as const).map((letter) => {
            const isSelected = answers[currentQ.id] === letter;
            return (
              <button
                key={letter}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: letter }))}
                className={`w-full p-5 rounded-xl border flex items-center gap-5 text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-blue-50/50 ring-1 ring-primary' 
                    : 'border-border-base bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border shrink-0 ${
                  isSelected ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-400 border-border-base'
                }`}>
                  {letter.toUpperCase()}
                </div>
                <span className={`flex-grow font-medium leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                  {currentQ.options[letter]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn-outline px-8"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button onClick={finishExam} className="btn-primary px-12 bg-success border-none text-white hover:bg-emerald-600">
            Finalizar e Corrigir
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="btn-primary px-10"
          >
            Próxima Questão <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

