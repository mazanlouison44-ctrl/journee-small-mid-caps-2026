import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, X } from 'lucide-react';

export const ConfirmationModal = () => {
  const { confirmationModalOpen, setConfirmationModalOpen, lastSubmittedRegistration } = useApp();

  if (!confirmationModalOpen || !lastSubmittedRegistration) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header Banner */}
        <div className="bg-blue-900 text-white p-8 text-center relative">
          <button
            onClick={() => setConfirmationModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5] text-emerald-400" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Merci pour votre inscription !
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            16<sup>ème</sup> Journée Small & Mid Caps — EuroLand Corporate
          </p>
        </div>

        {/* Modal Body - Clean & Elegant Message */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed space-y-2">
            <p className="font-bold text-slate-900 text-base font-display">
              Votre demande a bien été enregistrée.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Notre équipe va désormais étudier votre profil et construire votre agenda sur-mesure en fonction de vos demandes et des disponibilités des dirigeants. Votre planning définitif vous sera transmis ultérieurement.
            </p>
          </div>

          <button
            onClick={() => setConfirmationModalOpen(false)}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md"
          >
            FERMER LA FENÊTRE
          </button>
        </div>

      </div>
    </div>
  );
};
