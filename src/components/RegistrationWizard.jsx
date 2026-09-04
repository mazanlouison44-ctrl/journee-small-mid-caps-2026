import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TIME_SLOTS } from '../data/companies';
import { CompanyLogo } from './CompaniesSection';
import {
  X, Check, ArrowRight, ArrowLeft, AlertCircle, Building2, User, Clock,
  Calendar, CheckCircle2, Search, Sliders, ShieldCheck, Sparkles, AlertTriangle,
  HelpCircle, ChevronDown, ChevronUp, Sun, Sunset, CalendarDays, Settings
} from 'lucide-react';

export const RegistrationWizard = () => {
  const {
    wizardOpen,
    setWizardOpen,
    wizardStep,
    setWizardStep,
    companies,
    selectedCompanyIds,
    setSelectedCompanyIds,
    toggleSelectCompany,
    submitRegistration
  } = useApp();

  // Form State
  const [identity, setIdentity] = useState({
    civility: 'Monsieur',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    investorType: 'Société de gestion'
  });

  // Simplified Availability Presets: 'fullDay' | 'morning' | 'afternoon' | 'custom'
  const [availabilityPreset, setAvailabilityPreset] = useState('fullDay');

  const [availability, setAvailability] = useState({
    fullDay: true,
    slots: TIME_SLOTS,
    notes: ''
  });

  const [showCustomSlots, setShowCustomSlots] = useState(false);

  // Company Preferences object mapping companyId -> { format, isShareholder, knowledgeLevel, priority }
  const [companyPreferences, setCompanyPreferences] = useState({});
  const [expandedPrefId, setExpandedPrefId] = useState(null);

  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [companySearch, setCompanySearch] = useState('');

  // Handle Preset Button Click (1-Click Selection)
  const applyPreset = (presetKey) => {
    setAvailabilityPreset(presetKey);

    if (presetKey === 'fullDay') {
      setAvailability({
        fullDay: true,
        slots: TIME_SLOTS,
        notes: availability.notes
      });
      setShowCustomSlots(false);
    } else if (presetKey === 'morning') {
      const morningSlots = ['09h00 - 10h00', '10h00 - 11h00', '11h00 - 12h00', '12h00 - 13h00'];
      setAvailability({
        fullDay: false,
        slots: morningSlots,
        notes: availability.notes
      });
      setShowCustomSlots(false);
    } else if (presetKey === 'afternoon') {
      const afternoonSlots = ['14h00 - 15h00', '15h00 - 16h00', '16h00 - 17h00', '17h00 - 18h00'];
      setAvailability({
        fullDay: false,
        slots: afternoonSlots,
        notes: availability.notes
      });
      setShowCustomSlots(false);
    } else if (presetKey === 'custom') {
      setShowCustomSlots(true);
    }
  };

  // Initialize company preferences with sensible defaults
  useEffect(() => {
    setCompanyPreferences((prev) => {
      const next = { ...prev };
      selectedCompanyIds.forEach((id) => {
        if (!next[id]) {
          next[id] = {
            format: 'One-to-One',
            isShareholder: 'Non',
            knowledgeLevel: 3,
            priority: 'Souhaitée'
          };
        }
      });
      return next;
    });
  }, [selectedCompanyIds]);

  // Active companies list (sorted alphabetically)
  const activeCompanies = useMemo(() => {
    return [...companies]
      .filter((c) => c.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [companies]);

  // Selected company objects
  const selectedCompaniesList = useMemo(() => {
    return activeCompanies.filter((c) => selectedCompanyIds.includes(c.id));
  }, [activeCompanies, selectedCompanyIds]);

  // Helper slot toggle for custom slot view
  const handleSlotToggle = (slot) => {
    setAvailability((prev) => {
      const isSelected = prev.slots.includes(slot);
      const newSlots = isSelected
        ? prev.slots.filter((s) => s !== slot)
        : [...prev.slots, slot];

      setAvailabilityPreset('custom');
      return {
        ...prev,
        fullDay: newSlots.length === TIME_SLOTS.length,
        slots: newSlots
      };
    });
  };

  // Cross-check company time constraints (e.g. Sword availability check)
  const constraintWarnings = useMemo(() => {
    const warnings = [];

    selectedCompaniesList.forEach((company) => {
      if (company.availabilityConstraint && company.availabilityConstraint.allowedSlots) {
        const allowed = company.availabilityConstraint.allowedSlots;
        const userSlots = availability.fullDay ? TIME_SLOTS : availability.slots;

        const hasOverlap = allowed.some((slot) => userSlots.includes(slot));
        if (!hasOverlap) {
          warnings.push({
            companyName: company.name,
            text: `Disponibilité ${company.name} : Vos horaires sélectionnés (${availabilityPreset === 'morning' ? 'Matin' : 'Après-midi'}) ne couvrent pas les heures de présence de ${company.name} (10h-12h et 15h-16h).`
          });
        }
      }
    });

    return warnings;
  }, [selectedCompaniesList, availability, availabilityPreset]);

  if (!wizardOpen) return null;

  // Validation per step
  const canGoToStep2 =
    identity.firstName.trim() !== '' &&
    identity.lastName.trim() !== '' &&
    identity.email.trim() !== '' &&
    identity.company.trim() !== '';

  const canGoToStep3 =
    availability.fullDay || availability.slots.length > 0;

  const canGoToStep4 = selectedCompanyIds.length > 0;

  const canSubmit = rgpdAccepted;

  const handleNextStep = () => {
    if (wizardStep === 1 && !canGoToStep2) {
      alert('Veuillez remplir les champs obligatoires (*)');
      return;
    }
    if (wizardStep === 2 && !canGoToStep3) {
      alert('Veuillez sélectionner au moins un créneau horaire ou une formule de disponibilité');
      return;
    }
    if (wizardStep === 3 && !canGoToStep4) {
      alert('Veuillez sélectionner au moins une société à rencontrer');
      return;
    }
    setWizardStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rgpdAccepted) {
      alert('Veuillez cocher la case d\'acceptation RGPD pour valider votre inscription.');
      return;
    }

    submitRegistration({
      identity,
      availability,
      selectedCompanies: selectedCompanyIds,
      companyPreferences
    });
  };

  const steps = [
    { num: 1, label: 'Identité' },
    { num: 2, label: 'Disponibilités' },
    { num: 3, label: 'Choix Sociétés' },
    { num: 4, label: 'Préférences' },
    { num: 5, label: 'Validation' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Wizard Header */}
        <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-200 flex items-center gap-2">
              <span>EuroLand Corporate</span>
              <span>•</span>
              <span>4 Novembre 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
              Assistant d'inscription guidé — Journée Small & Mid Caps
            </h2>
          </div>
          <button
            onClick={() => setWizardOpen(false)}
            className="p-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, idx) => {
              const isActive = wizardStep === s.num;
              const isDone = wizardStep > s.num;

              return (
                <React.Fragment key={s.num}>
                  <div
                    onClick={() => {
                      if (isDone) setWizardStep(s.num);
                    }}
                    className={`flex items-center space-x-2 cursor-pointer ${
                      isActive ? 'text-blue-900 font-bold' : isDone ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-md ring-4 ring-blue-100'
                          : isDone
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="w-5 h-5" /> : s.num}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold">{s.label}</span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        wizardStep > s.num ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Wizard Body Scrollable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: IDENTITÉ */}
          {wizardStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-blue-950 text-sm">
                <HelpCircle className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Bienvenue dans votre espace d'inscription.</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    L'équipe EuroLand Corporate prépare pour vous une journée sur-mesure. Merci de renseigner vos coordonnées.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Civilité *
                  </label>
                  <select
                    value={identity.civility}
                    onChange={(e) => setIdentity({ ...identity, civility: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Monsieur">Monsieur</option>
                    <option value="Madame">Madame</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.firstName}
                    onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })}
                    placeholder="Jean"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.lastName}
                    onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })}
                    placeholder="Dupont"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={identity.email}
                    onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                    placeholder="j.dupont@societe.com"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={identity.phone}
                    onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Société / Organisme *
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.company}
                    onChange={(e) => setIdentity({ ...identity, company: e.target.value })}
                    placeholder="ABC Asset Management"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fonction *
                  </label>
                  <input
                    type="text"
                    required
                    value={identity.jobTitle}
                    onChange={(e) => setIdentity({ ...identity, jobTitle: e.target.value })}
                    placeholder="Gérant Actions"
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type d'investisseur
                  </label>
                  <select
                    value={identity.investorType}
                    onChange={(e) => setIdentity({ ...identity, investorType: e.target.value })}
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Société de gestion">Société de gestion</option>
                    <option value="Family Office">Family Office</option>
                    <option value="Banque privée">Banque privée</option>
                    <option value="Analyste">Analyste</option>
                    <option value="Investisseur institutionnel">Investisseur institutionnel</option>
                    <option value="Investisseur individuel">Investisseur individuel</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DISPONIBILITÉS (ULTRA-SIMPLIFIED 1-CLICK PRESETS) */}
          {wizardStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Étape 2 — Sélectionnez votre formule de disponibilité
                </h3>
                <p className="text-sm text-slate-600">
                  Cliquez simplement sur l'une des 3 formules ci-dessous. Notre équipe adapte ensuite vos rendez-vous.
                </p>
              </div>

              {/* 3 Large 1-Click Preset Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Preset 1: Toute la journée */}
                <div
                  onClick={() => applyPreset('fullDay')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                    availabilityPreset === 'fullDay'
                      ? 'bg-blue-900 text-white border-blue-900 shadow-lg ring-4 ring-blue-100'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${
                        availabilityPreset === 'fullDay' ? 'bg-blue-800 text-white' : 'bg-blue-50 text-blue-900'
                      }`}>
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      {availabilityPreset === 'fullDay' && (
                        <span className="w-7 h-7 bg-white text-blue-900 rounded-full flex items-center justify-center font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                        availabilityPreset === 'fullDay' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-900'
                      }`}>
                        Recommandé
                      </span>
                      <h4 className="text-lg font-bold font-display mt-2">Toute la journée</h4>
                      <p className={`text-xs mt-1 ${availabilityPreset === 'fullDay' ? 'text-blue-100' : 'text-slate-500'}`}>
                        De 09h00 à 18h00. Permet de maximiser vos rencontres.
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t text-xs font-bold ${
                    availabilityPreset === 'fullDay' ? 'border-blue-800 text-blue-200' : 'border-slate-100 text-blue-900'
                  }`}>
                    1-clic • 8 créneaux couverts
                  </div>
                </div>

                {/* Preset 2: Matinée uniquement */}
                <div
                  onClick={() => applyPreset('morning')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                    availabilityPreset === 'morning'
                      ? 'bg-blue-900 text-white border-blue-900 shadow-lg ring-4 ring-blue-100'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${
                        availabilityPreset === 'morning' ? 'bg-blue-800 text-white' : 'bg-blue-50 text-blue-900'
                      }`}>
                        <Sun className="w-6 h-6" />
                      </div>
                      {availabilityPreset === 'morning' && (
                        <span className="w-7 h-7 bg-white text-blue-900 rounded-full flex items-center justify-center font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold font-display">Matinée uniquement</h4>
                      <p className={`text-xs mt-1 ${availabilityPreset === 'morning' ? 'text-blue-100' : 'text-slate-500'}`}>
                        De 09h00 à 13h00 (idéal si vous travaillez l'après-midi).
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t text-xs font-bold ${
                    availabilityPreset === 'morning' ? 'border-blue-800 text-blue-200' : 'border-slate-100 text-blue-900'
                  }`}>
                    1-clic • 09h00 – 13h00
                  </div>
                </div>

                {/* Preset 3: Après-midi uniquement */}
                <div
                  onClick={() => applyPreset('afternoon')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                    availabilityPreset === 'afternoon'
                      ? 'bg-blue-900 text-white border-blue-900 shadow-lg ring-4 ring-blue-100'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${
                        availabilityPreset === 'afternoon' ? 'bg-blue-800 text-white' : 'bg-blue-50 text-blue-900'
                      }`}>
                        <Sunset className="w-6 h-6" />
                      </div>
                      {availabilityPreset === 'afternoon' && (
                        <span className="w-7 h-7 bg-white text-blue-900 rounded-full flex items-center justify-center font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold font-display">Après-midi uniquement</h4>
                      <p className={`text-xs mt-1 ${availabilityPreset === 'afternoon' ? 'text-blue-100' : 'text-slate-500'}`}>
                        De 14h00 à 18h00 (après le déjeuner).
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t text-xs font-bold ${
                    availabilityPreset === 'afternoon' ? 'border-blue-800 text-blue-200' : 'border-slate-100 text-blue-900'
                  }`}>
                    1-clic • 14h00 – 18h00
                  </div>
                </div>

              </div>

              {/* Optional Custom Slots Accordion */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomSlots(!showCustomSlots)}
                  className="text-xs font-bold text-blue-900 hover:underline flex items-center space-x-1.5"
                >
                  <Settings className="w-4 h-4" />
                  <span>{showCustomSlots ? 'Masquer la sélection d\'heures spécifiques' : '⚙️ Choisir des heures spécifiques (option avancé)'}</span>
                </button>

                {showCustomSlots && (
                  <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Cochez les heures exactes disponibles :</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {TIME_SLOTS.map((slot) => {
                        const isChecked = availability.fullDay || availability.slots.includes(slot);

                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => handleSlotToggle(slot)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-blue-900 text-white border-blue-900'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            <span>{slot}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Free Text Constraints */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Une précision sur votre emploi du temps ? (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={availability.notes}
                  onChange={(e) => setAvailability({ ...availability, notes: e.target.value })}
                  placeholder="Ex : Je dois impérativement partir à 16h00..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Constraint Warning Box if Sword is selected */}
              {constraintWarnings.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                    <span>Information de créneau Sword</span>
                  </div>
                  {constraintWarnings.map((w, idx) => (
                    <p key={idx} className="text-xs text-amber-900 leading-relaxed font-medium">
                      • {w.text}
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyPreset('fullDay')}
                    className="mt-1 text-xs font-bold text-amber-950 underline hover:text-black"
                  >
                    Cliquer ici pour choisir "Toute la journée" et lever l'incompatibilité
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHOIX DES SOCIÉTÉS (Strictly Alphabetical A-Z) */}
          {wizardStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Étape 3 — Cochez les sociétés à rencontrer (A à Z)</h3>
                  <p className="text-sm text-slate-600">Cochez simplement les entreprises. Vous pourrez ensuite valider votre sélection.</p>
                </div>

                {/* Counter */}
                <div className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-extrabold shadow-sm shrink-0 flex items-center space-x-2">
                  <span>{selectedCompanyIds.length} sélectionnée(s)</span>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Rechercher par nom de société..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Grid of 36 Companies (Alphabetical order) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {activeCompanies
                  .filter((c) => c.name.toLowerCase().includes(companySearch.toLowerCase()))
                  .map((company) => {
                    const isSelected = selectedCompanyIds.includes(company.id);

                    return (
                      <div
                        key={company.id}
                        onClick={() => toggleSelectCompany(company.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-sm ring-1 ring-blue-600/30'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <CompanyLogo company={company} isSelected={isSelected} size="sm" />
                          <div className="truncate">
                            <h4 className="text-sm font-bold truncate text-slate-900">{company.name}</h4>
                            {company.ticker && (
                              <span className="text-[10px] text-slate-500 font-mono block">{company.ticker}</span>
                            )}
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-blue-900 border-blue-900 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 4: PRÉFÉRENCES PAR SOCIÉTÉ (SIMPLIFIED & ASSISTED) */}
          {wizardStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Assisted Assistance Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-4 text-emerald-950">
                <Sparkles className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-emerald-900 text-base font-display">
                    💡 Démarche simplifiée — Assistance EuroLand Corporate
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Pour vous faire gagner du temps, nous avons pré-configuré vos rendez-vous au format optimal (<strong>One-to-One</strong>, priorité <strong>Souhaitée</strong>). 
                    Vous pouvez cliquer directement sur <strong>Continuer</strong> sans rien changer !
                  </p>
                </div>
              </div>

              {/* List of selected companies with simple summary pills */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
                  Sociétés sélectionnées ({selectedCompaniesList.length}) :
                </h4>

                {selectedCompaniesList.map((company) => {
                  const prefs = companyPreferences[company.id] || {
                    format: 'One-to-One',
                    isShareholder: 'Non',
                    knowledgeLevel: 3,
                    priority: 'Souhaitée'
                  };

                  const isExpanded = expandedPrefId === company.id;

                  const updatePref = (field, val) => {
                    setCompanyPreferences((prev) => ({
                      ...prev,
                      [company.id]: {
                        ...prefs,
                        [field]: val
                      }
                    }));
                  };

                  return (
                    <div
                      key={company.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 transition-all"
                    >
                      {/* Company Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base font-display">{company.name}</h4>
                            <span className="text-xs text-slate-500 font-medium">{company.sector}</span>
                          </div>
                        </div>

                        {/* Quick summary chips + toggle edit button */}
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-900 font-bold text-xs rounded-lg">
                            {prefs.format}
                          </span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-lg">
                            Priorité : {prefs.priority}
                          </span>

                          <button
                            type="button"
                            onClick={() => setExpandedPrefId(isExpanded ? null : company.id)}
                            className="px-3 py-1 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                          >
                            <span>{isExpanded ? 'Masquer' : 'Personnaliser'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Advanced Settings */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in bg-slate-50 p-4 rounded-xl">
                          {/* Format */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Format de rendez-vous</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['One-to-One', 'One-to-Few', 'Indifférent'].map((fmt) => (
                                <button
                                  type="button"
                                  key={fmt}
                                  onClick={() => updatePref('format', fmt)}
                                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                                    prefs.format === fmt
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {fmt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Priorité */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Priorité de rencontre</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Prioritaire', 'Souhaitée', 'Optionnelle'].map((p) => (
                                <button
                                  type="button"
                                  key={p}
                                  onClick={() => updatePref('priority', p)}
                                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                                    prefs.priority === p
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Actionnaire */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Déjà actionnaire ?</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['Oui', 'Non'].map((val) => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => updatePref('isShareholder', val)}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                    prefs.isShareholder === val
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Connaissance */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                              Connaissance de l'entreprise ({prefs.knowledgeLevel}/5)
                            </label>
                            <div className="flex space-x-1.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  type="button"
                                  key={lvl}
                                  onClick={() => updatePref('knowledgeLevel', lvl)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                                    prefs.knowledgeLevel === lvl
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: RÉCAPITULATIF & RGPD */}
          {wizardStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Étape 5 — Récapitulatif & Validation finale</h3>
                <p className="text-sm text-slate-600">Dernière vérification avant enregistrement officiel de votre demande.</p>
              </div>

              {/* Summary Cards */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
                
                {/* Participant Identity */}
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Participant</h4>
                  <div className="mt-1 text-lg font-extrabold text-slate-900">
                    {identity.civility} {identity.firstName} {identity.lastName}
                  </div>
                  <div className="text-sm font-bold text-blue-900 mt-0.5">
                    {identity.jobTitle} — {identity.company} ({identity.investorType})
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Email : {identity.email} | Téléphone : {identity.phone}
                  </div>
                </div>

                {/* Availabilities Summary */}
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Formule de disponibilité sélectionnée</h4>
                  <div className="mt-1 text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs font-extrabold">
                      {availabilityPreset === 'fullDay'
                        ? 'Toute la journée (09h00 – 18h00)'
                        : availabilityPreset === 'morning'
                        ? 'Matinée uniquement (09h00 – 13h00)'
                        : availabilityPreset === 'afternoon'
                        ? 'Après-midi uniquement (14h00 – 18h00)'
                        : 'Créneaux personnalisés'}
                    </span>
                  </div>
                  {availability.notes && (
                    <p className="text-xs text-slate-600 mt-2 italic">
                      Remarque : "{availability.notes}"
                    </p>
                  )}
                </div>

                {/* Selected Companies List */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                    Sociétés demandées ({selectedCompaniesList.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedCompaniesList.map((comp) => {
                      const pref = companyPreferences[comp.id] || {};

                      return (
                        <div
                          key={comp.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm">{comp.name}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600">{comp.sector}</span>
                          </div>

                          <div className="flex items-center space-x-2 font-semibold">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-md font-bold">
                              {pref.format || 'One-to-One'}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-800 text-white rounded-md font-bold">
                              {pref.priority || 'Souhaitée'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RGPD Consent Checkbox */}
              <div className="p-4 bg-white border-2 border-slate-300 rounded-2xl flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="rgpd"
                  required
                  checked={rgpdAccepted}
                  onChange={(e) => setRgpdAccepted(e.target.checked)}
                  className="w-6 h-6 text-blue-900 rounded border-slate-300 focus:ring-blue-600 mt-0.5 cursor-pointer"
                />
                <label htmlFor="rgpd" className="text-xs text-slate-800 leading-relaxed cursor-pointer font-medium">
                  <strong>J'accepte</strong> que les informations renseignées soient utilisées par EuroLand Corporate dans le cadre de l'organisation de la Journée Small & Mid Caps et de la gestion de mes rendez-vous. <a href="#privacy" className="text-blue-900 underline font-bold">Politique de confidentialité</a>.
                </label>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Navigation */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {wizardStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-sm font-bold transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div></div>
          )}

          {wizardStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-extrabold transition-all shadow-md flex items-center space-x-2"
            >
              <span>Étape Suivante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!rgpdAccepted}
              className={`px-8 py-3.5 rounded-xl text-sm font-extrabold transition-all shadow-lg flex items-center space-x-2 ${
                rgpdAccepted
                  ? 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer'
                  : 'bg-slate-400 text-slate-100 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>CONFIRMER MON INSCRIPTION</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
