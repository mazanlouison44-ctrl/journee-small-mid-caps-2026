import React from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { CompaniesSection } from './components/CompaniesSection';
import { ProgramSection } from './components/ProgramSection';
import { PracticalInfoSection } from './components/PracticalInfoSection';
import { RegistrationWizard } from './components/RegistrationWizard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MobileStickyBar } from './components/MobileStickyBar';
import { Footer } from './components/Footer';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
      <Navbar />
      
      <main className="flex-grow">
        <AdminDashboard />
        <Hero />
        <AboutSection />
        <CompaniesSection />
        <ProgramSection />
        <PracticalInfoSection />
      </main>

      <Footer />
      <MobileStickyBar />

      {/* Modals & Overlay Workflows */}
      <RegistrationWizard />
      <ConfirmationModal />
      <AdminPasswordModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
