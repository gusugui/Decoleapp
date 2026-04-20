import React from "react";
import { Plane, Mail, Phone, MapPin, Github, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-500 py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2 space-y-8">
            <Link to="/" className="flex items-center group">
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter uppercase text-white">DECOLE</span>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-accent ml-0.5 mt-0.5">Simulados</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm font-medium opacity-60">
              Plataforma independente de treinamento especializado para a prova teórica de Piloto Privado (PP) da ANAC. Focada em performance e aprovação técnica.
            </p>
            <div className="flex items-center gap-6">
              {[Instagram, Linkedin, Github].map((Icon, i) => (
                <Icon key={i} className="w-5 h-5 cursor-pointer hover:text-white transition-all opacity-40 hover:opacity-100" />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Navegação</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Estudar</Link></li>
              <li><Link to="/simulado" className="hover:text-white transition-colors">Simulados</Link></li>
              <li><Link to="/upgrade" className="hover:text-white transition-colors">Planos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Suporte Técnico</h4>
            <ul className="space-y-6 text-xs font-bold uppercase tracking-widest">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent" /> support@aprovapp.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent" /> (11) 99999-9999
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-accent" /> São Paulo, BR
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            © {new Date().getFullYear()} Decole Simulados. Homologado Operacionalmente.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            <span className="cursor-pointer hover:text-white transition-colors">Privacidade</span>
            <span className="cursor-pointer hover:text-white transition-colors">Termos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
