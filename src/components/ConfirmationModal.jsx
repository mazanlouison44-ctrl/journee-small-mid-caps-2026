import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Mail, Building2, Calendar, Clock, X, ArrowRight, Video } from 'lucide-react';

export const ConfirmationModal = () => {
  const { confirmationModalOpen, setConfirmationModalOpen, lastSubmittedRegistration, companies } = useApp();
  const [activeEmailTab, setActiveEmailTab] = useState('investor'); // 'investor' | 'euroland'

  if (!confirmationModalOpen || !lastSubmittedRegistration) return null;

  const reg = lastSubmittedRegistration;
  const { identity, availability, selectedCompanies, companyPreferences } = reg;

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Success Header Banner */}
        <div className="bg-blue-900 text-white p-6 sm:p-8 text-center relative">
          <button
            onClick={() => setConfirmationModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5] text-emerald-400" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Merci pour votre inscription !
          </h2>
          <p className="text-blue-200 text-sm mt-1 max-w-xl mx-auto">
            Votre demande de rendez-vous pour la 16<sup>ème</sup> Journée Small & Mid Caps EuroLand Corporate a bien été enregistrée.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Main Requested Message Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-sm text-blue-950 leading-relaxed text-center font-medium shadow-xs">
            <strong className="text-base text-blue-900 font-display block mb-1">
              Notre équipe va désormais étudier votre profil.
            </strong>
            Notre équipe construira votre agenda sur-mesure (rencontres physiques et visioconférences) en fonction de vos demandes et des disponibilités des dirigeants. Votre planning définitif vous sera transmis ultérieurement.
          </div>

          {/* Email Simulation Box */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-slate-100 shadow-md">
            
            {/* Header Toolbar */}
            <div className="bg-slate-800 px-5 py-3.5 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Simulation des notifications automatiques
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setActiveEmailTab('investor')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    activeEmailTab === 'investor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email Investisseur
                </button>
                <button
                  onClick={() => setActiveEmailTab('euroland')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    activeEmailTab === 'euroland' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alerte EuroLand
                </button>
              </div>
            </div>

            {/* Email Content Box */}
            <div className="p-5 font-mono text-xs text-slate-300 space-y-4 max-h-72 overflow-y-auto">
              
              {/* INVESTOR EMAIL PREVIEW */}
              {activeEmailTab === 'investor' && (
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 text-slate-400">
                    <div><strong>De :</strong> EuroLand Corporate &lt;contact@elcorp.com&gt;</div>
                    <div><strong>À :</strong> {identity.email}</div>
                    <div className="text-blue-300 mt-1">
                      <strong>Objet :</strong> Confirmation de votre inscription — Journée Small & Mid Caps 2026
                    </div>
                  </div>

                  <p>Bonjour {identity.firstName},</p>

                  <p>Nous vous confirmons la bonne réception de votre inscription à la 16ème Journée Small & Mid Caps organisée par EuroLand Corporate le mercredi 4 novembre 2026.</p>

                  <div>
                    <strong className="text-white">Vous avez demandé à rencontrer ({selectedCompanies.length} sociétés) :</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-blue-200">
                      {selectedCompanies.map((cid) => {
                        const comp = companyMap.get(cid);
                        const pref = companyPreferences[cid] || {};
                        return (
                          <li key={cid}>
                            {comp ? comp.name : cid} ({pref.format || 'One-to-One'} — Priorité : {pref.priority || 'Souhaitée'})
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <strong className="text-white">Vos disponibilités enregistrées :</strong>
                    <p className="text-slate-300 mt-0.5">
                      {availability.fullDay ? 'Toute la journée (09h00–18h00)' : availability.slots.join(' / ')}
                    </p>
                  </div>

                  <p>Votre agenda définitif vous sera transmis ultérieurement en fonction des disponibilités des sociétés (One-to-One, One-to-Few et Visioconférences).</p>

                  <p className="pt-2 text-slate-400">
                    Bien cordialement,<br />
                    <strong className="text-white">EuroLand Corporate</strong>
                  </p>
                </div>
              )}

              {/* EUROLAND INTERNAL EMAIL PREVIEW */}
              {activeEmailTab === 'euroland' && (
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-2 text-slate-400">
                    <div><strong>De :</strong> Système d'inscription JSMC 2026</div>
                    <div><strong>À :</strong> EuroLand Corporate &lt;small-caps@elcorp.com&gt;</div>
                    <div className="text-emerald-400 mt-1">
                      <strong>Objet :</strong> JSMC 2026 – Nouvelle inscription – {identity.firstName} {identity.lastName} – {identity.company}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                    <div>Nom : {identity.lastName}</div>
                    <div>Prénom : {identity.firstName}</div>
                    <div>Société : {identity.company}</div>
                    <div>Fonction : {identity.jobTitle}</div>
                    <div>Email : {identity.email}</div>
                    <div>Téléphone : {identity.phone}</div>
                    <div>Type : {identity.investorType}</div>
                    <div>Disponibilités : {availability.fullDay ? 'Toute la journée' : availability.slots.join(', ')}</div>
                  </div>

                  <div>
                    <strong className="text-white">Sociétés demandées ({selectedCompanies.length}) :</strong>
                    <div className="mt-2 space-y-2">
                      {selectedCompanies.map((cid) => {
                        const comp = companyMap.get(cid);
                        const pref = companyPreferences[cid] || {};
                        return (
                          <div key={cid} className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                            <div className="font-bold text-white">{comp ? comp.name : cid}</div>
                            <div className="text-[11px] text-slate-400">
                              Format : {pref.format || 'One-to-One'} | Actionnaire : {pref.isShareholder || 'Non'} | Connaissance : {pref.knowledgeLevel || 3}/5 | Priorité : {pref.priority || 'Souhaitée'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 text-right">
          <button
            onClick={() => setConfirmationModalOpen(false)}
            className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold px-7 py-3 rounded-xl text-sm transition-colors shadow-sm"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
