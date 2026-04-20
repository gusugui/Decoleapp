import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Settings, User, CreditCard, Shield, Bell, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
        </div>
        <p className="text-slate-500 font-medium">Gerencie sua conta, assinatura e preferências do simulado.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="card p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-slate-50 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-slate-900 leading-none mb-2">{user?.displayName || "Piloto"}</h3>
            <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
            <div className="mt-4 flex gap-2">
              {profile?.isPremium ? (
                <span className="bg-success/5 text-success text-[10px] font-black px-2 py-0.5 rounded border border-success/20 uppercase">Premium Ativado</span>
              ) : (
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-200 uppercase">Acesso Básico</span>
              )}
            </div>
          </div>
          <button onClick={logout} className="p-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-4">
           {!profile?.isPremium && (
             <Link to="/upgrade" className="card p-6 flex justify-between items-center bg-blue-50/30 border-primary/20 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4 text-primary">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Upgrade para Premium</span>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
             </Link>
           )}
           
           <div className="card overflow-hidden divide-y divide-slate-50">
             <div className="p-6 flex justify-between items-center hover:bg-slate-50/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-4 text-slate-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-bold">Segurança e Privacidade</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
             </div>
             <div className="p-6 flex justify-between items-center hover:bg-slate-50/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-4 text-slate-600">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-bold">Notificações</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
             </div>
           </div>
        </div>

        <div className="text-center pt-10">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Desenvolvido por Orbitronic</p>
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Versão 1.0.4-ANAC</p>
        </div>
      </div>
    </div>
  );
}
