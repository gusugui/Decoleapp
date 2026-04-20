import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, getDocs, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Question } from "../types";
import { Zap, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function SmartRevision() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for the total count
    const qCount = query(collection(db, "users", user.uid, "wrong_questions"));
    const unsubscribe = onSnapshot(qCount, (snap) => {
      setWrongCount(snap.size);
    });

    const fetchSmartQuestions = async () => {
      try {
        // Fetch top 3 wrong questions by error count
        const q = query(
          collection(db, "users", user.uid, "wrong_questions"),
          orderBy("errorCount", "desc"),
          limit(3)
        );
        const snap = await getDocs(q);
        const wrongIds = snap.docs.map(d => d.data().questionId);

        if (wrongIds.length > 0) {
          const questSnap = await getDocs(query(collection(db, "questions"), where("__name__", "in", wrongIds)));
          setQuestions(questSnap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartQuestions();
    
    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl" />;

  if (questions.length === 0) return (
    <div className="card p-6 bg-slate-50 border-dashed border-2 border-slate-200">
      <div className="flex flex-col items-center text-center space-y-3">
        <Zap className="w-8 h-8 text-slate-300" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Revisão Inteligente</p>
        <p className="text-xs text-slate-500 max-w-[200px]">Complete simulados para que a IA identifique seus pontos fracos.</p>
      </div>
    </div>
  );

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revisão Inteligente</h3>
      </div>
      
      <div className="space-y-3">
        {questions.map((q) => (
          <Link 
            key={q.id}
            to={`/simulado?retry=${q.id}`}
            className="group block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{q.subject}</span>
                <p className="text-xs font-bold text-slate-700 line-clamp-2 pr-6 group-hover:text-primary transition-colors">
                  {q.statement}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <Link to="/erradas" className="block text-center text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">
        Ver Todas as {wrongCount} Pendências
      </Link>
    </div>
  );
}
