
import React from 'react';
import { UserRole, User } from '../types';
import { ADMIN_MENU, EMPRESA_MENU, CLIENTE_MENU, MenuItem } from '../constants';

interface AppLauncherProps {
  user: User;
  onNavigate: (path: string) => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ user, onNavigate }) => {
  const menuItems = user.role === UserRole.ADMIN 
    ? ADMIN_MENU 
    : user.role === UserRole.EMPRESA 
    ? EMPRESA_MENU 
    : CLIENTE_MENU;

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Aplicativos</h2>
        <p className="text-gray-500">Selecione uma ferramenta para começar.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {menuItems.map((item: MenuItem) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className="group flex flex-col items-center gap-3 p-4 rounded-[2.5rem] bg-white border border-transparent shadow-sm hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${item.color} rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-3 transition-transform`}>
              {item.icon}
            </div>
            <div className="text-center">
              <span className="block font-bold text-gray-800 text-sm sm:text-base">{item.label}</span>
              <span className="hidden sm:block text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-1">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppLauncher;
