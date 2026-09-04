import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Building2, Users, ArrowRight, CheckCircle, Clock, MapPin } from 'lucide-react';

export const Hero = () => {
  const { openWizard, companies, eventInfo } = useApp();
  const activeCompaniesCount = companies.filter(c => c.active).length;

  return (
    <section id="accueil" className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-white overflow-hidden border-b border-slate-200">
      
      {/* Background Decorator Lines - Subtle Blue */}
      <div className="absolute inset-0 subtle-grid-bg opacity-70 pointer-events-none"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-slate-100 blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Pill Event Date */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-medium">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span className="font-semibold">{eventInfo.dateFormatted}</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-600">Paris</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
              16<sup>ème</sup> Journée <br className="hidden sm:inline" />
              <span className="text-blue-900">Small & Mid Caps</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
              Rencontrez les dirigeants de sociétés cotées françaises et européennes lors d'une journée exclusivement consacrée aux échanges investisseurs / management.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={openWizard}
                className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group text-base"
              >
                <span>S'INSCRIRE</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#societes"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-base border border-slate-200"
              >
                <Building2 className="w-5 h-5 text-blue-900" />
                <span>DÉCOUVRIR LES SOCIÉTÉS</span>
              </a>
            </div>

            {/* Mini Trust Tags */}
            <div className="pt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Organisé par EuroLand Corporate</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Format sur-mesure & agenda optimisé</span>
              </div>
            </div>

          </div>

          {/* Key Metrics Cards Column */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  En un coup d'œil
                </h3>
                <p className="text-xl font-bold text-white mt-1 font-display">
                  16<sup>ème</sup> Édition — Forum Investisseurs
                </p>
              </div>

              {/* KPI 1 */}
              <div className="flex items-start space-x-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="p-3 bg-blue-900/80 rounded-lg text-blue-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white font-display">
                    {activeCompaniesCount}
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    Sociétés participantes cotées
                  </div>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="flex items-start space-x-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="p-3 bg-blue-900/80 rounded-lg text-blue-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white font-display">
                    1 journée
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    de rencontres intensives (8h30 - 18h00)
                  </div>
                </div>
              </div>

              {/* KPI 3 */}
              <div className="flex items-start space-x-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="p-3 bg-blue-900/80 rounded-lg text-blue-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white font-display">
                    One-to-One & One-to-Few
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    Formats de rendez-vous privilégiés
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Paris
                </span>
                <span>Inscriptions réservées aux professionnels</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
