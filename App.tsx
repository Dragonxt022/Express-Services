
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import Companies from './pages/admin/Companies';
import Reports from './pages/admin/Reports';
import Audit from './pages/admin/Audit';
import AdminSettings from './pages/admin/Settings';
import AdminFinances from './pages/admin/AdminFinances';
import GamificationManager from './pages/admin/GamificationManager';
import EmpresaDashboard from './pages/EmpresaDashboard';
import Services from './pages/empresa/Services';
import Team from './pages/empresa/Team';
import Schedule from './pages/empresa/Schedule';
import FlashOffers from './pages/empresa/FlashOffers';
import EmpresaFinances from './pages/empresa/EmpresaFinances';
import EmpresaSettings from './pages/empresa/Settings';
import ClienteHome from './pages/ClienteHome';
import Booking from './pages/cliente/Booking';
import History from './pages/cliente/History';
import Favorites from './pages/cliente/Favorites';
import Support from './pages/cliente/Support';
import ClienteProfile from './pages/cliente/Profile';
import CompanyDetails from './pages/cliente/CompanyDetails';
import ExploreResults from './pages/cliente/ExploreResults';
import Checkout from './pages/cliente/Checkout';
import Notifications from './pages/Notifications';
import AppLauncher from './pages/AppLauncher';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterSuccess from './pages/auth/RegisterSuccess';
import CompanyInviteSetup from './pages/auth/CompanyInviteSetup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Onboarding from './pages/auth/Onboarding';
import Concierge from './components/Concierge';
import { User, UserRole, Service, Company } from './types';
import { COLORS } from './constants';
import { storage } from './utils/storage';
import { FeedbackProvider } from './context/FeedbackContext';
import { authService } from './services/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('launcher');
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register' | 'verify_email' | 'company_invite_setup' | 'forgot_password' | 'onboarding'>('welcome');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const [companyInviteToken, setCompanyInviteToken] = useState<string>('');
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartServices, setCartServices] = useState<Service[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
      });
    }

    const bootstrapAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const verificationToken = params.get('email_verify_token');
      const inviteToken = params.get('company_invite_token');

      if (inviteToken) {
        setCompanyInviteToken(inviteToken);
        setAuthView('company_invite_setup');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (verificationToken) {
        try {
          const response = await authService.verifyEmail(verificationToken);
          if (response.data?.success && response.data?.token && response.data?.user) {
            const roleMap: Record<string, UserRole> = {
              CLIENTE: UserRole.CLIENTE,
              EMPRESA: UserRole.EMPRESA,
              ADMIN: UserRole.ADMIN
            };
            const mappedRole = roleMap[response.data.user.role] || UserRole.CLIENTE;
            handleLogin(mappedRole, response.data.token, response.data.user);
          }
        } catch (error) {
          console.error('Erro ao confirmar e-mail:', error);
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        return;
      }

      const savedUser = storage.get<User | null>('session', null);
      const savedToken = storage.get<string>('token', null);
      if (savedUser && savedToken) {
        setCurrentUser(savedUser);
        setActiveView(savedUser.role === UserRole.CLIENTE ? 'explore' : 'launcher');
      }
    };

    bootstrapAuth();
  }, []);

  const handleLogin = (role: UserRole, token: string, userData: any) => {
    const user: User = {
      id: userData.id.toString(),
      name: userData.name,
      email: userData.email,
      role: role,
    };
    setCurrentUser(user);
    storage.set('session', user);
    storage.set('token', token);
    setActiveView(role === UserRole.CLIENTE ? 'explore' : 'launcher');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.remove('session');
    storage.remove('token');
    setActiveView('launcher');
  };

  const handleSearch = (term: string) => {
    setActiveCategory(`Busca: ${term}`);
    setActiveView('explore_results');
  };

  const renderContent = () => {
    if (!currentUser) return null;

    if (activeView === 'launcher') return <AppLauncher user={currentUser} onNavigate={setActiveView} />;
    if (activeView === 'notifications') return <Notifications />;

    switch (currentUser.role) {
      case UserRole.ADMIN:
        if (activeView === 'dashboard') return <AdminDashboard />;
        if (activeView === 'companies') return <Companies />;
        if (activeView === 'gamification') return <GamificationManager />;
        if (activeView === 'finances') return <AdminFinances />;
        if (activeView === 'reports') return <Reports />;
        if (activeView === 'audit') return <Audit />;
        if (activeView === 'settings') return <AdminSettings />;
        break;
      
      case UserRole.EMPRESA:
        if (activeView === 'dashboard') return <EmpresaDashboard onNavigate={setActiveView} />;
        if (activeView === 'services') return <Services />;
        if (activeView === 'flash_offers') return <FlashOffers />;
        if (activeView === 'team') return <Team />;
        if (activeView === 'schedule') return <Schedule />;
        if (activeView === 'finance') return <EmpresaFinances />;
        if (activeView === 'settings') return <EmpresaSettings />;
        break;

      case UserRole.CLIENTE:
        if (activeView === 'explore') return (
          <ClienteHome 
            onSelectCompany={(id) => { setActiveCompanyId(id); setActiveView('company_details'); }} 
            onSelectCategory={(cat) => { setActiveCategory(cat); setActiveView('explore_results'); }}
            onSearchSubmit={handleSearch}
          />
        );
        if (activeView === 'explore_results' && activeCategory) return (
          <ExploreResults 
            category={activeCategory} 
            onBack={() => setActiveView('explore')} 
            onSelectCompany={(id) => { setActiveCompanyId(id); setActiveView('company_details'); }}
          />
        );
        // Novo Fluxo: Booking intermediário
        if (activeView === 'booking' && cartServices.length > 0) return (
          <Booking 
            services={cartServices}
            initialCompany={{ name: 'Studio Elegance', id: activeCompanyId || '2' } as Company}
            onBack={() => setActiveView('company_details')}
            onConfirm={(details) => {
              setBookingData(details);
              setActiveView('checkout');
            }}
          />
        );
        if (activeView === 'checkout' && bookingData) return (
          <Checkout 
            services={bookingData.services} 
            bookingDetails={bookingData}
            onBack={() => setActiveView('booking')} 
            onConfirm={() => {
              setCartServices([]);
              setActiveView('history');
            }}
          />
        );
        if (activeView === 'history') return <History />;
        if (activeView === 'favorites') return <Favorites />;
        if (activeView === 'support') return <Support />;
        if (activeView === 'profile') return <ClienteProfile />;
        if (activeView === 'company_details' && activeCompanyId) return (
          <CompanyDetails 
            companyId={activeCompanyId} 
            onBack={() => setActiveView('explore')} 
            cartServices={cartServices}
            onUpdateCart={setCartServices}
            onProceedToBooking={() => setActiveView('booking')}
          />
        );
        break;
    }

    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Página em Construção</h2>
      </div>
    );
  };

  const AppContent = () => {
    if (!currentUser) {
      if (authView === 'login') {
        return <Login onLogin={handleLogin} onNavigate={setAuthView} />;
      }
      if (authView === 'register') {
        return (
          <Register
            onBack={() => setAuthView('login')}
            onSuccess={(email) => {
              setPendingVerificationEmail(email || '');
              setAuthView('verify_email');
            }}
          />
        );
      }
      if (authView === 'verify_email') {
        return (
          <RegisterSuccess
            email={pendingVerificationEmail}
            onBackToLogin={() => setAuthView('login')}
          />
        );
      }
      if (authView === 'company_invite_setup' && companyInviteToken) {
        return (
          <CompanyInviteSetup
            token={companyInviteToken}
            onActivated={(role, token, userData) => {
              handleLogin(role, token, userData);
              if (role === UserRole.EMPRESA) {
                setActiveView('dashboard');
              }
            }}
          />
        );
      }
      if (authView === 'onboarding') {
        return <Onboarding onComplete={() => setAuthView('login')} />;
      }
      if (authView === 'forgot_password') {
        return <ForgotPassword onBack={() => setAuthView('login')} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#E11D48] to-rose-700 flex items-center justify-center text-white mx-auto mb-10 shadow-2xl relative z-10 group hover:rotate-12 transition-transform">
              <span className="text-4xl font-black tracking-tighter">BE</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">BelezaExpress</h1>
            <p className="text-gray-400 mb-12 font-semibold uppercase tracking-widest text-[10px]">Premium Marketplace</p>
            <div className="space-y-4 relative z-10">
               <button onClick={() => setAuthView('login')} className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95" style={{ backgroundColor: COLORS.primary }}>Entrar na Conta</button>
               <button onClick={() => setAuthView('register')} className="w-full py-5 rounded-[1.8rem] font-bold bg-slate-100 text-gray-800 hover:bg-slate-200 transition-all">Criar Nova Conta</button>
              
            </div>
            <p className="mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">v1.2.0 Enhanced Flow</p>
          </div>
        </div>
      );
    }

    return (
      <Layout user={currentUser} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
        {renderContent()}
        {currentUser.role === UserRole.CLIENTE && <Concierge />}
      </Layout>
    );
  };

  return (
    <FeedbackProvider>
      <AppContent />
    </FeedbackProvider>
  );
};

export default App;
