import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Key, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminPasswordModal = () => {
  const { passwordModalOpen, setPasswordModalOpen, loginAdmin } = useApp();
  const [enteredPass, setEnteredPass] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!passwordModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = loginAdmin(enteredPass);
    if (!success) {
      setErrorMsg(true);
    } else {
      setErrorMsg(false);
      setEnteredPass('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 relative">
          <button
            onClick={() => {
              setPasswordModalOpen(false);
              setErrorMsg(false);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-bold font-display">Accès Administrateur EuroLand</h3>
          <p className="text-xs text-blue-200 mt-1">
            Cet espace est exclusivement réservé aux membres autorisés d'EuroLand Corporate.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mot de passe d'administration
            </label>
            <div className="relative">
              <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoFocus
                value={enteredPass}
                onChange={(e) => {
                  setEnteredPass(e.target.value);
                  setErrorMsg(false);
                }}
                placeholder="Entrez votre mot de passe..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Mot de passe incorrect.
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-extrabold shadow flex items-center space-x-1.5"
            >
              <span>DÉVERROUILLER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
