import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Heart,
  Loader,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { companiesService, servicesService } from '../../services/api';
import { Service } from '../../types';

interface CompanyDetailsProps {
  companyId: string;
  onBack: () => void;
  cartServices: Service[];
  onUpdateCart: (services: Service[]) => void;
  onProceedToBooking: (company: { id: string; name: string; isOpen: boolean; status: string }) => void;
}

interface CompanyData {
  id: number;
  name: string;
  logo: string;
  rating: number;
  city: string;
  status: string;
  isOpen: boolean;
}

interface ServiceData {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  attendanceMode: 'presencial' | 'domicilio' | 'ambos';
  allowScheduling: boolean;
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

      const companyRes = await companiesService.getById(parseInt(companyId, 10));
      const companyData = companyRes.data?.company || companyRes.data;
      if (companyData) {
        setCompany({
          id: companyData.id,
          name: companyData.name,
          logo: companyData.logo || '',
          rating: Number(companyData.rating || 0),
          city: companyData.address_city || '',
          status: String(companyData.status || 'inactive'),
          isOpen: Boolean(companyData.is_open)
        });
      }

      const servicesRes = await servicesService.getByCompany(parseInt(companyId, 10));
      const servicesData = servicesRes.data?.services || servicesRes.data || [];
      setServices(
        servicesData.map((service: any) => ({
          id: Number(service.id),
          name: service.name || '',
          price: Number(service.price || 0),
          duration: Number(service.duration || 0),
          description: service.description || '',
          attendanceMode: service.attendance_mode || 'ambos',
          allowScheduling: service.allow_scheduling !== false
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar dados da empresa:', err);
      setError('Erro ao carregar informacoes da empresa.');
    } finally {
      setLoading(false);
    }
  };

  const isCompanyClosed = !company?.isOpen || company?.status !== 'active';

  const toggleServiceInCart = (service: ServiceData) => {
    if (isCompanyClosed) {
      showFeedback('error', 'Empresa fechada no momento. Tente novamente mais tarde.');
      return;
    }

    const isSelected = cartServices.find((s) => String(s.id) === String(service.id));
    if (isSelected) {
      onUpdateCart(cartServices.filter((s) => String(s.id) !== String(service.id)));
      return;
    }

    onUpdateCart([
      ...cartServices,
      {
        id: String(service.id),
        companyId,
        name: service.name,
        category: '',
        price: service.price,
        duration: service.duration,
        preparationTime: 0,
        attendanceMode: service.attendanceMode,
        allowScheduling: service.allowScheduling,
        assignedProfessionals: [],
        image: '',
        description: service.description,
        active: true
      }
    ]);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${company?.name} - Beleza Express`,
      text: `Confira os servicos de ${company?.name} no Beleza Express`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showFeedback('success', 'Link copiado.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showFeedback('error', 'Nao foi possivel compartilhar.');
      }
    }
  };

  const cartTotal = cartServices.reduce((acc, service) => acc + service.price, 0);

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader size={40} className="animate-spin text-[#E11D48] mb-4" />
          <p className="text-gray-400 font-semibold">Carregando...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {!loading && company && (
        <>
          <div className={`relative h-64 sm:h-80 w-full overflow-hidden ${isCompanyClosed ? 'grayscale' : ''}`}>
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200"
              className="w-full h-full object-cover"
              alt="Capa da empresa"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-black/25" />

            <button
              onClick={onBack}
              className="absolute top-6 left-6 w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg z-20"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="absolute top-6 right-6 flex gap-3 z-20">
              <button
                onClick={handleShare}
                className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border shadow-lg ${
                  isFavorite ? 'bg-[#E11D48] text-white border-transparent' : 'bg-white/20 backdrop-blur-md text-white border-white/20'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8 text-white z-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCompanyClosed ? 'bg-gray-600 text-white' : 'bg-green-500 text-white'
                      }`}
                    >
                      <ShieldCheck size={10} />
                      {isCompanyClosed ? 'Fechada agora' : 'Aberta agora'}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {company.city || 'Cidade nao informada'}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">{company.name}</h1>
                  <div className="flex items-center gap-4 mt-3 opacity-90">
                    <div className="flex items-center gap-1 font-black text-sm">
                      <Star size={16} className="text-amber-400 fill-current" />
                      {company.rating > 0 ? company.rating.toFixed(1) : '4.5'}
                    </div>
                    <div className="w-1 h-1 bg-white/40 rounded-full" />
                    <div className="text-sm font-bold">{services.length} servicos</div>
                  </div>
                </div>
                <img
                  src={company.logo || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] border-4 border-white/20 shadow-2xl object-cover"
                  alt={company.name}
                />
              </div>
            </div>
          </div>

          {isCompanyClosed && (
            <div className="mt-4 bg-gray-100 border border-gray-200 rounded-2xl p-3 text-center">
              <p className="text-gray-700 text-xs font-black uppercase tracking-widest">
                Empresa indisponivel no momento. Contratacao temporariamente bloqueada.
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'services', label: 'Servicos' },
          { id: 'reviews', label: 'Avaliacoes' },
          { id: 'about', label: 'Sobre' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'services' | 'reviews' | 'about')}
            className={`px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-[#E11D48]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E11D48] rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-lg text-gray-900 tracking-tight">Menu de Servicos</h3>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase">Confira abaixo</span>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = cartServices.find((s) => String(s.id) === String(service.id));
                  return (
                    <div
                      key={service.id}
                      className={`bg-white p-4 rounded-3xl border transition-all flex items-center justify-between group ${
                        isSelected ? 'border-[#E11D48] shadow-md' : 'border-gray-100 shadow-sm'
                      } ${isCompanyClosed ? 'opacity-70' : 'hover:shadow-lg'}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-rose-100 text-[#E11D48]' : 'bg-rose-50 text-[#E11D48]'}`}>
                          <Sparkles size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 leading-tight mb-0.5 text-sm truncate">{service.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{service.duration} min</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[9px] font-bold text-[#E11D48] uppercase">R$ {service.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        disabled={isCompanyClosed}
                        onClick={() => toggleServiceInCart(service)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md flex-shrink-0 ${
                          isSelected ? 'bg-[#E11D48] text-white' : 'bg-slate-900 text-white hover:bg-[#E11D48]'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {isSelected ? <Minus size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhum servico disponivel</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && <p className="text-gray-400 text-center py-8">Avaliacoes serao exibidas em breve</p>}
        {activeTab === 'about' && <p className="text-gray-400 text-center py-8">Informacoes completas em breve</p>}
      </div>

      {cartServices.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 border border-white/10">
            <div className="flex items-center gap-3 pl-1">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-0.5">
                  {cartServices.length} {cartServices.length === 1 ? 'Servico' : 'Servicos'}
                </p>
                <p className="text-lg font-black text-white leading-none">R$ {cartTotal.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() =>
                onProceedToBooking({
                  id: String(company.id),
                  name: company.name,
                  isOpen: company.isOpen,
                  status: company.status
                })
              }
              disabled={isCompanyClosed}
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
