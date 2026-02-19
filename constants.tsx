
import React from 'react';
import { 
  LayoutDashboard, Building2, Scissors, Users, Settings, 
  History, Search, Calendar, Heart, PieChart, Bell, 
  CreditCard, ShieldCheck, HelpCircle, Briefcase, DollarSign,
  Trophy, Star, Target, Zap, Flame
} from 'lucide-react';

export const COLORS = {
  primary: '#E11D48', // Marca Rose
  secondary: '#333333',
  success: '#00C851',
  warning: '#fbbf24',
  danger: '#ef4444',
  info: '#3b82f6',
};

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  description?: string;
}

export const ADMIN_MENU: MenuItem[] = [
  { icon: <LayoutDashboard size={28} />, label: 'Dashboard', path: 'dashboard', color: 'bg-blue-500', description: 'Visão geral do sistema' },
  { icon: <Building2 size={28} />, label: 'Empresas', path: 'companies', color: 'bg-purple-500', description: 'Gestão de parceiros' },
  { icon: <Trophy size={28} />, label: 'Gamificação', path: 'gamification', color: 'bg-amber-500', description: 'Regras de fidelidade' },
  { icon: <DollarSign size={28} />, label: 'Financeiro', path: 'finances', color: 'bg-green-600', description: 'Controle de repasses' },
  { icon: <PieChart size={28} />, label: 'Relatórios', path: 'reports', color: 'bg-orange-500', description: 'Financeiro e métricas' },
  { icon: <Settings size={28} />, label: 'Ajustes', path: 'settings', color: 'bg-gray-500', description: 'Configurações globais' },
];

export const EMPRESA_MENU: MenuItem[] = [
  { icon: <LayoutDashboard size={28} />, label: 'Painel', path: 'dashboard', color: 'bg-pink-600', description: 'Resumo operacional' },
  { icon: <Scissors size={28} />, label: 'Serviços', path: 'services', color: 'bg-indigo-500', description: 'Catálogo de serviços' },
  { icon: <Flame size={28} />, label: 'Ofertas Flash', path: 'flash_offers', color: 'bg-orange-500', description: 'Promoções relâmpago' },
  { icon: <Users size={28} />, label: 'Equipe', path: 'team', color: 'bg-teal-500', description: 'Gestão de profissionais' },
  { icon: <Calendar size={28} />, label: 'Agenda', path: 'schedule', color: 'bg-rose-500', description: 'Calendário de reservas' },
  { icon: <CreditCard size={28} />, label: 'Financeiro', path: 'finance', color: 'bg-emerald-500', description: 'Ganhos e repasses' },
  { icon: <Settings size={28} />, label: 'Empresa', path: 'settings', color: 'bg-gray-400', description: 'Dados da unidade' },
];

export const CLIENTE_MENU: MenuItem[] = [
  { icon: <Search size={28} />, label: 'Explorar', path: 'explore', color: 'bg-[#E11D48]', description: 'Buscar serviços' },
  { icon: <Calendar size={28} />, label: 'Agendar', path: 'booking', color: 'bg-violet-500', description: 'Novo agendamento' },
  { icon: <History size={28} />, label: 'Histórico', path: 'history', color: 'bg-amber-500', description: 'Minhas visitas' },
  { icon: <Heart size={28} />, label: 'Favoritos', path: 'favorites', color: 'bg-red-500', description: 'Salvos por mim' },
  { icon: <HelpCircle size={28} />, label: 'Suporte', path: 'support', color: 'bg-sky-500', description: 'Central de ajuda' },
  { icon: <Users size={28} />, label: 'Perfil', path: 'profile', color: 'bg-gray-500', description: 'Meus dados' },
];

export const BOTTOM_BAR_ITEMS = {
  ADMIN: ['dashboard', 'companies', 'gamification', 'launcher'],
  EMPRESA: ['dashboard', 'schedule', 'flash_offers', 'launcher'],
  CLIENTE: ['explore', 'history', 'favorites', 'launcher'],
};

export const AVAILABLE_CITIES = [
  'Cujubim',
  'Ariquemes',
  'Ji-Paraná',
  'Rio Crespo',
  'Machadinho do Oeste'
];
