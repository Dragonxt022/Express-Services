
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Building2, CheckCircle, AlertCircle, Zap, TrendingUp, 
  ShieldCheck, PieChart, Activity, ArrowUpRight, 
  Sparkles, DollarSign, Globe
} from 'lucide-react';
import { COLORS } from '../constants';
import { storage } from '../utils/storage';
import { geminiService } from '../services/gemini';
import { Company, Appointment } from '../types';

const chartData = [
  { name: 'Sem 1', gmv: 42000, revenue: 6300 },
  { name: 'Sem 2', gmv: 58000, revenue: 8700 },
  { name: 'Sem 3', gmv: 45000, revenue: 6750 },
  { name: 'Sem 4', gmv: 72000, revenue: 10800 },
];

const AdminDashboard: React.FC = () => {
  const [insight, setInsight] = useState("Analisando tendências da rede...");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    totalGMV: 245000,
    platformRevenue: 36750,
    activeCompanies: 45,
    successRate: 99.8
  });

  useEffect(() => {
    const savedCompanies = storage.get<Company[]>('admin_companies', []);
    setCompanies(savedCompanies);

    const fetchInsight = async () => {
      const dataForAI = {
        totalVolume: stats.totalGMV,
        companiesCount: savedCompanies.length,
        topCategory: "Beleza/Cabelo",
        growth: "12% MoM"
      };
      const res = await geminiService.analyzeBusinessInsights(dataForAI);
      setInsight(res || "Foco em expansão de unidades na região sul pode aumentar o GMV em 15%.");
    };
    fetchInsight();
  }, []);

  const StatCard = ({ label, value, subValue, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase">
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
      {subValue && <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-tight">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Platform Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Master Dashboard</h1>
          <p className="text-gray-500 font-medium">Beleza Express Marketplace • Controle Global</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <div className="text-left">
                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Gateway Mercado Pago</p>
                <p className="text-xs font-bold text-gray-700">Splits Ativos (100%)</p>
             </div>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
             <Globe size={20} className="text-pink-500" />
             <div className="text-left">
                <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Região</p>
                <p className="text-xs font-bold">Brasil (LatAm)</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Strategy Insights */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl shrink-0">
             <Sparkles size={44} className="text-pink-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">IA Strategic Insight</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Análise de Rede em Tempo Real</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white/90 italic">
              "{insight}"
            </p>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Volume Total (GMV)" 
          value={`R$ ${stats.totalGMV.toLocaleString()}`} 
          subValue="Mês de Maio"
          icon={Activity} 
          color="bg-pink-600 text-white" 
          trend="12.5%"
        />
        <StatCard 
          label="Receita Plataforma" 
          value={`R$ ${stats.platformRevenue.toLocaleString()}`} 
          subValue="Take Rate Médio 15%"
          icon={DollarSign} 
          color="bg-slate-900 text-white" 
          trend="8.2%"
        />
        <StatCard 
          label="Unidades Ativas" 
          value={stats.activeCompanies} 
          subValue="+3 nos últimos 7 dias"
          icon={Building2} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          label="Sucesso de Split" 
          value={`${stats.successRate}%`} 
          subValue="Taxa do Gateway"
          icon={ShieldCheck} 
          color="bg-green-50 text-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Crescimento de Volume</h3>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Marketplace GMV vs Receita de Split</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                 <div className="w-2 h-2 rounded-full bg-pink-600"></div> GMV
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                 <div className="w-2 h-2 rounded-full bg-slate-900"></div> Revenue
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b81466" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#b81466" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="gmv" stroke="#b81466" fillOpacity={1} fill="url(#colorGMV)" strokeWidth={4} />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Audit Feed */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Audit Log</h3>
            <Zap size={20} className="text-pink-600" />
          </div>
          <div className="space-y-6">
            {[
              { label: 'Split Concluído', target: 'Barbearia do Zé', time: '2m ago', type: 'success' },
              { label: 'Nova Empresa', target: 'Studio Bella', time: '15m ago', type: 'info' },
              { label: 'Taxa Alterada', target: 'Nails & Co (12% -> 15%)', time: '1h ago', type: 'warning' },
              { label: 'Split Concluído', target: 'Studio Rose', time: '2h ago', type: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  log.type === 'success' ? 'bg-green-500' : 
                  log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-800 leading-none">{log.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{log.target}</p>
                </div>
                <span className="text-[9px] font-bold text-gray-300 uppercase">{log.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
            Ver Logs de Segurança
          </button>
        </div>
      </div>

      {/* Top Performing Units */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Unidades da Rede</h3>
          <PieChart className="text-pink-600" size={24} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">GMV Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Take Rate</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Comissão Plataforma</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.slice(0, 5).map((company, idx) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <img src={company.logo} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                       <p className="font-black text-gray-900">{company.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-bold text-gray-700">R$ {(Math.random() * 20000 + 5000).toFixed(2)}</td>
                  <td className="px-6 py-6">
                     <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[10px] font-black">{company.royaltyPercent}%</span>
                  </td>
                  <td className="px-6 py-6 font-black text-slate-900">R$ {(Math.random() * 3000 + 500).toFixed(2)}</td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-pink-600 transition-all">
                       <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
