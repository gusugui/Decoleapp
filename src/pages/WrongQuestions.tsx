import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, getDocs, doc, getDoc, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Question, Subject } from "../types";
import { AlertCircle, BookOpen, ChevronRight, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

interface WrongQuestionRecord {
  id: string;
  questionId: string;
  lastAttemptDate: string;
  errorCount: number;
}

export default function WrongQuestions() {
  const { user } = useAuth();
  const [records, setRecords] = useState<WrongQuestionRecord[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("Todas");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "wrong_questions"),
          orderBy("lastAttemptDate", "desc")
        );
        const snap = await getDocs(q);
        const wrongRecords = snap.docs.map(d => ({ id: d.id, ...d.data() } as WrongQuestionRecord));
        setRecords(wrongRecords);

        if (wrongRecords.length > 0) {
          const qIds = [...new Set(wrongRecords.map(r => r.questionId))];
          // Firestore 'in' queries are limited to 10 elements. 
          // For a real app, we'd need to batch this or use a different strategy.
          // For now, let's fetch individual questions or use a smaller set.
          const fetchedQuestions: Record<string, Question> = {};
          
          // Helper to fetch in batches
          const batchSize = 10;
          for (let i = 0; i < qIds.length; i += batchSize) {
            const batch = qIds.slice(i, i + batchSize);
            const questSnap = await getDocs(query(collection(db, "questions"), where("__name__", "in", batch)));
            questSnap.docs.forEach(d => {
              fetchedQuestions[d.id] = { id: d.id, ...d.data() } as Question;
            });
          }
          setQuestions(fetchedQuestions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredRecords = selectedSubject === "Todas" 
    ? records 
    : records.filter(r => (questions[r.questionId] as Question)?.subject === selectedSubject);

  const subjects = ["Todas", ...new Set(Object.values(questions).filter(Boolean).map(q => (q as Question).subject))];

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg border border-red-100">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Zona de Recuperação</h1>
        </div>
        <p className="text-slate-500 font-medium">Revisão obrigatória das questões que você errou nos simulados anteriores.</p>
      </div>

      {records.length === 0 ? (
        <div className="card p-16 text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto opacity-20" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Céu de Brigadeiro!</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Você não tem questões erradas registradas. Mantenha o bom trabalho nos simulados.</p>
          </div>
          <Link to="/simulado" className="btn-primary px-8 inline-block">Fazer um Simulado</Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedSubject === s 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredRecords.map((record) => {
                const q = questions[record.questionId];
                if (!q) return null;
                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card p-6 md:p-8 group hover:border-primary/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.subject}</span>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight pr-10">{q.statement}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-red-100">
                           {record.errorCount} erros
                         </span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                           Visto em {new Date(record.lastAttemptDate).toLocaleDateString()}
                         </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div className="text-xs text-slate-500 font-medium">
                        Repita o treino para fixar o conceito técnico.
                      </div>
                      <Link 
                        to={`/simulado?retry=${q.id}`} 
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-700 transition-colors"
                      >
                        Tentar Novamente <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
