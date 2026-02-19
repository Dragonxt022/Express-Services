
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, ChevronRight, MapPin, Star, MessageSquare, Repeat, User, Scissors, Zap } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

const History: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);

  const history = [
    { 
      id: 1, 
      company: 'Barbearia do Zé', 
      service: 'Corte + Barba Premium', 
      professional: 'Ricardo S.',
      date: '24 Mai', 
      time: '15:00', 
      price: 85, 
      duration: '60 min',
      status: 'upcoming', 
      payment: 'Pago via Pix' 
    },
    { 
      id: 2, 
      company: 'Studio Bella', 
      service: 'Manicure Gel', 
      professional: 'Ana Paula',
      date: '15 Fev', 
      time: '14:00', 
      price: 120, 
      duration: '90 min',
      status: 'completed', 
      payment: 'Finalizado' 
    },
    { 
      id: 3, 
      company: 'Nails & Co', 
      service: 'Pedicure', 
      professional: 'Juliana L.',
      date: '10 Jan', 
      time: '16:00', 
      price: 50, 
      duration: '45 min',
      status: 'completed', 
      rated: true,
      payment: 'Finalizado' 
    },
  ];

  const handleRate = (apt: any) => {
    setSelectedApt(apt);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    setShowRatingModal(false);
    showFeedback('success', 'Obrigado por sua avaliação!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Minha Jornada</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Seu histórico de bem-estar e brilho</p>
        </div>
        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
           <Zap size={24} className="fill-current" />
        </div>
      </div>
      
      <div className="space-y-6">
        {history.map(item => (
          <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col gap-8 group hover:shadow-2xl transition-all relative overflow-hidden">
            {item.status === 'upcoming' && (
              <div className="absolute top-0 right-0 bg-pink-600 text-white px-6 py-2 rounded-bl-[2rem] text-[9px] font-black uppercase tracking-widest shadow-lg">Próximo Atendimento</div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                {/* Data Badge */}
                <div className={`w-20 h-20 rounded-[2.2rem] flex flex-col items-center justify-center font-black shrink-0 shadow-inner ${item.status === 'upcoming' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-300'}`}>
                  <span className="text-[10px] uppercase tracking-tighter leading-none mb-1">{item.date.split(' ')[1]}</span>
                  <span className="text-2xl leading-none">{item.date.split(' ')[0]}</span>
                </div>

                <div>
                  <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em] mb-1">{item.company}</p>
                  <h3 className="font-black text-gray-900 text-2xl tracking-tight leading-none mb-3 group-hover:text-pink-600 transition-colors">{item.service}</h3>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                      <User size={14} className="text-gray-400" />
                      <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{item.professional}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={14} className="text-gray-300" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.time} • {item.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Investimento</p>
                  <p className="font-black text-gray-900 text-2xl tracking-tighter">R$ {item.price.toFixed(2)}</p>
                  <p className={`text-[8px] font-black uppercase mt-1 ${item.status === 'upcoming' ? 'text-green-500' : 'text-gray-400'}`}>{item.payment}</p>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  item.status === 'upcoming' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  <Scissors size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-8 border-t border-gray-50">
              {item.status === 'completed' && !item.rated && (
                <button 
                  onClick={() => handleRate(item)}
                  className="flex items-center justify-center gap-2 py-5 bg-slate-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  <Star size={16} className="fill-current text-amber-400" /> Avaliar Experiência
                </button>
              )}
              {item.status === 'completed' && item.rated && (
                <div className="flex items-center justify-center gap-2 py-5 bg-green-50 text-green-600 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest border border-green-100">
                  <CheckCircle size={16} /> Atendimento Avaliado
                </div>
              )}
              {item.status === 'upcoming' && (
                <button className="flex items-center justify-center gap-2 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:border-pink-600 hover:text-pink-600 transition-all">
                   Gerenciar Reserva
                </button>
              )}
              <button className="flex items-center justify-center gap-2 py-5 bg-gray-50 text-gray-600 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-inner">
                <Repeat size={16} /> Repetir Este Brilho
              </button>
              <button className="flex items-center justify-center gap-2 py-5 bg-white border border-transparent text-gray-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                <MessageSquare size={16} /> Suporte
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-500 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 blur-3xl rounded-full -mr-12 -mt-12"></div>
              <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner relative z-10">
                <Star size={48} className="fill-current" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Foi Incrível?</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">Sua nota ajuda o {selectedApt?.professional} a brilhar ainda mais.</p>
              
              <div className="flex justify-center gap-4 mb-10">
                {[1,2,3,4,5].map(star => (
                  <button key={star} className="text-gray-200 hover:text-amber-500 transition-all transform hover:scale-125">
                    <Star size={36} className="fill-current" />
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="Conte-nos o que você mais gostou..." 
                className="w-full p-6 bg-gray-50 border-none rounded-[2rem] text-sm font-medium mb-10 focus:ring-2 focus:ring-pink-600 resize-none h-32"
              />

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowRatingModal(false)}
                  className="py-5 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Pular
                </button>
                <button 
                  onClick={submitRating}
                  className="py-5 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 active:scale-95 transition-all"
                >
                  Enviar Nota
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default History;
