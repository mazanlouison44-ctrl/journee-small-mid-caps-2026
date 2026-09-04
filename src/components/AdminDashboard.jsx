import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TIME_SLOTS } from '../data/companies';
import {
  Shield, Building2, Users, Calendar, Download, Plus, Edit, Eye, EyeOff,
  CheckCircle, Clock, Sparkles, RefreshCw, Trash2, FileSpreadsheet, X, Search, Sliders
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    adminMode,
    setAdminMode,
    companies,
    toggleCompanyActive,
    updateCompany,
    addCompany,
    program,
    updateProgramItem,
    eventInfo,
    updateEventInfo,
    registrations,
    resetDataToDefault
  } = useApp();

  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'companies' | 'event' | 'agenda'
  const [editingCompany, setEditingCompany] = useState(null);
  const [newCompanyModal, setNewCompanyModal] = useState(false);
  const [newCompData, setNewCompData] = useState({
    name: '',
    ticker: '',
    sector: 'Tech & Services IT',
    description: '',
    availabilityConstraintText: ''
  });

  const [searchReg, setSearchReg] = useState('');

  // Agenda Generation State (Section 22)
  const [generatedAgenda, setGeneratedAgenda] = useState(null);
  const [generating, setGenerating] = useState(false);

  if (!adminMode) return null;

  // Filter registrations
  const filteredRegistrations = registrations.filter(
    (r) =>
      r.identity.lastName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.identity.firstName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.identity.company.toLowerCase().includes(searchReg.toLowerCase())
  );

  // CSV Export for Participants
  const exportParticipantsCSV = () => {
    const headers = [
      'ID', 'Date Inscription', 'Civilité', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Société', 'Fonction', 'Type Investisseur', 'Disponibilités', 'Remarques', 'Nombre Sociétés Demandées'
    ];

    const rows = registrations.map((r) => [
      r.id,
      r.createdAt,
      r.identity.civility,
      r.identity.firstName,
      r.identity.lastName,
      r.identity.email,
      r.identity.phone,
      r.identity.company,
      r.identity.jobTitle,
      r.identity.investorType,
      r.availability.fullDay ? 'Toute la journée' : r.availability.slots.join('; '),
      `"${r.availability.notes || ''}"`,
      r.selectedCompanies.length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMC2026_Participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Demandes de RDV
  const exportDemandesCSV = () => {
    const headers = ['Participant', 'Email', 'Société Participant', 'Société Demandée', 'Format', 'Actionnaire', 'Connaissance', 'Priorité', 'Disponibilités Participant'];
    
    const companyMap = new Map(companies.map(c => [c.id, c.name]));
    const rows = [];

    registrations.forEach((r) => {
      const pName = `${r.identity.firstName} ${r.identity.lastName}`;
      const avail = r.availability.fullDay ? 'Toute la journée (9h-18h)' : r.availability.slots.join(' / ');

      r.selectedCompanies.forEach((cid) => {
        const compName = companyMap.get(cid) || cid;
        const pref = r.companyPreferences[cid] || {};
        rows.push([
          `"${pName}"`,
          r.identity.email,
          `"${r.identity.company}"`,
          `"${compName}"`,
          pref.format || 'One-to-One',
          pref.isShareholder || 'Non',
          pref.knowledgeLevel || 3,
          pref.priority || 'Souhaitée',
          `"${avail}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JSMC2026_Demandes_RDV_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Agenda Generation Algorithm (Évolution 22)
  const runAgendaGeneration = () => {
    setGenerating(true);
    setTimeout(() => {
      const companyMap = new Map(companies.map(c => [c.id, c]));
      const investorAgendas = {};
      const companyAgendas = {};

      // Initialize slot tables for active companies
      companies.filter(c => c.active).forEach(c => {
        companyAgendas[c.id] = {
          company: c,
          slots: {}
        };
      });

      // Simple greedy matching algorithm prioritizing 'Prioritaire' then 'Souhaitée'
      registrations.forEach(reg => {
        const pName = `${reg.identity.firstName} ${reg.identity.lastName} (${reg.identity.company})`;
        investorAgendas[reg.id] = {
          participant: pName,
          schedule: {}
        };

        const userSlots = reg.availability.fullDay ? TIME_SLOTS : reg.availability.slots;

        // Sort requests by priority
        const sortedRequests = [...reg.selectedCompanies].sort((a, b) => {
          const prefA = reg.companyPreferences[a]?.priority === 'Prioritaire' ? 2 : 1;
          const prefB = reg.companyPreferences[b]?.priority === 'Prioritaire' ? 2 : 1;
          return prefB - prefA;
        });

        sortedRequests.forEach(cid => {
          const comp = companyMap.get(cid);
          if (!comp || !comp.active) return;

          // Allowed slots for company
          const allowedSlots = comp.availabilityConstraint?.allowedSlots || TIME_SLOTS;

          // Find first available slot where both investor and company are free
          const matchingSlot = userSlots.find(slot => {
            const isCompanyAllowed = allowedSlots.includes(slot);
            const isCompanyFree = !companyAgendas[cid].slots[slot];
            const isInvestorFree = !investorAgendas[reg.id].schedule[slot];
            return isCompanyAllowed && isCompanyFree && isInvestorFree;
          });

          if (matchingSlot) {
            investorAgendas[reg.id].schedule[matchingSlot] = comp.name;
            companyAgendas[cid].slots[matchingSlot] = pName;
          }
        });
      });

      setGeneratedAgenda({ investorAgendas, companyAgendas });
      setGenerating(false);
    }, 600);
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-900 text-white rounded-xl shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-display text-white">Espace Administration EuroLand Corporate</h2>
                <span className="px-2.5 py-0.5 bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs rounded-full font-bold">
                  JSMC 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestion en temps réel des paramétrages, des 36 sociétés, des inscriptions et de la génération des agendas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={resetDataToDefault}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Réinitialiser les données par défaut"
            >
              Réinitialiser Démo
            </button>

            <button
              onClick={() => setAdminMode(false)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Fermer le mode Admin
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'registrations', label: `Inscriptions & Demandes (${registrations.length})`, icon: Users },
            { id: 'companies', label: `Gestion des Sociétés (${companies.length})`, icon: Building2 },
            { id: 'event', label: 'Infos & Programme', icon: Calendar },
            { id: 'agenda', label: 'Générateur d\'Agendas (Évolution 22)', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchReg}
                  onChange={(e) => setSearchReg(e.target.value)}
                  placeholder="Filtrer par nom, société..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={exportParticipantsCSV}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter PARTICIPANTS (CSV)</span>
                </button>

                <button
                  onClick={exportDemandesCSV}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter DEMANDES DE RDV (CSV)</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">ID / Date</th>
                    <th className="p-3.5">Participant</th>
                    <th className="p-3.5">Société / Fonction</th>
                    <th className="p-3.5">Disponibilités</th>
                    <th className="p-3.5">Sociétés Demandées</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{reg.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(reg.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-white block">
                          {reg.identity.civility} {reg.identity.firstName} {reg.identity.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400">{reg.identity.email}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-blue-300 block">{reg.identity.company}</span>
                        <span className="text-[11px] text-slate-400">{reg.identity.jobTitle} ({reg.identity.investorType})</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded font-semibold text-[11px]">
                          {reg.availability.fullDay ? 'Toute la journée' : `${reg.availability.slots.length} créneau(x)`}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-blue-900/60 text-blue-200 rounded-full font-bold text-[11px] inline-block">
                          {reg.selectedCompanies.length} sociétés
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => alert(`Détail des choix de ${reg.identity.firstName} ${reg.identity.lastName} :\n` + reg.selectedCompanies.map(c => `- ${c}`).join('\n'))}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded border border-slate-700"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: COMPANIES MANAGEMENT */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Activez ou désactivez une société, ou modifiez ses contraintes spécifiques de disponibilité (ex: Sword).
              </p>
              <button
                onClick={() => setNewCompanyModal(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Société</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((comp) => {
                const isActive = comp.active !== false;

                return (
                  <div
                    key={comp.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isActive ? 'bg-slate-850 border-slate-700' : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base font-display">{comp.name}</h4>
                          {comp.ticker && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {comp.ticker}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-blue-400">{comp.sector}</span>
                      </div>

                      {/* Active/Inactive Toggle Button */}
                      <button
                        onClick={() => toggleCompanyActive(comp.id)}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{comp.description}</p>

                    {/* Constraint editor */}
                    <div className="pt-2 border-t border-slate-800">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Contrainte de disponibilité particulière
                      </label>
                      <input
                        type="text"
                        value={comp.availabilityConstraint?.text || ''}
                        onChange={(e) => {
                          const textVal = e.target.value;
                          updateCompany(comp.id, {
                            availabilityConstraint: textVal
                              ? { text: textVal, allowedSlots: comp.availabilityConstraint?.allowedSlots || ['10h00 - 11h00', '11h00 - 12h00', '15h00 - 16h00'] }
                              : null
                          });
                        }}
                        placeholder="Ex : Disponibilités Sword : 10h00–12h00 et 15h00–16h00"
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: EVENT & PROGRAM */}
        {activeTab === 'event' && (
          <div className="space-y-6">
            
            {/* Event Settings Form */}
            <div className="bg-slate-850 p-6 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-white font-display">Paramètres Généraux de l'Événement</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Titre de l'événement</label>
                  <input
                    type="text"
                    value={eventInfo.title}
                    onChange={(e) => updateEventInfo({ title: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date affichée</label>
                  <input
                    type="text"
                    value={eventInfo.dateFormatted}
                    onChange={(e) => updateEventInfo({ dateFormatted: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lieu & Salle</label>
                  <input
                    type="text"
                    value={eventInfo.locationName}
                    onChange={(e) => updateEventInfo({ locationName: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Adresse</label>
                  <input
                    type="text"
                    value={eventInfo.address}
                    onChange={(e) => updateEventInfo({ address: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Program Items Form */}
            <div className="bg-slate-850 p-6 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-white font-display">Édition des Horaires du Programme</h3>

              <div className="space-y-3">
                {program.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateProgramItem(item.id, { time: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-700 rounded text-xs text-blue-300 font-bold"
                    />

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateProgramItem(item.id, { title: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white font-semibold"
                    />

                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateProgramItem(item.id, { description: e.target.value })}
                      className="p-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 sm:col-span-2"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: AUTOMATED AGENDA GENERATOR (ÉVOLUTION 22) */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl border border-blue-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 text-white rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Générateur Automatique d'Agendas (Matching Engine)</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Croise automatiquement les créneaux investisseurs, les priorités des demandes et les contraintes spécifiques des sociétés (ex: Sword 10-12h et 15-16h).
                  </p>
                </div>
              </div>

              <button
                onClick={runAgendaGeneration}
                disabled={generating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Calcul des emplois du temps...' : 'GÉNÉRER LE PLANNING OPTIMAL'}</span>
              </button>
            </div>

            {/* Generated Agendas Output */}
            {generatedAgenda && (
              <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
                
                {/* Investor Agendas */}
                <div className="bg-slate-850 p-6 rounded-xl border border-slate-700 space-y-4">
                  <h4 className="font-bold text-white text-sm font-display uppercase tracking-wider text-blue-300">
                    Plannings par Investisseur
                  </h4>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {Object.entries(generatedAgenda.investorAgendas).map(([regId, data]) => (
                      <div key={regId} className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
                        <div className="font-bold text-white text-xs">{data.participant}</div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {TIME_SLOTS.map(slot => (
                            <div key={slot} className={`p-1.5 rounded border ${
                              data.schedule[slot] ? 'bg-blue-900/60 border-blue-600 text-white font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                            }`}>
                              <span>{slot} : </span>
                              <span className="text-blue-200">{data.schedule[slot] || 'Libre'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Agendas */}
                <div className="bg-slate-850 p-6 rounded-xl border border-slate-700 space-y-4">
                  <h4 className="font-bold text-white text-sm font-display uppercase tracking-wider text-emerald-300">
                    Plannings par Société Cotée
                  </h4>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {Object.values(generatedAgenda.companyAgendas).map(({ company, slots }) => (
                      <div key={company.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs font-display">{company.name}</span>
                          {company.availabilityConstraint && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 rounded">
                              {company.availabilityConstraint.text}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {TIME_SLOTS.map(slot => (
                            <div key={slot} className={`p-1.5 rounded border ${
                              slots[slot] ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                            }`}>
                              <span>{slot} : </span>
                              <span>{slots[slot] || 'Disponible'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
