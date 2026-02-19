
import React, { useState } from 'react';
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, 
  Share2, Heart, ShieldCheck, ChevronRight, 
  Scissors, Sparkles, User, Info 
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

interface CompanyDetailsProps {
  companyId: string;
  onBack: () => void;
  onBookService: (service: any) => void;
}

const mockServices = [
  { id: '1', name: 'Corte + Barba Premium', price: 85, duration: '60 min', category: 'Cabelo', icon: Scissors, description: 'Tratamento completo com toalha quente e massagem facial.' },
  { id: '2', name: 'Barba Terapia', price: 45, duration: '30 min', category: 'Barba', icon: User, description: 'Barba feita com navalha e produtos exclusivos.' },
  { id: '3', name: 'Limpeza de Pele Express', price: 120, duration: '45 min', category: 'Estética', icon: Sparkles, description: 'Remoção de impurezas e hidratação profunda.' },
];

const mockReviews = [
  { id: 1, user: 'Mariana S.', rating: 5, comment: 'Atendimento impecável! O profissional foi super cuidadoso.', date: 'Há 2 dias' },
  { id: 2, user: 'João P.', rating: 4, comment: 'Lugar muito bonito e limpo. Recomendo.', date: 'Há 1 semana' },
];

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ companyId, onBack, onBookService }) => {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Barbearia do Zé - Beleza Express',
      text: 'Confira os serviços da Barbearia do Zé no Beleza Express! Agende agora seu horário.',
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
      {/* Header / Hero */}
      <div className="relative -mx-4 -mt-6 mb-8">
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
                  1.2 km de você
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-none">Barbearia do Zé</h1>
              <div className="flex items-center gap-4 mt-3 opacity-90">
                <div className="flex items-center gap-1 font-black text-sm">
                  <Star size={16} className="text-amber-400 fill-current" /> 4.8
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="text-sm font-bold">128 avaliações</div>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200" 
              className="w-24 h-24 rounded-[2rem] border-4 border-white/20 shadow-2xl object-cover hidden sm:block" 
              alt="Logo" 
            />
          </div>
        </div>
      </div>

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
                <Clock size={16} /> <span className="text-[10px] font-black uppercase">Tempo médio: 45m</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockServices.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#E11D48] group-hover:scale-110 transition-transform">
                      <service.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 leading-none mb-1">{service.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase">{service.duration}</span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        <span className="text-[10px] font-black text-[#E11D48] uppercase">R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onBookService(service)}
                    className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-[#E11D48] transition-all shadow-lg active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
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
              {mockReviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{review.user}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))}
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
    </div>
  );
};

export default CompanyDetails;
