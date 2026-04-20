import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, getDocs, addDoc, orderBy } from "firebase/firestore";
import { seedQuestions } from "../lib/seedQuestions";
import { 
  Database, Plus, Trash2, Edit3, Search, Filter, 
  Users, CreditCard, BarChart3, HelpCircle, TrendingUp, 
  ArrowUpRight, Mail, Calendar, Crown
} from "lucide-react";
import { Question, UserProfile } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { motion } from "motion/react";

export default function AdminPage() {
  const { profile: adminProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'questions' | 'users'>('metrics');

  const fetchQuestions = async () => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
  };

  const fetchUsers = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchQuestions(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedQuestions();
      alert("Questões semeadas com sucesso!");
      await fetchQuestions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculations
  const totalRevenue = users.filter(u => u.isPremium).length * 49.90;
  const premiumRate = users.length > 0 ? (users.filter(u => u.isPremium).length / users.length) * 100 : 0;
  
  const userTypeData = [
    { name: 'Premium', value: users.filter(u => u.isPremium).length },
    { name: 'Free', value: users.filter(u => !u.isPremium).length },
  ];
  const COLORS = ['#1E3A8A', '#E2E8F0'];

  // Subject Stats Helper
  const subjectStats = Object.entries(
    questions.reduce((acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => (b[1] as number) - (a[1] as number));

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Preparando Torre de Comando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel Administrativo</h1>
          <p className="text-slate-500 font-medium">Controle operacional e financeiro do Decole Simulados.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="btn-outline border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Database className="w-4 h-4" /> 
            {loading ? 'Sincronizando...' : 'Repopular Base (Admin Only)'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 space-y-2 group hover:border-primary/50 transition-all cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total de Usuários</span>
            <Users className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900">{users.length}</div>
            <div className="text-xs font-bold text-success flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-2 group hover:border-primary/50 transition-all cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inscrições Premium</span>
            <CreditCard className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900">{users.filter(u => u.isPremium).length}</div>
            <div className="text-xs font-bold text-slate-400">{premiumRate.toFixed(1)}% taxa</div>
          </div>
        </div>

        <div className="card p-6 space-y-2 group hover:border-primary/50 transition-all cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturamento Bruto</span>
            <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-success transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900">R$ {totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="card p-6 space-y-2 group hover:border-primary/50 transition-all cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Questões no Banco</span>
            <HelpCircle className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-slate-900">{questions.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-8">
        {[
          { id: 'metrics', label: 'Métricas de Acesso', icon: BarChart3 },
          { id: 'questions', label: 'Banco de Questões', icon: Database },
          { id: 'users', label: 'Gestão de Alunos', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'metrics' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">Destribuição de Planos</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                {userTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-xs font-bold text-slate-600">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">Atividade por Categoria</h3>
              <div className="space-y-4">
                {subjectStats.slice(0, 5).map(([subject, count]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{subject}</span>
                      <span className="text-slate-400">{(count as number)} questões</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${((count as number) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-xl flex-grow max-w-md">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400" 
                  placeholder="Filtrar simulados ou categorias..." 
                />
              </div>
              <div className="flex items-center gap-3">
                 <button className="btn-outline flex items-center gap-2 px-6"><Filter className="w-4 h-4" /> Filtros</button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Matéria</th>
                    <th className="px-6 py-4 w-1/2">Enunciado</th>
                    <th className="px-6 py-4 text-center">Nível</th>
                    <th className="px-6 py-4 text-right">Frequência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-500 uppercase">
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">{q.statement}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                          q.isPremium ? 'text-success bg-success/5 border-success/20' : 'text-slate-400 bg-slate-50 border-slate-100'
                        }`}>
                          {q.isPremium ? 'Premium' : 'Livre'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-slate-400">82% acertos</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {questions.length === 0 && (
                <div className="p-20 text-center text-slate-400 italic font-medium">Banca carregando do espaço... Utilize o botão semear se necessário.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Base Geral de Alunos</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Estudante</th>
                    <th className="px-6 py-4">Inscrição</th>
                    <th className="px-6 py-4">Acesso</th>
                    <th className="px-6 py-4 text-right">Última Prática</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Users className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{u.displayName || 'Piloto Anônimo'}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                              <Mail className="w-2.5 h-2.5" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.isPremium ? (
                          <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/5 px-2 py-1 rounded border border-success/20 uppercase tracking-tighter">
                            <Crown className="w-3 h-3" /> Comandante
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-tighter">
                            Cadete
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-black text-slate-700">{u.totalAnswered} Questões</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-20 text-center text-slate-400 italic font-medium">Torre de controle: Nenhum aluno em solo.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
