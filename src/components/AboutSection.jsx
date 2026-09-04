import React from 'react';
import { Building2, Calendar, Target, Briefcase, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutSection = () => {
  const { eventInfo } = useApp();

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-semibold tracking-wider uppercase">
            Présentation de l'événement
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Journée Small & Mid Caps
          </h2>
          <p className="text-base sm:text-lg text-blue-900 font-semibold">
            16<sup>ème</sup> édition — {eventInfo.dateFormatted}
          </p>
        </div>

        {/* Text Presentation Content */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 text-slate-700 leading-relaxed space-y-6">
          <p className="text-base sm:text-lg text-slate-800 font-medium">
            <strong className="text-blue-900 font-bold">EuroLand Corporate</strong> a le plaisir de vous convier à la 16<sup>ème</sup> édition de sa <strong className="text-slate-900">Journée Small & Mid Caps</strong>.
          </p>
          <p className="text-slate-600">
            Tout au long de la journée, les dirigeants de sociétés cotées de différents secteurs rencontreront investisseurs institutionnels, gérants, analystes et professionnels des marchés financiers.
          </p>
          <p className="text-slate-600">
            Les rencontres permettront aux dirigeants de présenter leur activité, leur stratégie et leurs perspectives dans le cadre de rendez-vous individuels ou en petits groupes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 text-blue-900 rounded-lg shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Échanges C-Level</h4>
                <p className="text-xs text-slate-500 mt-0.5">Direct avec les PDG & Directeurs Financiers</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 text-blue-900 rounded-lg shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Formats Sur-Mesure</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sessions One-to-One ou One-to-Few privilégiées</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 text-blue-900 rounded-lg shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Expertise EuroLand</h4>
                <p className="text-xs text-slate-500 mt-0.5">16 ans d'organisation de forums financiers</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
