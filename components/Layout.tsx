
import React, { useState, useEffect } from 'react';
// Added missing CreditCard icon import to fix the compilation error
import { LayoutDashboard, Grid, Bell, LogOut, Search, Calendar, History, Heart, Settings, Building2, Scissors, CreditCard } from 'lucide-react';
import { UserRole, User } from '../types';
import { storage } from '../utils/storage';
import { onNotificationsUpdated } from '../utils/notifications';
import BrandLogo from './BrandLogo';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, setActiveView }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = () => {
      const notifs = storage.get<any[]>('notifications', []);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };
    checkNotifications();
    const unsubscribe = onNotificationsUpdated(checkNotifications);
    const interval = setInterval(checkNotifications, 5000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
  
  const renderBottomItem = (label: string, icon: React.ReactNode, path: string, badgeCount?: number) => {
    const isActive = activeView === path;
    return (
      <button
        onClick={() => setActiveView(path)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-colors relative ${isActive ? 'bg-pink-50' : 'bg-transparent'}`}>
          {/* Fix: Cast icon to React.ReactElement<any> to avoid type errors with Lucide icon props */}
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-pink-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300 px-0.5">
              {badgeCount}
            </span>
          )}
        </div>
        <span className={`text-[10px] mt-0.5 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('launcher')}>
            <BrandLogo imageClassName="h-9 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView('notifications')}
              className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full sm:mr-2 relative hidden sm:flex"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-pink-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-1">{user.role}</p>
              </div>
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" alt="Profile" />
              <button onClick={onLogout} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 px-4 pt-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-20">
        <div className="max-w-md w-full flex justify-between">
          {user.role === UserRole.CLIENTE && (
            <>
              {renderBottomItem('Explorar', <Search />, 'explore')}
              {renderBottomItem('Histórico', <History />, 'history')}
              {renderBottomItem('Alertas', <Bell />, 'notifications', unreadCount)}
              {renderBottomItem('Apps', <Grid />, 'launcher')}
            </>
          )}
          {user.role === UserRole.EMPRESA && (
            <>
              {renderBottomItem('Agenda', <Calendar />, 'schedule')}
              {renderBottomItem('Finanças', <CreditCard />, 'finance')}
              {renderBottomItem('Alertas', <Bell />, 'notifications', unreadCount)}
              {renderBottomItem('Apps', <Grid />, 'launcher')}
            </>
          )}
          {user.role === UserRole.ADMIN && (
            <>
              {renderBottomItem('Dashboard', <LayoutDashboard />, 'dashboard')}
              {renderBottomItem('Empresas', <Building2 />, 'companies')}
              {renderBottomItem('Alertas', <Bell />, 'notifications', unreadCount)}
              {renderBottomItem('Apps', <Grid />, 'launcher')}
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
