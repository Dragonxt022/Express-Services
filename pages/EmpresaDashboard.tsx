
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, ChevronRight, Sparkles, 
  Zap, Wallet, Users, Scissors, Plus, ShieldAlert,
  ArrowUpRight, TrendingUp, CreditCard, Package, AlertTriangle
} from 'lucide-react';
import { COLORS } from '../constants';
import { geminiService } from '../services/gemini';
import { storage } from '../utils/storage';
import { Appointment, InventoryItem } from '../types';

const EmpresaDashboard: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [insight, setInsight] = useState("Analisando seu desempenho financeiro...");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<'unlinked' | 'linked'>('unlinked');

  useEffect(() => {
    const savedApts = storage.get<Appointment[]>('appointments', []);
    const savedStatus = storage.get<'unlinked' | 'linked'>('gateway_status', 'unlinked');
    const savedInventory = storage.get<InventoryItem[]>('inventory', [
      { id: '1', name: 'Shampoo Master 1L', category: 'uso_profissional', stock: 2, minStock: 3 },
      { id: '2', name: 'Gel Fixador Strong', category: 'revenda', stock: 15, minStock: 5 },
    ]);
    
    setAppointments(savedApts);
    setGatewayStatus(savedStatus);
    setInventory(savedInventory);

    const fetchInsight = async () => {
      const stats = {
        revenue: savedApts.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.price : 0), 0),
        orders: savedApts.length,
        rating: 4.8
      };
      const res = await geminiService.analyzeBusinessInsights(stats);
      setInsight(res || "Seu ticket médio está 15% acima da média da região. Ótimo trabalho!");
    };
    fetchInsight();
  }, []);

  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  const completedToday = appointments.filter(a => a.status === 'completed').length;
  const pendingToday = appointments.filter(a => a.status === 'pending' || a.status === 'scheduled').length;
  const grossToday = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);
  
  const netToday = grossToday * 0.465;

  const QuickAction = ({ icon: Icon, label, path, color }: any) => (
    <button 
      onClick={() => onNavigate?.(path)}
      className="flex flex-col items-center gap-3 p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-black text-gray-800 uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
          <p className="text-gray-500 font-medium">Studio Elegance • Gestão em tempo real</p>
        </div>
        
        <div className="flex gap-3">
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-2">
              <AlertTriangle size={18} />
              <span className="text-[10px] font-black uppercase">{lowStockItems.length} Itens com baixo estoque</span>
            </div>
          )}
          {gatewayStatus === 'linked' && (
            <div className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-600 rounded-2xl border border-green-100">
              <Zap size={20} className="fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">Gateway Conectado</span>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Agendados Hoje</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{pendingToday}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
            <Calendar size={14} /> Ver Agenda
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Líquido Estimado</p>
            <h3 className="text-4xl font-black text-pink-600 tracking-tighter">R$ {netToday.toFixed(2)}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
            <TrendingUp size={14} /> +12% vs ontem
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-indigo-100 transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Itens em Estoque</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{inventory.length}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
            <Package size={14} /> Gerenciar
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl flex flex-col items-center justify-center text-center group cursor-pointer active:scale-95 transition-all">
           <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-lg mb-2 group-hover:rotate-12 transition-transform">
             <Plus size={24} />
           </div>
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Novo Agendamento</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Próximos da Fila</h3>
            <button onClick={() => onNavigate?.('schedule')} className="text-[10px] font-black text-pink-600 uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {appointments.filter(a => a.status === 'scheduled').slice(0, 4).map((apt, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Hoje</span>
                    <span className="text-lg font-black text-gray-900 leading-none">{apt.time}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg leading-none mb-1">{apt.clientName}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{apt.serviceName}</p>
                  </div>
                </div>
                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory & AI */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Insumos em Alerta</h3>
              <Package size={20} className="text-gray-300" />
            </div>
            <div className="space-y-4">
               {lowStockItems.map(item => (
                 <div key={item.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div>
                      <p className="text-xs font-black text-amber-800 leading-none">{item.name}</p>
                      <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">Restam {item.stock} unidades</p>
                    </div>
                    <button className="p-2 bg-white text-amber-600 rounded-xl shadow-sm"><Plus size={16} /></button>
                 </div>
               ))}
               {lowStockItems.length === 0 && (
                 <p className="text-center text-xs text-gray-400 font-bold italic py-4">Estoque em dia!</p>
               )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 blur-2xl rounded-full"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                 <Sparkles size={16} className="text-pink-500" />
                 <span className="text-[9px] font-black uppercase text-pink-400">Insight Estratégico</span>
               </div>
               <p className="text-sm font-bold leading-relaxed italic">"{insight}"</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaDashboard;
