import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { TIME_SLOTS } from '../data/companies';
import {
  Shield, Building2, Users, Calendar, Download, Plus, Edit, Eye, EyeOff,
  CheckCircle, Clock, Sparkles, RefreshCw, Trash2, FileSpreadsheet, X, Search, Sliders, Link, Copy, CheckSquare, Square, AlertTriangle, Users2, UserCheck
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
    deleteRegistration,
    deleteMultipleRegistrations,
    resetDataToDefault
  } = useApp();

  const [activeTab, setActiveTab] = useState('registrations');
  const [editingCompany, setEditingCompany] = useState(null);
  const [newCompanyModal, setNewCompanyModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const [searchReg, setSearchReg] = useState('');
  const [selectedRegIds, setSelectedRegIds] = useState([]);

  // Deletion Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState([]);
  const [deleteTargetLabel, setDeleteTargetLabel] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [generatedAgenda, setGeneratedAgenda] = useState(null);
  const [generating, setGenerating] = useState(false);

  if (!adminMode) return null;

  const filteredRegistrations = registrations.filter(
    (r) =>
      r.identity.lastName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.identity.firstName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.identity.company.toLowerCase().includes(searchReg.toLowerCase())
  );

  // Checkbox helpers
  const toggleSelectReg = (id) => {
    setSelectedRegIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRegIds.length === filteredRegistrations.length) {
      setSelectedRegIds([]);
    } else {
      setSelectedRegIds(filteredRegistrations.map((r) => r.id));
    }
  };

  // Open Delete Confirmation Modal for Single Registration
  const triggerDeleteSingle = (reg) => {
    setDeleteTargets([reg.id]);
    setDeleteTargetLabel(`la demande de ${reg.identity.civility} ${reg.identity.firstName} ${reg.identity.lastName} (${reg.identity.company})`);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  // Open Delete Confirmation Modal for Selected Registrations
  const triggerDeleteSelected = () => {
    if (selectedRegIds.length === 0) return;
    setDeleteTargets(selectedRegIds);
    setDeleteTargetLabel(`les ${selectedRegIds.length} demandes sélectionnées`);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  // Execute Confirmed Deletion
  const handleConfirmDelete = () => {
    if (deleteConfirmText.trim() !== 'Supprimer') {
      alert('Veuillez écrire "Supprimer" pour confirmer la suppression.');
      return;
    }

    if (deleteTargets.length === 1) {
      deleteRegistration(deleteTargets[0]);
    } else if (deleteTargets.length > 1) {
      deleteMultipleRegistrations(deleteTargets);
      setSelectedRegIds([]);
    }

    setDeleteModalOpen(false);
    setDeleteConfirmText('');
    setDeleteTargets([]);
  };

  // Excel Native Export for Participants (.xlsx)
  const exportParticipantsXLSX = (onlySelected = false) => {
    const listToExport = onlySelected
      ? registrations.filter((r) => selectedRegIds.includes(r.id))
      : registrations;

    if (listToExport.length === 0) {
      alert('Veuillez sélectionner au moins un dossier à exporter.');
      return;
    }

    const companyMap = new Map(companies.map(c => [c.id, c.name]));

    const data = listToExport.map((r) => {
      const companyNames = r.selectedCompanies.map(cid => companyMap.get(cid) || cid).join(', ');
      return {
        'ID Inscription': r.id,
        'Date Inscription': new Date(r.createdAt).toLocaleString('fr-FR'),
        'Civilité': r.identity.civility || '',
        'Prénom': r.identity.firstName || '',
        'Nom': r.identity.lastName || '',
        'Email Professionnel': r.identity.email || '',
        'Téléphone': r.identity.phone || '',
        'Société / Organisme': r.identity.company || '',
        'Fonction': r.identity.jobTitle || '',
        'Type Investisseur': r.identity.investorType || '',
        'Disponibilités': r.availability.fullDay ? 'Toute la journée (9h-18h)' : r.availability.slots.join('; '),
        'Remarques & Commentaires': r.availability.notes || 'Aucune remarque',
        'Nb Sociétés Demandées': r.selectedCompanies.length,
        'Liste des Sociétés Demandées': companyNames
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto column widths with wider spacing for notes and company list
    worksheet['!cols'] = [
      { wch: 18 }, // ID Inscription
      { wch: 20 }, // Date Inscription
      { wch: 10 }, // Civilité
      { wch: 15 }, // Prénom
      { wch: 15 }, // Nom
      { wch: 28 }, // Email
      { wch: 18 }, // Téléphone
      { wch: 25 }, // Société
      { wch: 22 }, // Fonction
      { wch: 24 }, // Type Investisseur
      { wch: 30 }, // Disponibilités
      { wch: 50 }, // Remarques & Commentaires (WIDE & VISIBLE!)
      { wch: 22 }, // Nb Sociétés Demandées
      { wch: 50 }  // Liste des Sociétés
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    XLSX.writeFile(
      workbook,
      `JSMC2026_PARTICIPANTS_${onlySelected ? 'Selection' : 'Tous'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Excel Native Export for Demandes de RDV (.xlsx)
  const exportDemandesXLSX = (onlySelected = false) => {
    const listToExport = onlySelected
      ? registrations.filter((r) => selectedRegIds.includes(r.id))
      : registrations;

    if (listToExport.length === 0) {
      alert('Veuillez sélectionner au moins un dossier à exporter.');
      return;
    }

    const companyMap = new Map(companies.map(c => [c.id, c.name]));
    const rows = [];

    listToExport.forEach((r) => {
      const pName = `${r.identity.firstName} ${r.identity.lastName}`;
      const avail = r.availability.fullDay ? 'Toute la journée (9h-18h)' : r.availability.slots.join(' / ');
      const notes = r.availability.notes || 'Aucune remarque';

      r.selectedCompanies.forEach((cid) => {
        const compName = companyMap.get(cid) || cid;
        const pref = r.companyPreferences[cid] || {};
        rows.push({
          'ID Participant': r.id,
          'Nom Participant': pName,
          'Email': r.identity.email,
          'Téléphone': r.identity.phone,
          'Société Participant': r.identity.company || '',
          'Fonction Participant': r.identity.jobTitle || '',
          'Société Cotée Demandée': compName,
          'Format RDV Souhaité': pref.format || 'One-to-One',
          'Actionnaire': pref.isShareholder || 'Non',
          'Connaissance Entreprise (1 à 5)': pref.knowledgeLevel || 3,
          'Niveau de Priorité': pref.priority || 'Souhaitée',
          'Disponibilités Participant': avail,
          'Remarques & Commentaires Participant': notes
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 18 }, // ID Participant
      { wch: 22 }, // Nom Participant
      { wch: 28 }, // Email
      { wch: 18 }, // Téléphone
      { wch: 25 }, // Société Participant
      { wch: 22 }, // Fonction Participant
      { wch: 25 }, // Société Cotée Demandée
      { wch: 18 }, // Format RDV Souhaité
      { wch: 14 }, // Actionnaire
      { wch: 28 }, // Connaissance Entreprise
      { wch: 18 }, // Niveau de Priorité
      { wch: 30 }, // Disponibilités Participant
      { wch: 50 }  // Remarques & Commentaires Participant (WIDE & VISIBLE!)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes RDV');

    XLSX.writeFile(
      workbook,
      `JSMC2026_DEMANDES_RDV_${onlySelected ? 'Selection' : 'Toutes'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Export Selected Folders into detailed text summary files
  const exportSelectedDetailsText = () => {
    const listToExport = registrations.filter((r) => selectedRegIds.includes(r.id));
    if (listToExport.length === 0) {
      alert('Veuillez sélectionner au moins un dossier.');
      return;
    }

    const companyMap = new Map(companies.map(c => [c.id, c.name]));

    let fullText = `=== EUROLAND CORPORATE — SÉLECTION DE DOSSIERS INSCRIPTION JSMC 2026 ===\n\n`;
    listToExport.forEach((r, idx) => {
      fullText += `--------------------------------------------------\n`;
      fullText += `DOSSIER N° ${idx + 1} — ${r.id} (${r.identity.firstName} ${r.identity.lastName})\n`;
      fullText += `--------------------------------------------------\n`;
      fullText += `Participant : ${r.identity.civility} ${r.identity.firstName} ${r.identity.lastName}\n`;
      fullText += `Société : ${r.identity.company} (${r.identity.investorType})\n`;
      fullText += `Fonction : ${r.identity.jobTitle}\n`;
      fullText += `Email : ${r.identity.email} | Tél : ${r.identity.phone}\n`;
      fullText += `Disponibilités : ${r.availability.fullDay ? 'Toute la journée (9h-18h)' : r.availability.slots.join(' / ')}\n`;
      fullText += `Remarques & Contraintes : ${r.availability.notes || 'Aucune'}\n`;
      fullText += `\nSociétés demandées (${r.selectedCompanies.length}) :\n`;

      r.selectedCompanies.forEach(cid => {
        const pref = r.companyPreferences[cid] || {};
        const cName = companyMap.get(cid) || cid;
        fullText += `  - ${cName} : Format ${pref.format || 'One-to-One'} | Priorité ${pref.priority || 'Souhaitée'} | Connaissance ${pref.knowledgeLevel || 3}/5\n`;
      });
      fullText += `\n\n`;
    });

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Synthese_Dossiers_Selectionnes_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Agenda Generation Algorithm with Strict One-to-One Solo vs One-to-Few Group Logic
  const runAgendaGeneration = () => {
    setGenerating(true);
    setTimeout(() => {
      const companyMap = new Map(companies.map(c => [c.id, c]));
      const investorAgendas = {};
      const companyAgendas = {};

      companies.filter(c => c.active).forEach(c => {
        companyAgendas[c.id] = {
          company: c,
          slots: {}
        };
        TIME_SLOTS.forEach(slot => {
          companyAgendas[c.id].slots[slot] = {
            mode: 'free',
            participants: []
          };
        });
      });

      registrations.forEach(reg => {
        const pName = `${reg.identity.firstName} ${reg.identity.lastName} (${reg.identity.company})`;
        investorAgendas[reg.id] = {
          participant: pName,
          schedule: {}
        };

        const userSlots = reg.availability.fullDay ? TIME_SLOTS : reg.availability.slots;

        const sortedRequests = [...reg.selectedCompanies].sort((a, b) => {
          const prefA = reg.companyPreferences[a]?.priority === 'Prioritaire' ? 2 : 1;
          const prefB = reg.companyPreferences[b]?.priority === 'Prioritaire' ? 2 : 1;
          return prefB - prefA;
        });

        sortedRequests.forEach(cid => {
          const comp = companyMap.get(cid);
          if (!comp || !comp.active) return;

          const pref = reg.companyPreferences[cid] || {};
          const reqFormat = pref.format || 'One-to-One';
          const allowedSlots = comp.availabilityConstraint?.allowedSlots || TIME_SLOTS;

          const matchingSlot = userSlots.find(slot => {
            const isCompanyAllowed = allowedSlots.includes(slot);
            const isInvestorFree = !investorAgendas[reg.id].schedule[slot];
            if (!isCompanyAllowed || !isInvestorFree) return false;

            const companySlotState = companyAgendas[cid].slots[slot];

            if (companySlotState.mode === 'free') {
              return true;
            }

            if (companySlotState.mode === 'One-to-One') {
              return false;
            }

            if (companySlotState.mode === 'One-to-Few') {
              return reqFormat === 'One-to-Few' || reqFormat === 'Indifférent';
            }

            return false;
          });

          if (matchingSlot) {
            const slotObj = companyAgendas[cid].slots[matchingSlot];
            
            if (slotObj.mode === 'free') {
              slotObj.mode = reqFormat === 'One-to-Few' ? 'One-to-Few' : 'One-to-One';
            }

            slotObj.participants.push(pName);
            investorAgendas[reg.id].schedule[matchingSlot] = {
              companyName: comp.name,
              format: slotObj.mode
            };
          }
        });
      });

      setGeneratedAgenda({ investorAgendas, companyAgendas });
      setGenerating(false);
    }, 600);
  };

  const googleAppsScriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pSheet = ss.getSheetByName("PARTICIPANTS") || ss.insertSheet("PARTICIPANTS");
  var rSheet = ss.getSheetByName("DEMANDES_RDV") || ss.insertSheet("DEMANDES_RDV");
  
  if (pSheet.getLastRow() === 0) {
    pSheet.appendRow(["ID", "Date", "Civilité", "Prénom", "Nom", "Email", "Téléphone", "Société", "Fonction", "Type", "Disponibilités", "Remarques", "Sociétés Demandées"]);
  }
  if (rSheet.getLastRow() === 0) {
    rSheet.appendRow(["ID Participant", "Nom Participant", "Société Participant", "Société Demandée", "Format", "Actionnaire", "Connaissance", "Priorité", "Remarques"]);
  }
  
  var p = data.identity;
  pSheet.appendRow([data.id, data.createdAt, p.civility, p.firstName, p.lastName, p.email, p.phone, p.company, p.jobTitle, p.investorType, data.availability.fullDay ? "Toute la journée" : data.availability.slots.join("; "), data.availability.notes || "Aucune", data.selectedCompanies.length]);
  
  data.selectedCompanies.forEach(function(cid) {
    var pref = data.companyPreferences[cid] || {};
    rSheet.appendRow([data.id, p.firstName + " " + p.lastName, p.company, cid, pref.format || "One-to-One", pref.isShareholder || "Non", pref.knowledgeLevel || 3, pref.priority || "Souhaitée", data.availability.notes || "Aucune"]);
  });
  
  return ContentService.createTextOutput("SUCCESS");
}`;

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
            { id: 'event', label: 'Infos, Google Sheets & Webhook', icon: Calendar },
            { id: 'agenda', label: 'Générateur d\'Agendas (Matching Engine)', icon: Sparkles }
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

        {/* TAB 1: REGISTRATIONS WITH CHECKBOX SELECTION & DELETION */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            
            {/* Selection Status & Action Toolbar */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchReg}
                  onChange={(e) => setSearchReg(e.target.value)}
                  placeholder="Rechercher par nom, société..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Selection Counter pill */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-md font-bold">
                  {selectedRegIds.length} dossier(s) sélectionné(s) / {filteredRegistrations.length}
                </span>
                {selectedRegIds.length > 0 && (
                  <button
                    onClick={() => setSelectedRegIds([])}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Désélectionner tout
                  </button>
                )}
              </div>

              {/* Download & Delete Actions */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => exportParticipantsXLSX(selectedRegIds.length > 0)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    selectedRegIds.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                  }`}
                  title="Télécharger directement en véritable fichier Excel (.xlsx) avec remarques"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {selectedRegIds.length > 0 ? `Excel Participants (${selectedRegIds.length})` : 'Excel Tous les Participants'}
                  </span>
                </button>

                <button
                  onClick={() => exportDemandesXLSX(selectedRegIds.length > 0)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    selectedRegIds.length > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      : 'bg-blue-900/60 hover:bg-blue-800 text-blue-200'
                  }`}
                  title="Télécharger la matrice des demandes en véritable fichier Excel (.xlsx) avec remarques"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {selectedRegIds.length > 0 ? `Excel Demandes (${selectedRegIds.length})` : 'Excel Toutes les Demandes'}
                  </span>
                </button>

                {selectedRegIds.length > 0 && (
                  <button
                    onClick={triggerDeleteSelected}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer la sélection ({selectedRegIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Table */}
            <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-300 hover:text-white"
                        title="Tout sélectionner / Tout désélectionner"
                      >
                        {selectedRegIds.length === filteredRegistrations.length && filteredRegistrations.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">ID / Date</th>
                    <th className="p-3.5">Participant</th>
                    <th className="p-3.5">Société / Fonction</th>
                    <th className="p-3.5">Disponibilités & Remarques</th>
                    <th className="p-3.5">Sociétés Demandées</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRegistrations.map((reg) => {
                    const isSelected = selectedRegIds.includes(reg.id);

                    return (
                      <tr
                        key={reg.id}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-950/40 font-medium' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3.5 text-center" onClick={() => toggleSelectReg(reg.id)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectReg(reg.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-700 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3.5" onClick={() => toggleSelectReg(reg.id)}>
                          <span className="font-bold text-white block">{reg.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reg.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </td>

                        <td className="p-3.5" onClick={() => toggleSelectReg(reg.id)}>
                          <span className="font-bold text-white block">
                            {reg.identity.civility} {reg.identity.firstName} {reg.identity.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400">{reg.identity.email}</span>
                        </td>

                        <td className="p-3.5" onClick={() => toggleSelectReg(reg.id)}>
                          <span className="font-bold text-blue-300 block">{reg.identity.company}</span>
                          <span className="text-[11px] text-slate-400">{reg.identity.jobTitle} ({reg.identity.investorType})</span>
                        </td>

                        <td className="p-3.5" onClick={() => toggleSelectReg(reg.id)}>
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded font-semibold text-[11px] block w-fit mb-1">
                            {reg.availability.fullDay ? 'Toute la journée' : `${reg.availability.slots.length} créneau(x)`}
                          </span>
                          {reg.availability.notes ? (
                            <span className="text-[11px] text-amber-300 italic block font-medium">
                              💬 "{reg.availability.notes}"
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 block">Sans remarque</span>
                          )}
                        </td>

                        <td className="p-3.5" onClick={() => toggleSelectReg(reg.id)}>
                          <span className="px-2.5 py-1 bg-blue-900/60 text-blue-200 rounded-full font-bold text-[11px] inline-block">
                            {reg.selectedCompanies.length} sociétés
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Détail des choix de ${reg.identity.firstName} ${reg.identity.lastName} :\n` +
                                `Remarques : ${reg.availability.notes || 'Aucune'}\n\n` +
                                reg.selectedCompanies.map(c => `- ${c}`).join('\n'));
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded border border-slate-700"
                          >
                            Détails
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDeleteSingle(reg);
                            }}
                            className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded border border-rose-800 transition-colors"
                            title="Supprimer cette demande"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

        {/* TAB 3: EVENT & GOOGLE SHEETS WEBHOOK */}
        {activeTab === 'event' && (
          <div className="space-y-6">
            <div className="bg-emerald-950/40 p-6 rounded-2xl border border-emerald-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Connexion Google Sheets en Temps Réel (Webhook)
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Entrez l'URL Webhook de votre Google Sheet ou Zapier/Make pour recevoir automatiquement chaque inscription en temps réel !
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase mb-1">
                  URL Webhook Google Sheets / Make / Zapier :
                </label>
                <input
                  type="url"
                  value={eventInfo.webhookUrl || ''}
                  onChange={(e) => updateEventInfo({ webhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-3 bg-slate-900 border border-emerald-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Script Google Apps Script (Copier-Coller dans Google Sheets Extensions → Apps Script) :
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(googleAppsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedScript ? 'Copié !' : 'Copier le script'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded overflow-x-auto max-h-40">
                  {googleAppsScriptCode}
                </pre>
              </div>
            </div>

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
          </div>
        )}

        {/* TAB 4: AUTOMATED AGENDA GENERATOR */}
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
                    Gère les créneaux <strong>One-to-One (Exclusif Solo)</strong> et <strong>One-to-Few (Groupes partagés sans conflit)</strong> en croisant les priorités et contraintes des entreprises (ex: Sword 10-12h et 15-16h).
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {TIME_SLOTS.map(slot => {
                            const entry = data.schedule[slot];
                            return (
                              <div key={slot} className={`p-2 rounded border flex items-center justify-between ${
                                entry
                                  ? entry.format === 'One-to-One'
                                    ? 'bg-blue-900/80 border-blue-500 text-white font-bold'
                                    : 'bg-indigo-900/80 border-indigo-500 text-indigo-100 font-bold'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
                              }`}>
                                <span>{slot} :</span>
                                {entry ? (
                                  <span className="flex items-center space-x-1">
                                    {entry.format === 'One-to-One' ? <UserCheck className="w-3 h-3 text-blue-300" /> : <Users2 className="w-3 h-3 text-indigo-300" />}
                                    <span className="text-white font-bold">{entry.companyName}</span>
                                    <span className="text-[9px] opacity-80">({entry.format})</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Libre</span>
                                )}
                              </div>
                            );
                          })}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {TIME_SLOTS.map(slot => {
                            const slotState = slots[slot];
                            const isBusy = slotState.participants.length > 0;

                            return (
                              <div key={slot} className={`p-2 rounded border space-y-1 ${
                                isBusy
                                  ? slotState.mode === 'One-to-One'
                                    ? 'bg-emerald-950 border-emerald-600 text-emerald-200'
                                    : 'bg-indigo-950 border-indigo-600 text-indigo-200'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">{slot} :</span>
                                  {isBusy && (
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                      slotState.mode === 'One-to-One' ? 'bg-emerald-800 text-white' : 'bg-indigo-800 text-white'
                                    }`}>
                                      {slotState.mode === 'One-to-One' ? 'Solo (1-to-1)' : `Groupe (${slotState.participants.length})`}
                                    </span>
                                  )}
                                </div>
                                {isBusy ? (
                                  <div className="text-[10px] space-y-0.5 text-white font-medium">
                                    {slotState.participants.map((p, pIdx) => (
                                      <div key={pIdx} className="truncate">• {p}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-500">Disponible</span>
                                )}
                              </div>
                            );
                          })}
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

      {/* STRICT DELETION CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-100">
            
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Confirmation de suppression</h3>
                <p className="text-xs text-rose-300 font-semibold">Action irréversible</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer <strong className="text-white">{deleteTargetLabel}</strong> ? Les données associées seront retirées définitivement.
            </p>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                Pour confirmer, veuillez saisir le mot <span className="text-rose-400 uppercase font-mono tracking-wider font-extrabold">Supprimer</span> ci-dessous :
              </label>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Tapez Supprimer..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 font-semibold"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim() !== 'Supprimer'}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow ${
                  deleteConfirmText.trim() === 'Supprimer'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-rose-900/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                SUPPRIMER DÉFINITIVEMENT
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
