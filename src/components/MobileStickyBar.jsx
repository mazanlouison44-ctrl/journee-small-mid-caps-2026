import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const MobileStickyBar = () => {
  const { openWizard, selectedCompanyIds } = useApp();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-slate-500 block">Journée Small & Mid Caps</span>
        <span className="text-sm font-bold text-slate-900 font-display">
          {selectedCompanyIds.length > 0
            ? `${selectedCompanyIds.length} société(s) choisie(s)`
            : '4 Novembre 2026'}
        </span>
      </div>

      <button
        onClick={openWizard}
        className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow flex items-center space-x-1.5"
      >
        <span>S'INSCRIRE</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
