import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_SECTORS } from '../data/companies';
import { Search, Filter, Check, Plus, AlertCircle, Building2, ArrowRight } from 'lucide-react';

export const CompaniesSection = () => {
  const { companies, selectedCompanyIds, toggleSelectCompany, openWizard } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous les secteurs');

  // Filter & sort active companies alphabetically (A-Z)
  const activeCompanies = useMemo(() => {
    return [...companies]
      .filter((c) => c.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [companies]);

  // Apply search & sector filters
  const filteredCompanies = useMemo(() => {
    return activeCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector =
        selectedSector === 'Tous les secteurs' || company.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [activeCompanies, searchQuery, selectedSector]);

  return (
    <section id="societes" className="py-20 bg-white relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-xs font-semibold tracking-wider uppercase mb-2">
              Catalogue Officiel (Ordre Alphabétique)
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Sociétés participantes
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl text-sm sm:text-base">
              Cochez simplement les dirigeants d'entreprises cotées que vous souhaitez rencontrer. L'équipe EuroLand Corporate se charge d'organiser votre planning.
            </p>
          </div>

          {/* Counter pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shrink-0 shadow-xs">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Demandes en cours</span>
              <span className="text-xl font-extrabold text-blue-900 font-display">
                {selectedCompanyIds.length} société{selectedCompanyIds.length > 1 ? 's' : ''}
              </span>
            </div>
            {selectedCompanyIds.length > 0 && (
              <button
                onClick={openWizard}
                className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-extrabold px-5 py-3 rounded-xl transition-all flex items-center space-x-1.5 shadow-md"
              >
                <span>S'INSCRIRE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une société, ticker..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Sector Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {AVAILABLE_SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const isSelected = selectedCompanyIds.includes(company.id);

            return (
              <div
                key={company.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 relative group ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      {/* Logo Avatar Badge */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-50 text-blue-900 border-slate-200 group-hover:border-blue-200'
                      }`}>
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-900 transition-colors font-display">
                          {company.name}
                        </h3>
                        {company.ticker && (
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                            {company.ticker}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator Checkbox */}
                    <button
                      onClick={() => toggleSelectCompany(company.id)}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-900 border-blue-900 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400 text-transparent'
                      }`}
                      aria-label="Sélectionner"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Sector Tag */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-900 rounded-full">
                      {company.sector}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed font-normal">
                    {company.description}
                  </p>

                  {/* Special Availability Constraint Badge (e.g. Sword) */}
                  {company.availabilityConstraint && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="font-semibold">
                        {company.availabilityConstraint.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => toggleSelectCompany(company.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                      isSelected
                        ? 'bg-blue-50 text-blue-950 border border-blue-200 hover:bg-blue-100'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 text-blue-900 stroke-[3]" />
                        <span>SOCIÉTÉ SÉLECTIONNÉE</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>AJOUTER À MA DEMANDE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aucune société trouvée</h3>
            <p className="text-slate-500 text-sm mt-1">Essayez de modifier votre recherche ou le filtre de secteur.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedSector('Tous les secteurs'); }}
              className="mt-4 text-xs font-bold text-blue-900 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
