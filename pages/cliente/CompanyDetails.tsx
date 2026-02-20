
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, 
  Share2, Heart, ShieldCheck, ChevronRight, 
  Scissors, Sparkles, User, Info, Plus, Minus, ShoppingBag, AlertCircle, Loader
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { companiesService, servicesService } from '../../services/api';
import { Service } from '../../types';

interface CompanyDetailsProps {
  companyId: string;
  onBack: () => void;
  cartServices: Service[];
  onUpdateCart: (services: Service[]) => void;
  onProceedToBooking: () => void;
}

interface CompanyData {
  id: number;
  name: string;
  logo: string;
  rating: number;
  cnpj: string;
  address: string;
  phone: string;
  city: string;
}

interface ServiceData {
  id: number;
  name: string;
  price: number;
  duration: string;
  description: string;
  category?: string;
  image?: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ 
  companyId, 
  onBack, 
  cartServices, 
  onUpdateCart, 
  onProceedToBooking 
}) => {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [isFavorite, setIsFavorite] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados da empresa
      const companyRes = await companiesService.getById(parseInt(companyId));
      setCompany(companyRes.data);

      // Carregar serviços da empresa
      const servicesRes = await servicesService.getByCompany(parseInt(companyId));
      setServices(servicesRes.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar informações da empresa');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceInCart = (service: any) => {
    const isSelected = cartServices.find(s => s.id === service.id);
    if (isSelected) {
      onUpdateCart(cartServices.filter(s => s.id !== service.id));
    } else {
      onUpdateCart([...cartServices, { ...service, companyId }]);
    }
  };

  const cartTotal = cartServices.reduce((acc, s) => acc + s.price, 0);

  const handleShare = async () => {
    const shareData = {
      title: `${company?.name} - Beleza Express`,
      text: `Confira os serviços de ${company?.name} no Beleza Express! Agende agora seu horário.`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showFeedback('success', 'Link do perfil copiado para o seu celular!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showFeedback('error', 'Não foi possível compartilhar no momento.');
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader size={40} className="animate-spin text-[#E11D48] mb-4" />
          <p className="text-gray-400 font-semibold">Carregando informações...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && company && (
        <>
          <div className="h-64 sm:h-80 w-full relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200" 
              className="w-full h-full object-cover" 
              alt="Cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          </div>

          <button 
            onClick={onBack}
            className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all border border-white/20 shadow-lg z-20"
          >
            <ArrowLeft size={24} />
          </button>

        <div className="absolute top-6 right-6 flex gap-3 z-20">
          <button 
            onClick={handleShare}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-white/40 transition-all active:scale-95"
          >
            <Share2 size={22} />
          </button>
          
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-lg active:scale-95 ${
              isFavorite ? 'bg-[#E11D48] text-white border-transparent' : 'bg-white/20 backdrop-blur-md text-white border-white/20'
            }`}
          >
            <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} /> Aberto Agora
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  {company?.city} - SP
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-none">{company?.name}</h1>
              <div className="flex items-center gap-4 mt-3 opacity-90">
                <div className="flex items-center gap-1 font-black text-sm">
                  <Star size={16} className="text-amber-400 fill-current" /> {company?.rating || '4.5'}
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="text-sm font-bold">{services.length} serviços</div>
              </div>
            </div>
            <img 
              src={company?.logo || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200'} 
              className="w-24 h-24 rounded-[2rem] border-4 border-white/20 shadow-2xl object-cover hidden sm:block" 
              alt="Logo" 
            />
          </div>
        </div>
        </>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'services', label: 'Serviços' },
          { id: 'reviews', label: 'Avaliações' },
          { id: 'about', label: 'Sobre' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-[#E11D48]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E11D48] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-lg text-gray-900 tracking-tight">Menu de Serviços</h3>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={16} /> <span className="text-[10px] font-black uppercase">Confira abaixo</span>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = cartServices.find(s => s.id === service.id);
                  return (
                    <div key={service.id} className={`bg-white p-4 rounded-3xl border transition-all flex items-center justify-between group hover:shadow-lg ${isSelected ? 'border-[#E11D48] shadow-md' : 'border-gray-100 shadow-sm'}`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0 ${isSelected ? 'bg-rose-100 text-[#E11D48]' : 'bg-rose-50 text-[#E11D48]'}`}>
                          <Sparkles size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 leading-tight mb-0.5 text-sm truncate">{service.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{service.duration}</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                            <span className="text-[9px] font-bold text-[#E11D48] uppercase">R$ {service.price?.toFixed(2) || '0'}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleServiceInCart(service)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0 ${isSelected ? 'bg-[#E11D48] text-white' : 'bg-slate-900 text-white hover:bg-[#E11D48]'}`}
                      >
                        {isSelected ? <Minus size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhum serviço disponível</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">4.8</p>
                <div className="flex text-amber-400 mt-1">
                  {[1,2,3,4].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  <Star size={14} className="opacity-30" fill="currentColor" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Média de 128 notas</p>
              </div>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Avaliar Agora</button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-center py-8">Avaliações serão exibidas em breve</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Descrição</h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Referência em cuidados masculinos na região, combinamos tradição e modernidade para oferecer a melhor experiência em barbearia e estética. Nosso ambiente é climatizado e contamos com Wi-Fi e café de cortesia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Endereço</p>
                    <p className="text-sm font-bold text-gray-800">Rua das Flores, 123 - Centro</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-sm font-bold text-gray-800">(11) 98888-7777</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all">
                <Share2 size={16} /> Compartilhar Local
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary Floating */}
      {cartServices.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 border border-white/10">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-0.5">{cartServices.length} {cartServices.length === 1 ? 'Serviço' : 'Serviços'}</p>
                <p className="text-lg font-black text-white leading-none">R$ {cartTotal.toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={onProceedToBooking}
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
            >
              Agendar <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;
