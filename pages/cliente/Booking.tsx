
import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Calendar as CalendarIcon, Clock, 
  ChevronRight, ArrowLeft, Star, MapPin, CheckCircle2,
  CalendarDays, UserCheck, Sparkles, ArrowRight
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { storage } from '../../utils/storage';
import { TeamMember, Service, Company } from '../../types';

interface BookingProps {
  initialService?: Service;
  initialCompany?: Company;
  onConfirm: (bookingDetails: any) => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '14:00', '14:30', '15:00', '15:30', '16:00', '17:00'
];

const mockProfessionals: TeamMember[] = [
  { id: '1', name: 'Ana Paula', role: 'Colorimetrista Master', avatar: 'https://i.pravatar.cc/150?u=ana', status: 'online', email: '', phone: '', commission: 0, commissionEnabled: false, specialties: 'Loiros e Mechas', active: true },
  { id: '2', name: 'Camila Souza', role: 'Barbeira Visagista', avatar: 'https://i.pravatar.cc/150?u=camila', status: 'online', email: '', phone: '', commission: 0, commissionEnabled: false, specialties: 'Barba e Cortes Curtos', active: true },
  { id: '3', name: 'Juliana Lima', role: 'Esteticista Facial', avatar: 'https://i.pravatar.cc/150?u=juju', status: 'online', email: '', phone: '', commission: 0, commissionEnabled: false, specialties: 'Limpeza de Pele', active: true },
];

const Booking: React.FC<BookingProps> = ({ initialService, initialCompany, onConfirm, onBack }) => {
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(initialService ? 1 : 0); // Se já tem serviço, pula pra data
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<TeamMember | null>(null);

  const steps = [
    { id: 'date', label: 'Quando?' },
    { id: 'pro', label: 'Com quem?' },
    { id: 'review', label: 'Revisão' }
  ];

  const handleNext = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) {
      return showFeedback('error', 'Selecione a data e o horário.');
    }
    if (step === 2 && !selectedPro) {
      return showFeedback('error', 'Selecione um profissional.');
    }
    setStep(prev => prev + 1);
  };

  const handleFinishSelection = () => {
    const bookingDetails = {
      service: initialService,
      company: initialCompany,
      date: selectedDate,
      time: selectedTime,
      professional: selectedPro
    };
    onConfirm(bookingDetails);
  };

  const StepHeader = ({ title, desc }: any) => (
    <div className="mb-8">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">{desc}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Barra de Progresso Customizada */}
      <div className="flex items-center justify-between mb-10 px-2">
         {steps.map((s, idx) => (
           <div key={s.id} className="flex flex-col items-center flex-1 relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${
                step > idx + 1 ? 'bg-green-500 text-white' : 
                step === idx + 1 ? 'bg-slate-900 text-white shadow-xl scale-110' : 
                'bg-gray-100 text-gray-400'
              }`}>
                {step > idx + 1 ? <CheckCircle2 size={20} /> : <span className="text-sm font-black">{idx + 1}</span>}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-2 ${step === idx + 1 ? 'text-slate-900' : 'text-gray-300'}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute left-1/2 w-full h-[2px] top-5 -z-0 ${step > idx + 1 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
              )}
           </div>
         ))}
      </div>

      {/* STEP 1: DATA E HORA */}
      {step === 1 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <StepHeader title="Data & Horário" desc={initialService?.name || 'Selecione o melhor momento'} />
          
          <div className="space-y-8">
            {/* Seletor de Datas Horizontal */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
              {[...Array(14)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const isSelected = selectedDate === d.toISOString().split('T')[0];
                return (
                  <button 
                    key={i}
                    onClick={() => setSelectedDate(d.toISOString().split('T')[0])}
                    className={`flex-shrink-0 w-16 py-4 rounded-3xl flex flex-col items-center gap-1 transition-all border-2 ${
                      isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                    <span className="text-lg font-black">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid de Horários */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                 <Clock size={16} className="text-pink-600" />
                 <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Horários Disponíveis</h4>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                      selectedTime === time ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-gray-50 text-gray-500 hover:border-pink-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Escolher Profissional <ArrowRight size={22} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: PROFISSIONAL */}
      {step === 2 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(1)} className="mb-4 text-gray-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Voltar para horários
          </button>
          <StepHeader title="Com Quem?" desc="Escolha a especialista de sua preferência" />
          
          <div className="space-y-4">
            {mockProfessionals.map((p) => (
              <button 
                key={p.id}
                onClick={() => setSelectedPro(p)}
                className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 text-left group ${
                  selectedPro?.id === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-gray-50 text-gray-900 hover:border-pink-200'
                }`}
              >
                <div className="relative">
                  <img src={p.avatar} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-md" alt={p.name} />
                  {selectedPro?.id === p.id && (
                    <div className="absolute -top-2 -right-2 bg-pink-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-slate-900">
                      <UserCheck size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-xl leading-none mb-1">{p.name}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPro?.id === p.id ? 'text-pink-400' : 'text-pink-600'}`}>{p.role}</p>
                  <p className={`text-xs mt-3 line-clamp-1 ${selectedPro?.id === p.id ? 'text-slate-400' : 'text-gray-400'}`}>Esp: {p.specialties}</p>
                </div>
                <div className={`p-3 rounded-2xl transition-colors ${selectedPro?.id === p.id ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-300'}`}>
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}

            <div className="pt-6">
              <button 
                onClick={handleNext}
                disabled={!selectedPro}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Revisar Agendamento <Sparkles size={22} className="text-pink-500" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: REVISÃO FINAL */}
      {step === 3 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(2)} className="mb-4 text-gray-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={14} /> Voltar</button>
          <StepHeader title="Quase lá!" desc="Confira todos os detalhes do seu brilho" />
          
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-100 mb-8 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            {/* Serviço e Empresa */}
            <div className="flex items-center gap-5 pb-8 border-b border-gray-50 relative z-10">
               <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-pink-600 shadow-inner">
                  <Scissors size={32} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">{initialCompany?.name}</p>
                  <h4 className="font-black text-gray-900 text-2xl leading-none mb-1">{initialService?.name}</h4>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase">{initialService?.duration} min de cuidado</span>
               </div>
            </div>

            {/* Profissional e Tempo */}
            <div className="grid grid-cols-2 gap-8 relative z-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <User size={14} className="text-pink-600" /> Profissional
                  </div>
                  <div className="flex items-center gap-3">
                     <img src={selectedPro?.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                     <p className="font-black text-gray-900 leading-tight">{selectedPro?.name}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <CalendarDays size={14} className="text-pink-600" /> Quando
                  </div>
                  <div>
                     <p className="font-black text-gray-900 text-lg leading-none">{selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</p>
                     <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1.5"><Clock size={12} /> às {selectedTime}</p>
                  </div>
               </div>
            </div>

            {/* Valor */}
            <div className="p-8 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Investido</span>
                  <p className="text-3xl font-black tracking-tighter mt-1">R$ {initialService?.price.toFixed(2)}</p>
               </div>
               <div className="relative z-10 text-right">
                  <span className="text-[8px] font-black bg-white/10 px-2 py-1 rounded-lg uppercase">Pagamento no Local</span>
               </div>
            </div>
          </div>

          <button 
            onClick={handleFinishSelection}
            className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-rose-200 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Confirmar e Pagar <ArrowRight size={24} />
          </button>
        </section>
      )}
    </div>
  );
};

export default Booking;
