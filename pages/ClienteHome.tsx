
import React, { useState, useEffect } from 'react';
import { 
  Search, Star, MapPin, ChevronRight, Clock, ShieldCheck, 
  Zap, Heart, Scissors, Sparkles, Wind, User, Flower2, Dog, 
  ArrowRight, Flame, AlertCircle
} from 'lucide-react';
import { appointmentsService, companiesService, flashOffersService, ordersService, teamMembersService } from '../services/api';
import { storage } from '../utils/storage';

interface ClienteHomeProps {
  onSelectCompany?: (id: string) => void;
  onSelectCategory?: (category: string) => void;
  onSearchSubmit?: (term: string) => void;
  onOpenAppointment?: (appointmentId: string) => void;
  userName?: string;
}

const categories = [
  { id: 1, name: 'Cabelo', icon: Scissors, color: 'bg-rose-50' },
  { id: 2, name: 'Unhas', icon: Sparkles, color: 'bg-blue-50' },
  { id: 3, name: 'Limpeza', icon: Wind, color: 'bg-emerald-50' },
  { id: 4, name: 'Barba', icon: User, color: 'bg-amber-50' },
  { id: 5, name: 'Massagem', icon: Flower2, color: 'bg-purple-50' },
  { id: 6, name: 'Pet', icon: Dog, color: 'bg-orange-50' },
];

const ClienteHome: React.FC<ClienteHomeProps> = ({ onSelectCompany, onSelectCategory, onSearchSubmit, onOpenAppointment, userName = 'Gabriel' }) => {
  const [countdown, setCountdown] = useState('00:00:00');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFavoriteProfessionals, setHasFavoriteProfessionals] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!nextAppointment?.scheduled_at) {
      setCountdown('00:00:00');
      return undefined;
    }

    const compute = () => {
      const target = new Date(nextAppointment.scheduled_at).getTime();
      const diffSec = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      if (days > 0) {
        setCountdown(`${days}d ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    compute();
    const timer = setInterval(compute, 1000);
    return () => clearInterval(timer);
  }, [nextAppointment]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = storage.get<{ id?: string | number } | null>('session', null);
      const customerId = Number(session?.id);

      const [companiesResult, offersResult, professionalsResult, appointmentsResult, ordersResult] = await Promise.allSettled([
        companiesService.getAll(),
        flashOffersService.getAll(),
        teamMembersService.getAll(),
        Number.isFinite(customerId) && customerId > 0
          ? appointmentsService.getByCustomer(customerId)
          : Promise.resolve({ data: { appointments: [] } } as any),
        Number.isFinite(customerId) && customerId > 0
          ? ordersService.getByCustomer(customerId)
          : Promise.resolve({ data: { orders: [] } } as any)
      ]);

      if (companiesResult.status === 'fulfilled') {
        const payload = companiesResult.value.data;
        const companiesData =
          payload?.companies ||
          (Array.isArray(payload?.data) ? payload.data : null) ||
          (Array.isArray(payload) ? payload : []);

        const activeCompanies = companiesData.filter((company: any) => company.status === 'active');
        setCompanies(activeCompanies);
      } else {
        console.error('Erro ao carregar empresas:', companiesResult.reason);
      }

      if (offersResult.status === 'fulfilled') {
        const payload = offersResult.value.data;
        const offersData =
          payload?.offers ||
          (Array.isArray(payload?.data) ? payload.data : null) ||
          (Array.isArray(payload) ? payload : []);
        setOffers(offersData);
      } else {
        console.error('Erro ao carregar ofertas:', offersResult.reason);
      }

      if (professionalsResult.status === 'fulfilled') {
        const payload = professionalsResult.value.data;
        const professionalsData =
          payload?.teamMembers ||
          (Array.isArray(payload?.data) ? payload.data : null) ||
          (Array.isArray(payload) ? payload : []);
        setProfessionals(professionalsData.slice(0, 5));
      } else {
        console.error('Erro ao carregar profissionais:', professionalsResult.reason);
      }

      if (appointmentsResult.status === 'fulfilled') {
        const payload = appointmentsResult.value.data;
        const appointmentsData =
          payload?.appointments ||
          (Array.isArray(payload?.data) ? payload.data : null) ||
          (Array.isArray(payload) ? payload : []);

        const now = Date.now();
        const fromAppointments = appointmentsData
          .filter((appointment: any) => ['pending', 'scheduled'].includes(String(appointment.status || '')))
          .map((appointment: any) => {
            const scheduledAt = appointment.scheduled_at
              ? new Date(appointment.scheduled_at).getTime()
              : NaN;
            return {
              ...appointment,
              __scheduledAtTs: scheduledAt
            };
          })
          .filter((appointment: any) => Number.isFinite(appointment.__scheduledAtTs) && appointment.__scheduledAtTs > (now - 5 * 60 * 1000));

        let fromOrders: any[] = [];
        if (ordersResult.status === 'fulfilled') {
          const ordersPayload = ordersResult.value.data;
          const ordersData =
            ordersPayload?.orders ||
            (Array.isArray(ordersPayload?.data) ? ordersPayload.data : null) ||
            (Array.isArray(ordersPayload) ? ordersPayload : []);
          fromOrders = (ordersData || [])
            .filter((order: any) => ['pending', 'confirmed', 'in_progress'].includes(String(order.status || '')))
            .map((order: any) => {
              const scheduledAt = order.appointment_scheduled_at
                ? new Date(order.appointment_scheduled_at).getTime()
                : NaN;
              return {
                id: order.appointment_id || `order_${order.id}`,
                company_name: order.company_name,
                time: order.appointment_time,
                scheduled_at: order.appointment_scheduled_at,
                status: order.status,
                __scheduledAtTs: scheduledAt
              };
            })
            .filter((item: any) => Number.isFinite(item.__scheduledAtTs) && item.__scheduledAtTs > (now - 5 * 60 * 1000));
        }

        const upcoming = [...fromAppointments, ...fromOrders]
          .sort((a: any, b: any) => a.__scheduledAtTs - b.__scheduledAtTs);

        setNextAppointment(upcoming[0] || null);
      } else {
        console.error('Erro ao carregar próximo agendamento:', appointmentsResult.reason);
        setNextAppointment(null);
      }

      const favoriteProfessionals =
        storage.get<any[]>('favorite_professionals', []) ||
        storage.get<any[]>('favorites_professionals', []) ||
        [];
      setHasFavoriteProfessionals(Array.isArray(favoriteProfessionals) && favoriteProfessionals.length > 0);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      onSearchSubmit?.(searchTerm);
    }
  };

  return (
    <div className="space-y-10 pb-24 md:pb-10 animate-in fade-in duration-1000">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">OlÃ¡, {userName}</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-1.5">Sexta-feira, 20 de Fevereiro</p>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-[#E11D48] blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#E11D48] relative z-10 border border-gray-100 shadow-sm transition-transform active:scale-95 cursor-pointer">
               <Heart size={20} fill="currentColor" />
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-[#E11D48] blur-3xl opacity-5 group-focus-within:opacity-10 rounded-2xl transition-opacity"></div>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E11D48] transition-colors" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="O que vocÃª precisa hoje?"
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E11D48] transition-all text-gray-800 font-semibold text-base relative z-10"
          />
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-black text-lg text-gray-900 tracking-tight">Categorias</h3>
          <button className="text-[#E11D48] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Ver todas</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button 
                key={cat.id} 
                onClick={() => onSelectCategory?.(cat.name)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-[#E11D48]/30 ${cat.color}`}>
                  <IconComponent 
                    size={28} 
                    className="text-[#E11D48] transition-transform duration-500 group-hover:scale-110" 
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-[#E11D48] transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Flash Offers */}
      {(loading || offers.length > 0) && (
      <section className="animate-in slide-in-from-right-8 duration-700">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg text-gray-900 tracking-tight">Ofertas Relâmpago</h3>
            <Flame size={20} className="text-orange-500 animate-pulse" />
          </div>
          <button className="text-[#E11D48] text-[10px] font-black uppercase tracking-widest">Aproveitar</button>
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 h-40 bg-slate-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            {offers.map((offer) => (
              <div key={offer.id} className="flex-shrink-0 w-72 bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-slate-200">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/30 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000"></div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 bg-pink-600/20 px-2.5 py-1 rounded-full border border-pink-500/30">
                      <Clock size={10} className="text-pink-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Ativa</span>
                    </div>
                    <Zap size={18} className="text-[#E11D48] fill-current" />
                 </div>
                 <h4 className="text-xl font-black tracking-tighter mb-1">{offer.name}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Desconto especial</p>
                 <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 line-through font-bold">R$ {offer.old_price?.toFixed(2)}</span>
                      <div className="text-2xl font-black text-white tracking-tighter">R$ {offer.new_price?.toFixed(2)}</div>
                    </div>
                    <button className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-[#E11D48] hover:text-white transition-all shadow-xl hover:rotate-12 active:scale-90">
                      <ArrowRight size={20} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
      )}

      {/* Next Appointment */}
      {nextAppointment && (
      <button
        type="button"
        onClick={() => onOpenAppointment?.(String(nextAppointment.id))}
        className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 group transition-all hover:border-[#E11D48]/10 w-full text-left"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E11D48]/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <h3 className="font-black text-lg text-gray-900 tracking-tight">PrÃ³ximo Agendamento</h3>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
            <ShieldCheck size={12} strokeWidth={3} /> Pago
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="bg-[#E11D48] text-white px-6 py-4 rounded-2xl text-center shadow-xl shadow-rose-200 relative hover:scale-105 transition-transform cursor-default">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1.5">Inicia em</p>
            <p className="text-3xl font-black tracking-tighter">{countdown}</p>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-black text-gray-900 text-xl tracking-tight mb-1">{nextAppointment.company_name || nextAppointment.companyName || 'Empresa'}</h4>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
               <Zap size={12} className="text-[#E11D48] fill-current" />
               <span className="text-[10px] font-bold uppercase tracking-widest">
                {nextAppointment.services?.length
                  ? nextAppointment.services.map((service: any) => service.name).join(', ')
                  : (nextAppointment.serviceName || 'Servico agendado')}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-center">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Chegada</p>
              <p className="text-lg font-black text-gray-900">
                {nextAppointment.time || new Date(nextAppointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border-4 border-white shadow-lg overflow-hidden ring-2 ring-gray-50/50">
               <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100&h=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="Empresa" />
            </div>
          </div>
        </div>
      </button>
      )}

      {/* Favorite Professionals */}
      {hasFavoriteProfessionals && (
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-black text-lg text-gray-900 tracking-tight">Especialistas DisponÃ­veis</h3>
          <button className="text-[#E11D48] text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</button>
        </div>
        {loading ? (
          <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
            {professionals.map((prof) => (
              <button key={prof.id} className="flex-shrink-0 flex flex-col items-center gap-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E11D48] rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <img src={prof.avatar || `https://i.pravatar.cc/150?u=${prof.name}`} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#E11D48] transition-all duration-300 relative z-10" alt={prof.name} />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50 z-20">
                    <Heart size={12} className="text-[#E11D48] fill-current" />
                  </div>
                </div>
                <div className="text-center relative z-10">
                  <span className="block text-sm font-black text-gray-800 leading-none mb-1.5 group-hover:text-[#E11D48] transition-colors">{prof.name}</span>
                  <span className="bg-gray-100 text-gray-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md group-hover:bg-[#E11D48]/10 transition-colors">{prof.role || 'Profissional'}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Nenhum profissional disponÃ­vel</p>
        )}
      </section>
      )}

      {/* Featured Companies */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-xl text-gray-900 tracking-tight">Empresas em Destaque</h3>
          </div>
          <button className="flex items-center gap-2 text-[#E11D48] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
            <MapPin size={14} /> Ver no Mapa
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              const isOpen = Boolean(company.is_open);
              return (
              <div 
                key={company.id} 
                onClick={() => onSelectCompany?.(company.id.toString())}
                className={`bg-white p-5 rounded-3xl shadow-sm border transition-all duration-500 cursor-pointer group relative overflow-hidden ${
                  isOpen ? 'border-gray-100 hover:shadow-xl hover:border-rose-100/50 hover:-translate-y-1' : 'border-gray-200 opacity-80'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex gap-4 items-center relative z-10">
                  <div className="relative">
                    <img src={company.logo || `https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&h=200&auto=format&fit=crop`} className={`w-16 h-16 rounded-2xl object-cover shadow-lg transition-transform duration-500 ${isOpen ? 'group-hover:scale-110' : 'grayscale'}`} alt={company.name} />
                    <div className="absolute -top-2 -right-2 bg-white px-2 py-1 rounded-xl shadow-lg border border-gray-50 flex items-center gap-1">
                      <Star size={10} className="text-amber-500 fill-current" />
                      <span className="text-[10px] font-black text-gray-800">{company.rating || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-black text-lg tracking-tight transition-colors mb-1 ${isOpen ? 'text-gray-900 group-hover:text-[#E11D48]' : 'text-gray-500'}`}>{company.name}</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-400 text-[9px] font-black uppercase tracking-widest">
                        <MapPin size={10} /> {company.address_city || company.city || 'RondÃ´nia'}
                      </div>
                      <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isOpen ? 'text-[#E11D48]' : 'text-gray-400'}`}>
                        <Clock size={10} /> {isOpen ? 'Aberto' : 'Fechado'}
                      </div>
                    </div>
                  </div>
                  
                  <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner ${isOpen ? 'bg-gray-50 text-gray-300 group-hover:bg-[#E11D48] group-hover:text-white group-hover:rotate-12' : 'bg-gray-100 text-gray-300'}`}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Nenhuma empresa disponÃ­vel no momento</p>
        )}
      </section>
    </div>
  );
};

export default ClienteHome;





