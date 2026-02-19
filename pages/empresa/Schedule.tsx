
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, 
  Plus, CheckCircle2, XCircle, ListTodo, Phone, Zap, 
  AlertTriangle, Users, LayoutGrid, Search, MoreHorizontal,
  ChevronDown, MapPin, MessageCircle, CalendarDays, Edit2,
  RefreshCw, X, ArrowRight, Ban, UserPlus
} from 'lucide-react';
import { Appointment, TeamMember } from '../../types';
import { storage } from '../../utils/storage';
import { useFeedback } from '../../context/FeedbackContext';

const getTodayStr = () => new Date().toISOString().split('T')[0];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', date: getTodayStr(), time: '08:00', clientName: 'Ana Maria Braga', clientPhone: '5511999999999', companyName: 'Studio Elegance', serviceName: 'Corte + Coloração', status: 'completed', duration: '90', price: 150 },
  { id: '2', date: getTodayStr(), time: '09:30', clientName: 'Roberto Carlos', clientPhone: '5511988888888', companyName: 'Studio Elegance', serviceName: 'Barba Terapia', status: 'scheduled', duration: '45', price: 40 },
  { id: 'm1', date: getTodayStr(), time: '11:30', clientName: 'CLIENTE LOCAL', serviceName: 'Manicure Manual', status: 'scheduled', duration: '30', price: 35, isOffline: true, companyName: 'Studio Elegance' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${min}`;
});

const Schedule: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  
  // States para Agendamento Manual
  const [manualSlot, setManualSlot] = useState<{time: string} | null>(null);
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);

  useEffect(() => {
    const savedApts = storage.get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const savedTeam = storage.get<TeamMember[]>('team_members', []);
    setAppointments(savedApts);
    setTeam(savedTeam.length > 0 ? savedTeam : [
      { id: '1', name: 'Ana Paula', role: 'Master', avatar: 'https://i.pravatar.cc/150?u=ana', status: 'online', email: '', phone: '', commission: 40, specialties: '', active: true },
      { id: '2', name: 'Ricardo', role: 'Barber', avatar: 'https://i.pravatar.cc/150?u=ricardo', status: 'online', email: '', phone: '', commission: 35, specialties: '', active: true },
    ]);
  }, []);

  const saveAppointments = (list: Appointment[]) => {
    setAppointments(list);
    storage.set('appointments', list);
  };

  const createManualApt = (type: 'service' | 'block', name?: string) => {
    if (!manualSlot) return;
    
    const newApt: Appointment = {
      id: `manual-${Date.now()}`,
      date: selectedDate.toISOString().split('T')[0],
      time: manualSlot.time,
      clientName: name || (type === 'block' ? 'HORÁRIO BLOQUEADO' : 'Cliente Manual'),
      serviceName: type === 'block' ? 'Indisponível' : 'Serviço Off-line',
      status: 'scheduled',
      duration: '30',
      price: type === 'block' ? 0 : 50,
      isOffline: true,
      type: type,
      companyName: 'Studio Elegance'
    };

    saveAppointments([...appointments, newApt]);
    setManualSlot(null);
    showFeedback('success', type === 'block' ? 'Horário bloqueado na agenda' : 'Agendamento manual criado');
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    const updated = appointments.map(apt => apt.id === id ? { ...apt, status } : apt);
    saveAppointments(updated);
    showFeedback('success', `Status atualizado`);
  };

  const confirmReschedule = (newTime: string) => {
    if (!reschedulingApt) return;
    const updated = appointments.map(apt => 
      apt.id === reschedulingApt.id 
        ? { ...apt, time: newTime, date: selectedDate.toISOString().split('T')[0] } 
        : apt
    );
    saveAppointments(updated);
    setReschedulingApt(null);
    showFeedback('success', 'Remarcado com sucesso!');
  };

  const getAptForSlot = (time: string, profId: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments.find(a => a.time === time && a.date === dateStr);
  };

  const currentHour = new Date().getHours() + ":" + (new Date().getMinutes() < 30 ? "00" : "30");

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40 animate-in fade-in duration-500">
      {/* Header Fixo Premium */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-gray-100 px-6 py-4 -mx-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <CalendarDays size={20} />
             </div>
             <div>
                <h1 className="text-xl font-black text-gray-900 leading-none">Minha Agenda</h1>
                <p className="text-[10px] font-black text-pink-700 uppercase tracking-[0.2em] mt-1">Gestão de Fluxo</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
              <Search size={18} />
            </button>
            <button 
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCalendarExpanded ? 'bg-pink-600 text-white shadow-pink-200' : 'bg-white border border-gray-100 text-gray-400'}`}
            >
              <CalendarIcon size={18} />
            </button>
          </div>
        </div>

        {/* Calendário Expansível */}
        {isCalendarExpanded ? (
          <div className="max-w-5xl mx-auto mb-4 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-7 gap-2">
              {['D','S','T','Q','Q','S','S'].map(d => (
                <span key={d} className="text-[10px] font-black text-gray-300 text-center uppercase">{d}</span>
              ))}
              {getDaysInMonth().map((day, i) => {
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <button 
                    key={i}
                    onClick={() => { setSelectedDate(day); setIsCalendarExpanded(false); }}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected ? 'bg-slate-900 text-white shadow-lg scale-110' : 
                      isToday ? 'text-pink-600 bg-pink-50' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex gap-3 overflow-x-auto no-scrollbar py-2">
            {[...Array(7)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i - 3); 
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(new Date(d))}
                  className={`flex-shrink-0 w-14 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all border ${
                    isSelected ? 'bg-pink-600 border-pink-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="text-sm font-black">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filtro de Profissionais */}
        <div className="max-w-5xl mx-auto mt-4 flex gap-3 overflow-x-auto no-scrollbar">
           <button 
            onClick={() => setSelectedProfId('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedProfId === 'all' ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-transparent border-transparent text-gray-400'}`}
           >
             Equipe
           </button>
           {team.map(prof => (
             <button 
              key={prof.id}
              onClick={() => setSelectedProfId(prof.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${selectedProfId === prof.id ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-transparent border-transparent text-gray-400'}`}
             >
               <img src={prof.avatar} className="w-5 h-5 rounded-lg object-cover" alt="" />
               <span className="text-[10px] font-black uppercase tracking-tight">{prof.name.split(' ')[0]}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {reschedulingApt && (
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white mb-6 animate-in slide-in-from-top-4 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <RefreshCw size={60} className="animate-spin-slow" />
             </div>
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-black uppercase tracking-widest text-pink-500">Remarcando Atendimento</h3>
                 <button onClick={() => setReschedulingApt(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
               </div>
               <p className="text-xl font-black">{reschedulingApt.clientName}</p>
               <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                  <Clock size={18} className="text-pink-500" />
                  <span className="text-sm font-black">Toque em um horário livre</span>
               </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
          {TIME_SLOTS.map(time => {
            const apt = getAptForSlot(time, selectedProfId);
            const isNow = time === currentHour;

            return (
              <div key={time} className="flex gap-4 items-start group">
                <div className="w-12 text-center pt-2">
                   <span className={`text-[11px] font-black ${isNow ? 'text-pink-600' : 'text-gray-400'}`}>{time}</span>
                   <div className="w-px h-full bg-gray-100 min-h-[60px] mx-auto mt-2"></div>
                </div>

                <div className="flex-1 min-h-[80px]">
                   {apt ? (
                     <div className={`p-6 rounded-[2.5rem] border shadow-sm transition-all relative overflow-hidden group/card ${
                       apt.type === 'block' ? 'bg-slate-100 border-slate-200 opacity-80' :
                       apt.isOffline ? 'bg-slate-800 border-slate-900 text-white' :
                       apt.status === 'completed' ? 'bg-emerald-50 border-emerald-100' : 
                       'bg-white border-gray-100'
                     }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          apt.type === 'block' ? 'bg-slate-400' :
                          apt.isOffline ? 'bg-pink-500' :
                          apt.status === 'completed' ? 'bg-emerald-600' : 'bg-pink-600'
                        }`}></div>

                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${apt.isOffline ? 'text-pink-400' : 'text-pink-600'}`}>
                              {apt.type === 'block' ? 'INDISPONÍVEL' : apt.serviceName}
                            </p>
                            <h4 className={`text-xl font-black leading-none ${apt.isOffline ? 'text-white' : 'text-gray-900'}`}>{apt.clientName}</h4>
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                             {apt.type !== 'block' && (
                               <button 
                                onClick={() => setReschedulingApt(apt)}
                                className={`p-3 rounded-2xl shadow-lg transition-all ${
                                  apt.isOffline 
                                    ? 'bg-white/10 text-white hover:bg-white/20' 
                                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                                }`}
                                title="Remarcar"
                               >
                                 <RefreshCw size={16} />
                               </button>
                             )}
                             <button 
                              onClick={() => {
                                const list = appointments.filter(a => a.id !== apt.id);
                                saveAppointments(list);
                                showFeedback('info', 'Agendamento removido');
                              }}
                              className={`p-3 rounded-2xl transition-all ${
                                apt.isOffline
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                              }`}
                              title="Remover"
                             >
                               <X size={16} />
                             </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex gap-2">
                              {apt.type !== 'block' && (
                                <>
                                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${apt.isOffline ? 'bg-white/5 border-white/10 text-white/60' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    <Clock size={12} /> {apt.duration}m
                                  </span>
                                  {apt.isOffline && (
                                    <span className="bg-pink-600/20 text-pink-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-pink-500/20">
                                      MANUAL
                                    </span>
                                  )}
                                </>
                              )}
                           </div>
                        </div>
                     </div>
                   ) : (
                     <button 
                      onClick={() => reschedulingApt ? confirmReschedule(time) : setManualSlot({time})}
                      className={`w-full h-16 border-2 border-dashed rounded-[1.8rem] flex items-center justify-center transition-all ${
                        reschedulingApt || manualSlot?.time === time
                          ? 'border-pink-300 bg-pink-50/30 text-pink-600 animate-pulse' 
                          : 'border-gray-100 text-gray-200 hover:border-gray-200 hover:text-gray-300'
                      }`}
                     >
                        {reschedulingApt ? (
                          <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             Mover para {time} <ArrowRight size={16} />
                          </span>
                        ) : <Plus size={20} />}
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sheet de Opções de Bloqueio (Manual Slot) */}
      {manualSlot && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
           <div className="w-full bg-white rounded-t-[3rem] p-8 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ocupar Horário - {manualSlot.time}</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Escolha o tipo de reserva</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button 
                  onClick={() => createManualApt('service', prompt('Nome do Cliente:') || undefined)}
                  className="flex flex-col items-center gap-4 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl active:scale-95 transition-all"
                 >
                    <div className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                       <UserPlus size={28} />
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-lg">Agendamento Manual</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente off-line / WhatsApp</span>
                    </div>
                 </button>

                 <button 
                  onClick={() => createManualApt('block')}
                  className="flex flex-col items-center gap-4 p-8 bg-gray-50 text-gray-400 rounded-[2.5rem] border border-gray-100 active:scale-95 transition-all"
                 >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                       <Ban size={28} />
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-lg text-gray-800">Bloquear Horário</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Almoço / Folga / Curso</span>
                    </div>
                 </button>
              </div>

              <button 
                onClick={() => setManualSlot(null)}
                className="w-full mt-6 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Cancelar
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
