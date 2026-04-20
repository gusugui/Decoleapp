import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SimulationResult } from "../types";
import { History, Calendar, Award, Clock, ChevronRight, BarChart3, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatSeconds } from "../lib/utils";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

export default function HistoryPage() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "simulations"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        setSimulations(snap.docs.map(d => ({ id: d.id, ...d.data() } as SimulationResult)));
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const chartData = [...simulations].reverse().map(s => ({
    data: new Date(s.date).toLocaleDateString(),
    score: s.score
  }));

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <History className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Diário de Bordo</h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Histórico Operacional & Evolução</p>
          </div>
        </div>
      </div>

      {simulations.length > 0 && (
        <div className="card p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Gráfico de Evolução (%)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="data" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1E3A8A', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1E3A8A" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Lista de Atividades
        </h3>
        
        <div className="space-y-3">
          {simulations.map((sim) => (
            <Link 
              key={sim.id}
              to={`/resultados/${sim.id}`}
              className="card overflow-hidden hover:border-primary/50 transition-all flex items-center p-6 gap-6 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sim.score >= 70 ? 'bg-success/10 text-success' : 'bg-red-50 text-red-500'}`}>
                <Award className="w-6 h-6" />
              </div>
              
              <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Matéria</p>
                  <p className="text-xs font-black text-slate-900 truncate">{sim.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aproveitamento</p>
                  <p className={`text-xs font-black ${sim.score >= 70 ? 'text-success' : 'text-danger'}`}>{sim.score}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duração</p>
                  <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatSeconds(sim.timeSpentSeconds)}
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <p className="text-[10px] font-bold text-slate-400 mr-4">
                    {new Date(sim.date).toLocaleDateString()}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}

          {simulations.length === 0 && (
            <div className="card p-12 text-center text-slate-400 italic">
              Você ainda não realizou nenhum simulado operacional.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
