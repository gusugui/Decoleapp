import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plane, User, LogOut, ShieldCheck, Menu, X, Crown, Zap } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, profile, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter uppercase text-white">DECOLE</span>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-accent ml-0.5 mt-0.5">Simulados</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-xs font-black uppercase tracking-[0.2em] text-blue-100 hover:text-white transition-colors">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-xs font-black uppercase tracking-[0.2em] text-blue-100 hover:text-white transition-colors">Estudar</Link>
                <Link to="/simulado" className="text-xs font-black uppercase tracking-[0.2em] text-blue-100 hover:text-white transition-colors text-accent">Simulados</Link>
                {!profile?.isPremium && (
                  <Link to="/upgrade" className="bg-accent text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-slate-900" /> Upgrade Pro
                  </Link>
                )}
                {user?.email === 'gustavo.sugui@orbitronic.com.br' && (
                  <Link to="/admin" className="text-xs font-black uppercase tracking-[0.2em] text-blue-100 hover:text-white transition-colors border-l border-white/10 pl-10">Admin</Link>
                )}
                <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{user.displayName}</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${profile?.isPremium ? 'text-accent' : 'text-blue-300/50'}`}>
                      {profile?.isPremium ? (
                        <>
                          <Crown className="w-2.5 h-2.5" /> Plano Pro
                        </>
                      ) : 'Nível Cadete'}
                    </p>
                  </div>
                  <button onClick={logout} className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button onClick={loginWithGoogle} className="bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] px-8 py-3 rounded-lg hover:bg-blue-50 transition-all">
                Acessar Painel
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Dashboard</Link>
              <Link to="/simulado" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Simulados</Link>
              {user?.email === 'gustavo.sugui@orbitronic.com.br' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-primary font-bold">Painel Admin</Link>
              )}
              <button onClick={() => { logout(); setIsOpen(false); }} className="block text-danger font-medium">Sair</button>
            </>
          ) : (
            <button onClick={() => { loginWithGoogle(); setIsOpen(false); }} className="w-full btn-primary">Entrar</button>
          )}
        </div>
      )}
    </nav>
  );
}
