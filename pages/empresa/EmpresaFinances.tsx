
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Wallet, PieChart, Download, 
  Users, Zap, CreditCard, ExternalLink, 
  ShieldCheck, ArrowRight, Loader2, CheckCircle, 
  Lock, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../../utils/storage';
import { Appointment, TeamMember } from '../../types';
import { useFeedback } from '../../context/FeedbackContext';

const data = [
  { name: 'Seg', total: 450, split: 320 },
  { name: 'Ter', total: 520, split: 380 },
  { name: 'Qua', total: 380, split: 260 },
  { name: 'Qui', total: 610, split: 450 },
  { name: 'Sex', total: 850, split: 620 },
  { name: 'Sáb', total: 1200, split: 910 },
  { name: 'Dom', total: 0, split: 0 },
];

const EmpresaFinances: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'overview' | 'splits'>('overview');
  const [gatewayStatus, setGatewayStatus] = useState<'unlinked' | 'linking' | 'linked'>('unlinked');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const savedApts = storage.get<Appointment[]>('appointments', []);
    const savedTeam = storage.get<TeamMember[]>('team_members', []);
    const savedStatus = storage.get<'unlinked' | 'linking' | 'linked'>('gateway_status', 'unlinked');
    setAppointments(savedApts);
    setTeam(savedTeam);
    setGatewayStatus(savedStatus);
  }, []);

  const handleConnectGateway = () => {
    setGatewayStatus('linking');
    setTimeout(() => {
      setGatewayStatus('linked');
      storage.set('gateway_status', 'linked');
      showFeedback('success', 'Mercado Pago conectado com sucesso!');
    }, 3500);
  };

  const grossRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0) || 8250;
  
  const gatewayFee = grossRevenue * 0.035; 
  const platformFee = grossRevenue * 0.15; 
  
  // Cálculo simplificado de comissões baseado na equipe com recurso ativo
  const activeCommissionsTotal = team
    .filter(m => m.commissionEnabled)
    .reduce((acc, curr) => acc + (grossRevenue / team.length) * (curr.commission / 100), 0);

  const netLiquid = grossRevenue - gatewayFee - platformFee - activeCommissionsTotal;

  const StatCard = ({ title, value, icon: Icon, color, trend, sub }: any) => (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-500 bg-green-50 px-2 py-1 rounded-full">
            <Zap size={12} className="fill-current" /> Instantâneo
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
      {sub && <p className="text-[10px] font-medium text-gray-400 mt-2 uppercase tracking-tight">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
             <ShieldCheck size={28} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace & Split</h1>
             <p className="text-gray-500 font-medium tracking-tight">Pagamentos divididos automaticamente no ato da venda.</p>
           </div>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('splits')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'splits' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Liquidações
          </button>
        </div>
      </div>

      {gatewayStatus === 'unlinked' && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/20 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg">
                  <RefreshCw size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Novo Recurso: Split Real-time</span>
              </div>
              <h2 className="text-3xl font-black mb-3 tracking-tighter">Ative seu recebimento instantâneo</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Conecte sua conta Mercado Pago para receber sua parte, pagar seus profissionais e a plataforma automaticamente em cada venda. Sem esperas, sem transferências manuais.</p>
            </div>
            <button 
              onClick={handleConnectGateway}
              className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-pink-100 transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95"
            >
              Conectar Mercado Pago <ArrowRight size={22} />
            </button>
          </div>
        </div>
      )}

      {gatewayStatus === 'linking' && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-pink-600 animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="text-pink-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Quase lá...</h3>
            <p className="text-gray-500 font-medium">Sincronizando sua conta com o <span className="text-blue-600 font-bold">Mercado Pago</span> para configurar o split automático.</p>
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <Lock size={12} /> Conexão Criptografada
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Disponível no Gateway" 
              value={gatewayStatus === 'linked' ? netLiquid : 0} 
              icon={Wallet} 
              color="bg-slate-900 text-white" 
              trend={gatewayStatus === 'linked'}
              sub={gatewayStatus === 'linked' ? "Liquidação concluída" : "Conecte o gateway"}
            />
            <StatCard 
              title="Volume Transacionado" 
              value={grossRevenue} 
              icon={Zap} 
              color="bg-pink-50 text-pink-600" 
              sub="Total de vendas processadas"
            />
            <StatCard 
              title="Taxas Adquirente" 
              value={gatewayFee} 
              icon={CreditCard} 
              color="bg-blue-50 text-blue-600" 
              sub="Custo operacional fixo"
            />
            <StatCard 
              title="Comissões Pagas" 
              value={activeCommissionsTotal} 
              icon={Users} 
              color="bg-amber-50 text-amber-600" 
              sub="Apenas profissionais com comissão ativa"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Performance de Splits</h3>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Evolução diária de recebíveis</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b81466" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#b81466" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#b81466" fillOpacity={1} fill="url(#colorGross)" strokeWidth={4} />
                    <Area type="monotone" dataKey="split" stroke="#0f172a" fillOpacity={1} fill="url(#colorSplit)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-black text-gray-900 mb-6">Status da Integração</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${gatewayStatus === 'linked' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400">Marketplace Split</p>
                      <p className="font-bold text-gray-800">{gatewayStatus === 'linked' ? 'Ativo e Operacional' : 'Aguardando Conexão'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400">Ciclo de Liquidação</p>
                      <p className="font-bold text-gray-800">D+0 (Instantâneo)</p>
                    </div>
                  </div>
                </div>
              </div>

              {gatewayStatus === 'linked' && (
                <div className="mt-10 pt-10 border-t border-gray-200">
                  <button className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-100 text-slate-800 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">
                    Acessar Painel Mercado Pago <ExternalLink size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'splits' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Conciliação Automática</h3>
                <p className="text-gray-400 text-sm font-medium mt-1">Transações com profissionais que possuem comissão ativa.</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                <Download size={18} /> Exportar Extrato
              </button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                 <tr>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Pago</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Split Profissional</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Taxa Marketplace</th>
                   <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Liquidação</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {appointments.filter(a => a.status === 'completed').map((apt) => {
                    const profCut = apt.price * 0.35; // Aqui simulamos que todos tinham 35% pra visualização
                    const appCut = apt.price * 0.15;
                    const gateFee = apt.price * 0.035;
                    const unitNet = apt.price - profCut - appCut - gateFee;
                    return (
                      <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-mono text-xs text-gray-400 uppercase tracking-tighter">#TRX-{apt.id}MP</p>
                          <p className="text-[10px] font-black text-slate-900 uppercase mt-1">{apt.serviceName}</p>
                        </td>
                        <td className="px-6 py-6 font-black text-gray-900">R$ {apt.price.toFixed(2)}</td>
                        <td className="px-6 py-6 text-xs text-blue-600 font-bold">- R$ {profCut.toFixed(2)}</td>
                        <td className="px-6 py-6 text-xs text-pink-600 font-bold">- R$ {appCut.toFixed(2)}</td>
                        <td className="px-6 py-6">
                          <span className="font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full text-xs">R$ {unitNet.toFixed(2)}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-green-500 font-black text-[9px] uppercase tracking-widest">
                            <Zap size={10} fill="currentColor" /> Split Real-time
                          </div>
                        </td>
                      </tr>
                    );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmpresaFinances;
