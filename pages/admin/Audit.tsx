
import React from 'react';
import { Shield, Search, Filter, Clock, User, AlertCircle } from 'lucide-react';

const logs = [
  { id: 1, action: 'Empresa Aprovada', user: 'Admin Master', target: 'Studio Elegance', time: 'Há 10 min', status: 'success' },
  { id: 2, action: 'Alteração de Royalty', user: 'Admin Master', target: 'Barbearia do Zé (15% -> 12%)', time: 'Há 2h', status: 'info' },
  { id: 3, action: 'Login Suspeito', user: 'Sistems', target: 'IP 182.16.0.1 (Russia)', time: 'Há 5h', status: 'warning' },
  { id: 4, action: 'Exclusão de Serviço', user: 'Empresa: Bella', target: 'Manicure Express', time: 'Há 1 dia', status: 'info' },
  { id: 5, action: 'Configuração Alterada', user: 'Admin Master', target: 'Cor Primária App', time: 'Há 2 dias', status: 'info' },
];

const Audit: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria & Segurança</h1>
          <p className="text-gray-500">Histórico completo de ações realizadas no sistema.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-bold text-sm">
          <Shield size={18} className="text-slate-500" />
          Sistema Seguro
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Filtrar por usuário ou ação..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-600 font-bold shadow-sm">
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {logs.map((log) => (
            <div key={log.id} className="p-6 flex items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  log.status === 'warning' ? 'bg-amber-50 text-amber-500' : 
                  log.status === 'success' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {log.status === 'warning' ? <AlertCircle size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{log.action}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <User size={12} /> {log.user}
                    </span>
                    <span className="text-gray-200">•</span>
                    <span className="text-xs font-medium text-gray-400 tracking-tight">Alvo: {log.target}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center py-4">
        <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Carregar logs mais antigos</button>
      </div>
    </div>
  );
};

export default Audit;
