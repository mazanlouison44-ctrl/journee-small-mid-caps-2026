import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPANIES } from '../data/companies';
import { INITIAL_PROGRAM, INITIAL_EVENT_INFO } from '../data/program';

const AppContext = createContext();

const STORAGE_KEYS = {
  COMPANIES: 'jsmc_companies_v1',
  PROGRAM: 'jsmc_program_v1',
  EVENT_INFO: 'jsmc_event_info_v1',
  REGISTRATIONS: 'jsmc_registrations_v1',
  ADMIN_AUTH: 'jsmc_admin_auth_v1'
};

const INITIAL_DEMO_REGISTRATIONS = [
  {
    id: 'REG-1001',
    createdAt: '2026-09-04T10:15:00.000Z',
    identity: {
      civility: 'Monsieur',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@abc-asset.com',
      phone: '+33 6 12 34 56 78',
      company: 'ABC Asset Management',
      jobTitle: 'Gérant Actions Mid Caps',
      investorType: 'Société de gestion'
    },
    availability: {
      fullDay: false,
      slots: ['09h00 - 10h00', '10h00 - 11h00', '11h00 - 12h00', '14h00 - 15h00', '15h00 - 16h00', '16h00 - 17h00'],
      notes: 'Départ impératif à 17h00 pour train.'
    },
    selectedCompanies: ['deezer', 'stif', 'wendel', 'ovhcloud', 'sword'],
    companyPreferences: {
      deezer: { format: 'One-to-One', isShareholder: 'Non', knowledgeLevel: 4, priority: 'Prioritaire' },
      stif: { format: 'One-to-One', isShareholder: 'Oui', knowledgeLevel: 5, priority: 'Prioritaire' },
      wendel: { format: 'One-to-Few', isShareholder: 'Non', knowledgeLevel: 3, priority: 'Souhaitée' },
      ovhcloud: { format: 'Indifférent', isShareholder: 'Non', knowledgeLevel: 4, priority: 'Souhaitée' },
      sword: { format: 'One-to-One', isShareholder: 'Non', knowledgeLevel: 4, priority: 'Prioritaire' }
    }
  }
];

export const AppProvider = ({ children }) => {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [program, setProgram] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRAM);
    return saved ? JSON.parse(saved) : INITIAL_PROGRAM;
  });

  const [eventInfo, setEventInfo] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENT_INFO);
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...INITIAL_EVENT_INFO, ...parsed, adminPassword: 'EuroL@nd2026!' };
  });

  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return saved ? JSON.parse(saved) : INITIAL_DEMO_REGISTRATIONS;
  });

  // UI & Password Security state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [lastSubmittedRegistration, setLastSubmittedRegistration] = useState(null);
  
  const [adminMode, setAdminMode] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRAM, JSON.stringify(program));
  }, [program]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENT_INFO, JSON.stringify(eventInfo));
  }, [eventInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  }, [registrations]);

  // Admin Security Helper
  const openAdminProtected = () => {
    if (adminAuthenticated) {
      setAdminMode(true);
    } else {
      setPasswordModalOpen(true);
    }
  };

  const loginAdmin = (enteredPassword) => {
    const targetPass = 'EuroL@nd2026!';
    const currentPass = eventInfo.adminPassword || targetPass;

    if (enteredPassword === targetPass || enteredPassword === currentPass) {
      setAdminAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      setPasswordModalOpen(false);
      setAdminMode(true);
      if (eventInfo.adminPassword !== targetPass) {
        setEventInfo(prev => ({ ...prev, adminPassword: targetPass }));
      }
      return true;
    } else {
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminAuthenticated(false);
    setAdminMode(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  };

  // Company selection helper
  const toggleSelectCompany = (id) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openWizardWithCompany = (id) => {
    if (!selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds((prev) => [...prev, id]);
    }
    setWizardStep(1);
    setWizardOpen(true);
  };

  const openWizard = () => {
    setWizardStep(1);
    setWizardOpen(true);
  };

  const submitRegistration = (newRegistration) => {
    const registrationWithId = {
      ...newRegistration,
      id: `REG-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    };

    setRegistrations((prev) => [registrationWithId, ...prev]);
    setLastSubmittedRegistration(registrationWithId);
    setWizardOpen(false);
    setConfirmationModalOpen(true);
    setSelectedCompanyIds([]);

    if (eventInfo.webhookUrl && eventInfo.webhookUrl.trim() !== '') {
      try {
        fetch(eventInfo.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationWithId)
        }).catch((err) => console.log('Webhook send notice:', err));
      } catch (e) {
        console.log('Webhook error:', e);
      }
    }
  };

  // Admin Actions
  const toggleCompanyActive = (id) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const updateCompany = (id, updatedFields) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const addCompany = (newCompany) => {
    setCompanies((prev) => [...prev, newCompany]);
  };

  const updateEventInfo = (updated) => {
    setEventInfo((prev) => ({ ...prev, ...updated }));
  };

  const updateProgramItem = (id, updated) => {
    setProgram((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const resetDataToDefault = () => {
    setCompanies(INITIAL_COMPANIES);
    setProgram(INITIAL_PROGRAM);
    setEventInfo({ ...INITIAL_EVENT_INFO, adminPassword: 'EuroL@nd2026!' });
    setRegistrations(INITIAL_DEMO_REGISTRATIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.PROGRAM);
    localStorage.removeItem(STORAGE_KEYS.EVENT_INFO);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        companies,
        program,
        eventInfo,
        registrations,
        wizardOpen,
        setWizardOpen,
        wizardStep,
        setWizardStep,
        selectedCompanyIds,
        setSelectedCompanyIds,
        toggleSelectCompany,
        openWizardWithCompany,
        openWizard,
        confirmationModalOpen,
        setConfirmationModalOpen,
        lastSubmittedRegistration,
        submitRegistration,
        adminMode,
        setAdminMode,
        adminAuthenticated,
        openAdminProtected,
        loginAdmin,
        logoutAdmin,
        passwordModalOpen,
        setPasswordModalOpen,
        toggleCompanyActive,
        updateCompany,
        addCompany,
        updateEventInfo,
        updateProgramItem,
        resetDataToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
