
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Zap, CheckCircle2, Search, Filter, ShieldCheck, PieChart, Activity } from 'lucide-react';
import { storage } from '../../utils/storage';
import { Company } from '../../types';

const AdminFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const companies = storage.get<Company[]>('admin_companies', []);
    const mockTrans = companies.map(c => ({
      id: c.id,
      company: c.name,
      volume: Math.floor(Math.random() * 15000) + 2000,
      splitPercent: c.royaltyPercent,
      status: 'settled'
    }));
    setTransactions(mockTrans);
  }, []);

  const totalGMV = transactions.reduce((acc, curr) => acc + curr.volume, 0);
  const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.volume * (curr.splitPercent / 100)), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <Activity size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace Insights</h1>
            <p className="text-gray-500 font-medium">Monitoramento em tempo real do volume transacionado (GMV).</p>
          </div>
        </div>
        <div className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-green-100">
           <ShieldCheck size={24} />
           <div>
             <p className="text-[10px] font-black uppercase leading-none">Gateway Status</p>
             <p className="text-sm font-bold">100% Operacional</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Volume Total (GMV)</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">R$ {totalGMV.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-green-500 font-black text-xs uppercase">
            <Zap size={14} className="fill-current" /> +18.5% instantâneo
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Revenue (Split)</p>
          <h3 className="text-3xl font-black text-pink-600 tracking-tighter">R$ {totalRevenue.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-1 text-gray-400 font-bold text-xs">
            Ref. a Take Rate de 15%
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Splits Processados</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">1.240</h3>
          <div className="mt-4 flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-tight">
            Taxa de Erro: 0.02%
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Take Rate Médio</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">14.2%</h3>
          <div className="mt-4 flex items-center gap-1 text-gray-400 font-bold text-xs uppercase tracking-tight">
             Otimizado via Gateway
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <PieChart className="text-pink-600" size={24} />
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Liquidação de Parceiros</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar unidade..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 w-full sm:w-64" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">GMV (Volume)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Take Rate</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Comis.</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Split</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Gateway Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.filter(p => p.company.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                const commissionVal = p.volume * (p.splitPercent / 100);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 font-black text-gray-900">{p.company}</td>
                    <td className="px-6 py-6 font-bold text-gray-700">R$ {p.volume.toFixed(2)}</td>
                    <td className="px-6 py-6 text-center">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black">{p.splitPercent}%</span>
                    </td>
                    <td className="px-6 py-6 text-pink-600 font-black">R$ {commissionVal.toFixed(2)}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-tighter">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Liquidação Automática
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-[10px] text-gray-400">
                      GTY-34{p.id}99X-SPLIT
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinances;
