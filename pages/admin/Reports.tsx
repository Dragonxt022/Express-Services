import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, DollarSign, Users, 
  Briefcase, Sparkles, Filter, ArrowUpRight, ArrowDownRight,
  Target, Zap, PieChart, Activity, Building2
} from 'lucide-react';
import { COLORS } from '../../constants';
import { geminiService } from '../../services/gemini';

const mainData = [
  { name: 'Jan', gmv: 45000, revenue: 6750, profit: 5200 },
  { name: 'Fev', gmv: 52000, revenue: 7800, profit: 6100 },
  { name: 'Mar', gmv: 48000, revenue: 7200, profit: 5500 },
  { name: 'Abr', gmv: 61000, revenue: 9150, profit: 7400 },
  { name: 'Mai', gmv: 75000, revenue: 11250, profit: 9200 },
  { name: 'Jun', gmv: 89000, revenue: 13350, profit: 11100 },
];

const categoryData = [
  { name: 'Cabelo', value: 45000, color: '#b81466' },
  { name: 'Unhas', value: 28000, color: '#3b82f6' },
  { name: 'Estética', value: 15000, color: '#10b981' },
  { name: 'Barba', value: 12000, color: '#f59e0b' },
];

const Reports: React.FC = () => {
  const [insight, setInsight] = useState("Aguardando análise preditiva...");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateAIReport();
  }, []);

  const generateAIReport = async () => {
    setIsGenerating(true);
    const stats = {
      gmvTotal: 345000,
      revenueTotal: 51750,
      topCategory: "Cabelo",
      growthRate: "18% MoM"
    };
    const res = await geminiService.analyzeBusinessInsights(stats);
    setInsight(res || "Forte tendência de crescimento em serviços de Estética. Recomenda-se aumentar o split promocional para essa categoria.");
    setIsGenerating(false);
  };

  const MetricCard = ({ label, value, trend, trendValue, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${colorClass.split(' ')[0]}`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${colorClass} shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Analítico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Marketplace BI</h1>
          <p className="text-gray-500 font-medium">Análise de volume de transações, splits e saúde da rede.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Visão Geral</button>
            <button className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Por Unidade</button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
            <Download size={18} /> Exportar Report
          </button>
        </div>
      </div>

      {/* Grid de Métricas Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Volume (GMV)" 
          value="R$ 345.000" 
          trend="up" 
          trendValue="+12%" 
          icon={Activity} 
          colorClass="bg-pink-600 text-white" 
        />
        <MetricCard 
          label="Net Revenue (Split)" 
          value="R$ 51.750" 
          trend="up" 
          trendValue="+18%" 
          icon={DollarSign} 
          colorClass="bg-slate-900 text-white" 
        />
        <MetricCard 
          label="Ticket Médio" 
          value="R$ 84,20" 
          trend="down" 
          trendValue="-2%" 
          icon={Target} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <MetricCard 
          label="Parceiros Ativos" 
          value="45 Unidades" 
          trend="up" 
          trendValue="+3" 
          icon={Building2} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
      </div>

      {/* AI Strategist Panel */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-600/10 blur-[120px] rounded-full -mr-40 -mt-40"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner group">
              <Sparkles size={40} className={`text-pink-500 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Estrategista IA</span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Análise de Tendência & Forecast</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white italic">
                "{insight}"
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                   <span className="text-[10px] font-black uppercase text-white/50">Crescimento Projetado: +15%</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <span className="text-[10px] font-black uppercase text-white/50">Confiança da IA: 94%</span>
                 </div>
              </div>
            </div>
            <button 
              onClick={generateAIReport}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
            >
              Recalcular Insight
            </button>
          </div>
        </div>
      </div>

      {/* Gráficos de Alta Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Principal Composto */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Performance Financeira</h3>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Comparativo de Volume vs Receita Líquida</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-pink-600/10 border border-pink-600"></div>
                 <span className="text-[10px] font-black text-gray-400 uppercase">GMV</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                 <span className="text-[10px] font-black text-gray-400 uppercase">Net Revenue</span>
               </div>
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mainData}>
                <defs>
                  <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="gmv" fill="url(#colorGMV)" stroke={COLORS.primary} strokeWidth={4} />
                <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a', strokeWidth: 3, stroke: '#fff' }} />
                <Bar dataKey="profit" barSize={20} fill="#e2e8f0" radius={[10, 10, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Categoria */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Nichos</h3>
            <PieChart className="text-gray-300" size={24} />
          </div>
          <div className="flex-1 space-y-8">
            {categoryData.map((cat, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{cat.name}</span>
                  <span className="text-xs font-black text-gray-900">R$ {cat.value.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 delay-300" 
                    style={{ 
                      width: `${(cat.value / 45000) * 100}%`,
                      backgroundColor: cat.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-10 border-t border-gray-50">
             <div className="bg-slate-50 p-6 rounded-[2rem]">
               <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={16} className="text-green-500" />
                 <span className="text-[10px] font-black uppercase text-gray-400">Destaque do Mês</span>
               </div>
               <p className="text-sm font-black text-gray-800">Cabelo mantém liderança com 42% do volume total.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Unidades e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">Unidades em Expansão</h3>
            <button className="text-[10px] font-black text-pink-600 uppercase tracking-widest hover:underline">Ver ranking completo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">GMV Total</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Crescimento</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Barbearia do Zé', value: 'R$ 52.400', grow: '+15.2%', status: 'Saudável' },
                  { name: 'Studio Bella', value: 'R$ 48.900', grow: '+8.4%', status: 'Atenção' },
                  { name: 'Nails & Co', value: 'R$ 31.200', grow: '+22.1%', status: 'Saudável' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-6 font-black text-gray-900">{row.name}</td>
                    <td className="px-6 py-6 font-bold text-gray-700">{row.value}</td>
                    <td className="px-6 py-6">
                       <span className="text-green-500 font-black text-xs">{row.grow}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         row.status === 'Saudável' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                       }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-pink-600 rounded-[3rem] p-10 text-white shadow-xl shadow-pink-100 flex flex-col justify-between group">
           <div>
             <Zap size={32} className="mb-6 group-hover:animate-bounce" />
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Meta de Marketplace</h4>
             <h3 className="text-4xl font-black tracking-tighter mb-10">R$ 500k</h3>
             
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Progresso</span>
                  <span>69%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '69%' }}></div>
                </div>
             </div>
           </div>
           
           <div className="mt-12 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <p className="text-xs font-bold leading-tight">Faltam R$ 155.000 para atingir a meta global do trimestre.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;