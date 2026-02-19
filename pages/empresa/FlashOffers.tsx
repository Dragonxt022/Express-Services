
import React, { useState, useEffect } from 'react';
import { 
  Flame, Plus, Trash2, Clock, Zap, Target, 
  ArrowRight, Sparkles, Calendar, ChevronRight,
  Timer, Users, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import { FlashOffer, Service } from '../../types';
import { storage } from '../../utils/storage';
import { useFeedback } from '../../context/FeedbackContext';

const INITIAL_OFFERS: FlashOffer[] = [
  {
    id: '1',
    companyId: '2',
    serviceId: '1',
    name: 'Corte + Barba Madrugada',
    description: 'Válido apenas para agendamentos entre 08:00 e 10:00.',
    oldPrice: 90,
    newPrice: 55,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4h de duração
    limit: 5,
    used: 2,
    active: true
  }
];

const FlashOffers: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [offers, setOffers] = useState<FlashOffer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    name: '',
    newPrice: '',
    durationHours: '4',
    limit: '5'
  });

  useEffect(() => {
    const savedOffers = storage.get<FlashOffer[]>('flash_offers', INITIAL_OFFERS);
    const savedServices = storage.get<Service[]>('services', []);
    setOffers(savedOffers);
    setServices(savedServices);
  }, []);

  const handleCreate = () => {
    if (!formData.serviceId || !formData.name || !formData.newPrice) {
      showFeedback('error', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const selectedService = services.find(s => s.id === formData.serviceId);
    if (!selectedService) return;

    const newOffer: FlashOffer = {
      id: Date.now().toString(),
      companyId: '2',
      serviceId: formData.serviceId,
      name: formData.name,
      description: `Promoção especial para ${selectedService.name}`,
      oldPrice: selectedService.price,
      newPrice: parseFloat(formData.newPrice),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * parseInt(formData.durationHours)).toISOString(),
      limit: parseInt(formData.limit),
      used: 0,
      active: true
    };

    const updated = [newOffer, ...offers];
    setOffers(updated);
    storage.set('flash_offers', updated);
    setShowModal(false);
    showFeedback('success', 'Oferta relâmpago ativada!');
    setFormData({ serviceId: '', name: '', newPrice: '', durationHours: '4', limit: '5' });
  };

  const deleteOffer = (id: string) => {
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    storage.set('flash_offers', updated);
    showFeedback('info', 'Oferta encerrada.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Ofertas Flash <Flame className="text-orange-500 animate-pulse" size={32} />
          </h1>
          <p className="text-gray-500 font-medium">Gere escassez e ocupe sua agenda em minutos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl hover:bg-orange-600 transition-all active:scale-95"
        >
          <Zap size={20} /> Criar Promoção
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map(offer => {
          const timeLeft = Math.max(0, new Date(offer.endDate).getTime() - Date.now());
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const progress = (offer.used / offer.limit) * 100;

          return (
            <div key={offer.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
               
               <div className="p-10">
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm animate-bounce-slow">
                      <Timer size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{hoursLeft}h {minsLeft}m restantes</span>
                    </div>
                    <button onClick={() => deleteOffer(offer.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                 </div>

                 <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{offer.name}</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">{offer.description}</p>

                 <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-gray-100">
                       <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Preço Original</p>
                       <p className="text-xl font-black text-gray-300 line-through tracking-tighter">R$ {offer.oldPrice.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 relative overflow-hidden group/price">
                       <div className="absolute top-0 right-0 bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-bl-xl uppercase">Promo</div>
                       <p className="text-[9px] font-black text-orange-600 uppercase mb-1">Novo Preço</p>
                       <p className="text-2xl font-black text-orange-600 tracking-tighter">R$ {offer.newPrice.toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Resgates: {offer.used}/{offer.limit}</span>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{Math.round(progress)}% Completo</span>
                   </div>
                   <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      ></div>
                   </div>
                 </div>
               </div>

               <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ativa no Marketplace</span>
                  </div>
                  <Sparkles size={18} className="text-orange-400" />
               </div>
            </div>
          );
        })}

        {offers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-300 mb-4">
              <Flame size={40} />
            </div>
            <p className="font-bold text-gray-400 text-xl">Nenhuma oferta ativa</p>
            <p className="text-gray-300 text-sm max-w-xs mx-auto mt-2 font-medium">Crie uma promoção agora para atrair clientes instantaneamente.</p>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><Zap size={24} /></div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nova Oferta Relâmpago</h2>
                </div>
                {/* Fixed: Added missing XCircle from lucide-react imports */}
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><XCircle size={24} /></button>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Selecione o Serviço *</label>
                  <select 
                    value={formData.serviceId}
                    onChange={e => setFormData({...formData, serviceId: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Escolher...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Nome da Chamada *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Flash Nails Terça"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Preço Promocional *</label>
                    <input 
                      type="number" 
                      placeholder="0,00"
                      value={formData.newPrice}
                      onChange={e => setFormData({...formData, newPrice: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-800 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Qtd. Vouchers (Limite) *</label>
                    <input 
                      type="number" 
                      value={formData.limit}
                      onChange={e => setFormData({...formData, limit: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-800 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Duração (Horas) *</label>
                   <input 
                    type="range" 
                    min="1" max="24" 
                    value={formData.durationHours}
                    onChange={e => setFormData({...formData, durationHours: e.target.value})}
                    className="w-full accent-orange-600"
                  />
                  <div className="text-center mt-2 font-black text-orange-600 uppercase text-[10px]">Expira em {formData.durationHours} Horas</div>
                </div>

                <button 
                  onClick={handleCreate}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Ativar Oferta Agora <ArrowRight size={22} />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashOffers;
