import React from "react";
import { Link } from "react-router-dom";
import { Target, ChevronRight, BookOpen, Compass, Cloud, FileText, Settings, Rocket, ShieldAlert, Heart, Gauge } from "lucide-react";
import { Subject } from "../types";

const subjects = [
  { name: "Meteorologia", icon: Cloud, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Navegação Aérea", icon: Compass, color: "text-success", bg: "bg-success/5" },
  { name: "Regulamentos de Tráfego Aéreo", icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Teoria de Voo", icon: Rocket, color: "text-red-500", bg: "bg-red-50" },
  { name: "Conhecimentos Técnicos", icon: Settings, color: "text-slate-500", bg: "bg-slate-50" },
  { name: "Motores", icon: Target, color: "text-green-600", bg: "bg-green-50" },
  { name: "Performance", icon: Gauge, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Instrumentos", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
  { name: "Segurança de Voo", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Primeiros Socorros", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
];

export default function TrainingPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-success/5 p-2 rounded-lg border border-success/20">
            <Target className="w-6 h-6 text-success" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Treino por Matéria</h1>
        </div>
        <p className="text-slate-500 font-medium">Foque seus estudos em disciplinas específicas para dominar cada tópico do exame da ANAC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((s) => (
          <Link 
            key={s.name}
            to={`/simulado?subject=${encodeURIComponent(s.name)}`}
            className="card p-6 flex justify-between items-center group hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{s.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Treinar agora <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-8 bg-gradient-to-br from-primary to-slate-950 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Simulado Completo Operacional</h3>
          <p className="text-blue-100/60 text-sm">Misture todas as matérias para simular o ambiente real da prova ANAC.</p>
        </div>
        <Link to="/simulado" className="btn-primary bg-white text-primary hover:bg-blue-50 px-8 py-3 w-full md:w-auto text-center">
          Iniciar Simulado Completo
        </Link>
      </div>
    </div>
  );
}
