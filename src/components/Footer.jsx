import React from 'react';
import { Building2, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer = () => {
  const { eventInfo, setAdminMode, adminMode } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 sm:pb-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                EC
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-blue-400 block tracking-wider">
                  EuroLand Corporate
                </span>
                <span className="text-base font-bold text-white font-display">
                  16<sup>ème</sup> Journée Small & Mid Caps 2026
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              EuroLand Corporate est une entreprise d'investissement spécialisée dans l'accompagnement des Small & Mid Caps. Organisateur référent de rencontres investisseurs privilégiées.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#accueil" className="hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#programme" className="hover:text-white transition-colors">Programme officiel</a></li>
              <li><a href="#societes" className="hover:text-white transition-colors">Sociétés participantes (36)</a></li>
              <li><a href="#infos" className="hover:text-white transition-colors">Informations pratiques & Accès</a></li>
            </ul>
          </div>

          {/* Col 3: Contact & Legal */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">Contact Organisateur</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>small-caps@elcorp.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+33 1 44 70 20 80</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{eventInfo.address}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 EuroLand Corporate — Tous droits réservés. 16ème édition Journée Small & Mid Caps.
          </div>

          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Conformité RGPD</span>
            </a>
            <span>•</span>
            <a href="#mentions" className="hover:text-slate-300 transition-colors">Mentions Légales</a>
            <span>•</span>
            <button
              onClick={() => setAdminMode(!adminMode)}
              className="text-blue-400 hover:text-white font-semibold underline"
            >
              {adminMode ? 'Quitter Admin' : 'Accès EuroLand Admin'}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
