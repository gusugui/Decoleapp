import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Target, AlertCircle, History, Settings, Crown, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Sidebar() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "wrong_questions"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setWrongCount(snap.size);
    });
    return () => unsubscribe();
  }, [user]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, label: "Simulados", path: "/simulado" },
    { icon: Target, label: "Treino por Matéria", path: "/treino" },
    { icon: AlertCircle, label: "Questões Erradas", path: "/erradas", badge: wrongCount > 0 ? wrongCount : undefined },
    { icon: History, label: "Histórico & Evolução", path: "/historico" },
  ];

  const adminItem = user?.email === 'gustavo.sugui@orbitronic.com.br' ? {
    icon: Settings,
    label: "Painel Admin",
    path: "/admin"
  } : null;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-[calc(100vh-5rem)] sticky top-20 hidden lg:flex">
      <div className="p-6 flex-grow space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Menu Principal</p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-blue-100" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-300 group-hover:text-slate-500")} />
                {item.label}
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded leading-none",
                  isActive ? "bg-white/20 text-white" : "bg-red-50 text-red-500 border border-red-100"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {adminItem && (
          <div className="pt-4 mt-4 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Administração</p>
            <Link
              to={adminItem.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all group",
                location.pathname === adminItem.path 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <adminItem.icon className={cn("w-4 h-4", location.pathname === adminItem.path ? "text-white" : "text-slate-300 group-hover:text-slate-500")} />
                {adminItem.label}
              </div>
            </Link>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border-base space-y-4">
        {profile?.isPremium ? (
          <div className="mx-2 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3 shadow-inner">
            <div className="bg-accent p-2 rounded-lg shadow-sm">
              <Crown className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Status Pro</p>
              <p className="text-[9px] font-bold text-accent uppercase tracking-tighter">Comandante Ativo</p>
            </div>
          </div>
        ) : (
          <Link to="/upgrade" className="mx-2 p-5 rounded-2xl bg-slate-900 text-white flex flex-col gap-3 group hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <div className="flex items-center gap-2">
              <div className="bg-accent p-1.5 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Upgrade Pro</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest opacity-80">Desbloqueie Simulados ilimitados e Explicações.</p>
          </Link>
        )}

        <Link
          to="/configuracoes"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
