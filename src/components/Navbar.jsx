import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Calendar, Menu, X, Shield, ArrowRight, Lock } from 'lucide-react';

export const Navbar = () => {
  const { openWizard, selectedCompanyIds, adminMode, setAdminMode, openAdminProtected, adminAuthenticated, logoutAdmin } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '#accueil' },
    { name: 'Programme', href: '#programme' },
    { name: 'Sociétés présentes', href: '#societes' },
    { name: 'Informations pratiques', href: '#infos' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-nav py-3 shadow-sm' : 'bg-white/80 backdrop-blur-md py-4 border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#accueil" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-md font-bold text-lg group-hover:bg-blue-800 transition-colors">
            EC
          </div>
          <div>
            <div className="text-xs tracking-wider uppercase font-semibold text-blue-900 flex items-center gap-1.5">
              <span>EuroLand Corporate</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
            <div className="text-sm font-bold text-slate-900 font-display">
              16<sup>ème</sup> Journée Small & Mid Caps
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors py-1 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center space-x-4">
          {/* Admin Mode Switch with Password Lock */}
          {adminMode ? (
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-blue-900 text-white border border-blue-900 shadow-sm"
              title="Déconnexion Administrateur"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Quitter Admin</span>
            </button>
          ) : (
            <button
              onClick={openAdminProtected}
              className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              title="Accès Administrateur EuroLand Corporate (Protégé par mot de passe)"
            >
              <Lock className="w-3.5 h-3.5 text-blue-900" />
              <span>Accès Admin</span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={openWizard}
            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center space-x-2"
          >
            <span>S'INSCRIRE</span>
            {selectedCompanyIds.length > 0 ? (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {selectedCompanyIds.length}
              </span>
            ) : (
              <ArrowRight className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={openAdminProtected}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-md"
            aria-label="Admin"
          >
            <Lock className="w-5 h-5 text-blue-900" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-800 hover:text-blue-900 py-2 border-b border-slate-100"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openWizard();
              }}
              className="w-full bg-blue-900 text-white text-center py-3 rounded-md font-bold text-sm shadow flex items-center justify-center space-x-2"
            >
              <span>S'INSCRIRE À L'ÉVÉNEMENT</span>
              {selectedCompanyIds.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {selectedCompanyIds.length} sélectionnée(s)
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
