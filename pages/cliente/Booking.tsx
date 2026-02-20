
import React, { useState, useEffect } from 'react';
import { 
  Scissors, User, Calendar as CalendarIcon, Clock, 
  ChevronRight, ArrowLeft, Star, MapPin, CheckCircle2,
  CalendarDays, UserCheck, Sparkles, ArrowRight, Home, Building2, Plus, Loader, AlertCircle
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { teamMembersService } from '../../services/api';
import { TeamMember, Service, Company, Address } from '../../types';
import AddressForm from './AddressForm';
import { getCustomerAddresses, saveCustomerAddresses } from '../../utils/customerData';

interface BookingProps {
  services: Service[];
  initialCompany?: Company;
  onConfirm: (bookingDetails: any) => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '14:00', '14:30', '15:00', '15:30', '16:00', '17:00'
];

const Booking: React.FC<BookingProps> = ({ services, initialCompany, onConfirm, onBack }) => {
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(0); 
  const [selectedLocation, setSelectedLocation] = useState<'presencial' | 'domicilio' | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<TeamMember | null>(null);
  const [professionals, setProfessionals] = useState<TeamMember[]>([]);
  const [loadingPros, setLoadingPros] = useState(false);
  const [errorPros, setErrorPros] = useState<string | null>(null);

  const steps = [
    { id: 'location', label: 'Onde?' },
    { id: 'date', label: 'Quando?' },
    { id: 'pro', label: 'Com quem?' },
    { id: 'review', label: 'RevisÃ£o' }
  ];

  useEffect(() => {
    if (step === 2 && initialCompany) {
      loadProfessionals();
    }
  }, [step, initialCompany]);

  useEffect(() => {
    const customerAddresses = getCustomerAddresses();
    setAddresses(customerAddresses);
    const defaultAddress = customerAddresses.find((addr) => addr.isDefault) || customerAddresses[0];
    setSelectedAddress(defaultAddress || null);
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoadingPros(true);
      setErrorPros(null);
      const response = await teamMembersService.getByCompany(initialCompany?.id || 1);
      setProfessionals(response.data || []);
      if (!response.data || response.data.length === 0) {
        setErrorPros('Nenhum profissional disponÃ­vel');
      }
    } catch (err: any) {
      console.error('Erro ao carregar profissionais:', err);
      setErrorPros('Erro ao carregar profissionais');
    } finally {
      setLoadingPros(false);
    }
  };

  const handleNext = () => {
    if (step === 0 && !selectedLocation) {
      return showFeedback('error', 'Selecione o local de atendimento.');
    }
    if (step === 0 && selectedLocation === 'domicilio' && !selectedAddress) {
      return showFeedback('error', 'Selecione um endereÃ§o para o atendimento.');
    }
    if (step === 1 && (!selectedDate || !selectedTime)) {
      return showFeedback('error', 'Selecione a data e o horÃ¡rio.');
    }
    if (step === 2 && !selectedPro) {
      return showFeedback('error', 'Selecione um profissional.');
    }
    setStep(prev => prev + 1);
  };

  const handleFinishSelection = () => {
    const bookingDetails = {
      services,
      company: initialCompany,
      location: selectedLocation,
      address: selectedAddress,
      date: selectedDate,
      time: selectedTime,
      professional: selectedPro
    };
    onConfirm(bookingDetails);
  };

  const cartTotal = services.reduce((acc, s) => acc + s.price, 0);
  const cartDuration = services.reduce((acc, s) => acc + s.duration, 0);

  const handleSaveNewAddress = (newAddr: Partial<Address>) => {
    const addr = {
      ...(newAddr as Address),
      id: newAddr.id ? String(newAddr.id) : Date.now().toString(),
      isDefault: addresses.length === 0
    };
    const updatedAddresses = saveCustomerAddresses([...addresses, addr]);
    setAddresses(updatedAddresses);
    setSelectedAddress(addr);
    setIsAddingAddress(false);
    showFeedback('success', 'Endereco adicionado!');
  };

  if (isAddingAddress) {
    return (
      <AddressForm 
        onBack={() => setIsAddingAddress(false)}
        onSave={handleSaveNewAddress}
      />
    );
  }

  const StepHeader = ({ title, desc }: any) => (
    <div className="mb-6">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-1.5">{desc}</p>
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

      {/* STEP 0: LOCAL DE ATENDIMENTO */}
      {step === 0 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <StepHeader title="Onde?" desc="Escolha o local de sua preferÃªncia" />
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedLocation('presencial')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
                  selectedLocation === 'presencial' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-gray-50 text-gray-900 hover:border-pink-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLocation === 'presencial' ? 'bg-white/10' : 'bg-rose-50 text-pink-600'}`}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg leading-none mb-1">Presencial</h4>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedLocation === 'presencial' ? 'text-slate-400' : 'text-gray-400'}`}>Vou atÃ© a empresa</p>
                </div>
              </button>

              <button 
                onClick={() => setSelectedLocation('domicilio')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
                  selectedLocation === 'domicilio' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-gray-50 text-gray-900 hover:border-pink-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedLocation === 'domicilio' ? 'bg-white/10' : 'bg-rose-50 text-pink-600'}`}>
                  <Home size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg leading-none mb-1">A DomicÃ­lio</h4>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedLocation === 'domicilio' ? 'text-slate-400' : 'text-gray-400'}`}>A especialista vem atÃ© mim</p>
                </div>
              </button>
            </div>

            {selectedLocation === 'domicilio' && (
              <div className="animate-in slide-in-from-top-4 duration-500 space-y-4 pt-4">
                <div className="flex items-center gap-2 px-2">
                  <MapPin size={16} className="text-pink-600" />
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Selecione o EndereÃ§o</h4>
                </div>
                <div className="space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map(addr => (
                      <button 
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                          selectedAddress?.id === addr.id ? 'bg-pink-50 border-pink-600 text-pink-600' : 'bg-white border-gray-50 text-gray-500 hover:border-pink-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAddress?.id === addr.id ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <MapPin size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm leading-none mb-1">{addr.label}</p>
                            <p className="text-[10px] font-bold opacity-70">{addr.street}, {addr.number}</p>
                          </div>
                        </div>
                        {selectedAddress?.id === addr.id && <CheckCircle2 size={20} />}
                      </button>
                    ))
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <p className="text-amber-700 text-xs font-semibold">
                        Nenhum endereco salvo na sua conta. Adicione um endereco para continuar.
                      </p>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full p-5 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <Plus size={20} /> <span className="text-xs font-black uppercase tracking-widest">Novo EndereÃ§o</span>
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={handleNext}
              disabled={!selectedLocation || (selectedLocation === 'domicilio' && !selectedAddress)}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30"
            >
              Continuar <ArrowRight size={22} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 1: DATA E HORA */}
      {step === 1 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(0)} className="mb-4 text-gray-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Voltar para local
          </button>
          <StepHeader title="Data & HorÃ¡rio" desc={services.length === 1 ? services[0].name : `${services.length} serviÃ§os selecionados`} />
          
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

            {/* Grid de HorÃ¡rios */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                 <Clock size={16} className="text-pink-600" />
                 <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">HorÃ¡rios DisponÃ­veis</h4>
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
            <ArrowLeft size={14} /> Voltar para horÃ¡rios
          </button>
          <StepHeader title="Com Quem?" desc="Escolha a especialista de sua preferÃªncia" />
          
          {loadingPros ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader size={40} className="animate-spin text-[#E11D48] mb-4" />
              <p className="text-gray-400 font-semibold">Carregando profissionais...</p>
            </div>
          ) : errorPros ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-semibold text-sm">{errorPros}</p>
            </div>
          ) : professionals.length > 0 ? (
            <div className="space-y-4">
              {professionals.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPro(p)}
                  className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 text-left group ${
                    selectedPro?.id === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-gray-50 text-gray-900 hover:border-pink-200'
                  }`}
                >
                  <div className="relative">
                    <img src={p.avatar || `https://i.pravatar.cc/150?u=${p.name}`} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-md" alt={p.name} />
                    {selectedPro?.id === p.id && (
                      <div className="absolute -top-2 -right-2 bg-pink-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-slate-900">
                        <UserCheck size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl leading-none mb-1">{p.name}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPro?.id === p.id ? 'text-pink-400' : 'text-pink-600'}`}>{p.role || 'Profissional'}</p>
                    <p className={`text-xs mt-3 line-clamp-1 ${selectedPro?.id === p.id ? 'text-slate-400' : 'text-gray-400'}`}>Esp: {p.specialties || 'Geral'}</p>
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
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhum profissional disponÃ­vel</p>
          )}
        </section>
      )}

      {/* STEP 3: REVISÃƒO FINAL */}
      {step === 3 && (
        <section className="animate-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(2)} className="mb-4 text-gray-400 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={14} /> Voltar</button>
          <StepHeader title="Quase lÃ¡!" desc="Confira todos os detalhes do seu brilho" />
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 mb-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            {/* ServiÃ§o e Empresa */}
            <div className="flex flex-col gap-3 pb-6 border-b border-gray-50 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner">
                     <Scissors size={24} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5">{initialCompany?.name}</p>
                     <h4 className="font-black text-gray-900 text-xl leading-none mb-1">
                       {services.length === 1 ? services[0].name : `${services.length} ServiÃ§os`}
                     </h4>
                     <span className="text-[9px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase">{cartDuration} min de cuidado</span>
                  </div>
               </div>
               {services.length > 1 && (
                 <div className="flex flex-wrap gap-2 mt-2">
                   {services.map(s => (
                     <span key={s.id} className="text-[9px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">{s.name}</span>
                   ))}
                 </div>
               )}
            </div>

            {/* Local e EndereÃ§o */}
            <div className="pb-8 border-b border-gray-50 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                     {selectedLocation === 'domicilio' ? <Home size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Local de Atendimento</p>
                     <p className="text-sm font-bold text-gray-800">
                       {selectedLocation === 'domicilio' ? `A DomicÃ­lio: ${selectedAddress?.label}` : 'Presencial na Empresa'}
                     </p>
                     {selectedLocation === 'domicilio' && (
                       <p className="text-[10px] text-gray-400 font-medium">{selectedAddress?.street}, {selectedAddress?.number}</p>
                     )}
                  </div>
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
                     <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1.5"><Clock size={12} /> Ã s {selectedTime}</p>
                  </div>
               </div>
            </div>

            {/* Valor */}
            <div className="p-8 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Investido</span>
                  <p className="text-3xl font-black tracking-tighter mt-1">R$ {cartTotal.toFixed(2)}</p>
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




