import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  CalendarDays,
  RefreshCw,
  X,
  ArrowRight,
  Ban,
  UserPlus
} from 'lucide-react';
import { Appointment, TeamMember } from '../../types';
import { useFeedback } from '../../context/FeedbackContext';
import { appointmentsService, companiesService, teamMembersService } from '../../services/api';

const API_BASE = ((import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
const getTodayStr = () => new Date().toISOString().split('T')[0];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${min}`;
});

const Schedule: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [manualSlot, setManualSlot] = useState<{ time: string } | null>(null);
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);

  const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

  const loadData = async (knownCompanyId?: number) => {
    try {
      const resolvedCompanyId = knownCompanyId || companyId || Number((await companiesService.getMySettings()).data?.settings?.companyId || 0);
      if (!resolvedCompanyId) {
        showFeedback('error', 'Empresa vinculada nao encontrada.');
        return;
      }
      setCompanyId(resolvedCompanyId);

      const [appointmentsRes, teamRes] = await Promise.all([
        appointmentsService.getByCompany(resolvedCompanyId),
        teamMembersService.getByCompany(resolvedCompanyId, { includeInactive: true })
      ]);

      const mappedAppointments: Appointment[] = (appointmentsRes.data?.appointments || []).map((item: any) => ({
        id: String(item.id),
        clientName: item.client_name || item.customer_name || 'Cliente',
        clientPhone: item.client_phone || '',
        companyName: item.company_name || 'Empresa',
        serviceName: item.services?.length ? item.services.map((s: any) => s.name).join(', ') : (item.notes || 'Servico'),
        date: new Date(item.scheduled_at).toISOString().split('T')[0],
        time: item.time || new Date(item.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: item.status,
        price: Number(item.price || 0),
        duration: String(item.duration || '30'),
        isOffline: Boolean(item.is_offline),
        type: String(item.notes || '').startsWith('[BLOCK]') ? 'block' : 'service',
        professionalName: item.professional_name_ref || item.professional_name || '',
        professionalId: item.professional_id ? String(item.professional_id) : undefined
      } as any));

      const mappedTeam: TeamMember[] = (teamRes.data?.teamMembers || [])
        .filter((member: any) => member.active)
        .map((member: any) => ({
          id: String(member.id),
          name: member.name || '',
          role: member.role || '',
          avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Profissional')}`,
          status: (member.status || 'offline') as 'online' | 'offline',
          email: member.email || '',
          phone: member.phone || '',
          commission: Number(member.commission || 0),
          commissionEnabled: Boolean(member.commission_enabled),
          specialties: member.specialties || '',
          active: Boolean(member.active)
        }));

      setAppointments(mappedAppointments);
      setTeam(mappedTeam);
    } catch (error: any) {
      showFeedback('error', error.response?.data?.message || 'Falha ao carregar agenda.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!companyId) return undefined;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let retryMs = 1500;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      source = new EventSource(`${API_BASE}/api/events/stream?companyId=${companyId}`);

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if ((data?.type || '').startsWith('appointment_') || (data?.type || '').startsWith('order_')) {
            loadData(companyId);
          }
        } catch (_) {
          // noop
        }
      };

      source.onopen = () => {
        retryMs = 1500;
      };

      source.onerror = () => {
        source?.close();
        if (disposed) return;
        reconnectTimer = setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, 12000);
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [companyId]);

  const createManualApt = async (type: 'service' | 'block', name?: string) => {
    if (!manualSlot || !companyId) return;

    const scheduledAt = new Date(`${selectedDateStr}T${manualSlot.time}:00`).toISOString();
    try {
      if (type === 'block') {
        await appointmentsService.createBlock({
          company_id: companyId,
          scheduled_at: scheduledAt,
          time: manualSlot.time,
          duration: 30,
          reason: 'Bloqueio manual'
        });
      } else {
        await appointmentsService.create({
          company_id: companyId,
          professional_id: selectedProfId !== 'all' ? Number(selectedProfId) : null,
          client_name: name || 'Cliente Manual',
          scheduled_at: scheduledAt,
          time: manualSlot.time,
          price: 50,
          duration: 30,
          service_location: 'presencial',
          notes: 'Agendamento manual',
          is_offline: true,
          services: []
        });
      }
      setManualSlot(null);
      await loadData(companyId);
      showFeedback('success', type === 'block' ? 'Horario bloqueado na agenda' : 'Agendamento manual criado');
    } catch (error: any) {
      showFeedback('error', error.response?.data?.message || 'Falha ao criar registro manual.');
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await appointmentsService.updateStatus(Number(id), status);
      await loadData(companyId || undefined);
      showFeedback('success', 'Status atualizado');
    } catch (error: any) {
      showFeedback('error', error.response?.data?.message || 'Falha ao atualizar status.');
    }
  };

  const confirmReschedule = async (newTime: string) => {
    if (!reschedulingApt) return;
    try {
      const scheduledAt = new Date(`${selectedDateStr}T${newTime}:00`).toISOString();
      await appointmentsService.update(Number(reschedulingApt.id), {
        scheduled_at: scheduledAt,
        time: newTime
      });
      setReschedulingApt(null);
      await loadData(companyId || undefined);
      showFeedback('success', 'Remarcado com sucesso');
    } catch (error: any) {
      showFeedback('error', error.response?.data?.message || 'Falha ao remarcar.');
    }
  };

  const getAptForSlot = (time: string) => {
    return appointments.find((appointment) => {
      if (appointment.status === 'completed' || appointment.status === 'cancelled') return false;
      if (appointment.date !== selectedDateStr) return false;
      if (appointment.time !== time) return false;
      if (selectedProfId !== 'all' && String((appointment as any).professionalId || '') !== selectedProfId) return false;
      return true;
    });
  };

  const currentHour = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes() < 30 ? '00' : '30'}`;

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
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-gray-100 px-6 py-4 -mx-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CalendarDays size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">Minha Agenda</h1>
              <p className="text-[10px] font-black text-pink-700 uppercase tracking-[0.2em] mt-1">Gestao de Fluxo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
              <Search size={18} />
            </button>
            <button
              onClick={() => loadData(companyId || undefined)}
              className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center border border-gray-100"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCalendarExpanded ? 'bg-pink-600 text-white shadow-pink-200' : 'bg-white border border-gray-100 text-gray-400'}`}
            >
              <CalendarIcon size={18} />
            </button>
          </div>
        </div>

        {isCalendarExpanded ? (
          <div className="max-w-5xl mx-auto mb-4 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-7 gap-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
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

        <div className="max-w-5xl mx-auto mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedProfId('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedProfId === 'all' ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-transparent border-transparent text-gray-400'}`}
          >
            Equipe
          </button>
          {team.map((prof) => (
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
                <span className="text-sm font-black">Toque em um horario livre</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {TIME_SLOTS.map((time) => {
            const apt = getAptForSlot(time);
            const isNow = time === currentHour;

            return (
              <div key={time} className="flex gap-4 items-start group">
                <div className="w-12 text-center pt-2">
                  <span className={`text-[11px] font-black ${isNow ? 'text-pink-600' : 'text-gray-400'}`}>{time}</span>
                  <div className="w-px h-full bg-gray-100 min-h-[60px] mx-auto mt-2"></div>
                </div>

                <div className="flex-1 min-h-[80px]">
                  {apt ? (
                    <div className={`p-4 rounded-3xl border shadow-sm transition-all relative overflow-hidden group/card ${
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

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${apt.isOffline ? 'text-pink-400' : 'text-pink-600'}`}>
                            {apt.type === 'block' ? 'INDISPONIVEL' : apt.serviceName}
                          </p>
                          <h4 className={`text-lg font-black leading-none ${apt.isOffline ? 'text-white' : 'text-gray-900'}`}>{apt.clientName}</h4>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          {apt.type !== 'block' && (
                            <button
                              onClick={() => setReschedulingApt(apt)}
                              className={`p-2.5 rounded-xl shadow-lg transition-all ${
                                apt.isOffline
                                  ? 'bg-white/10 text-white hover:bg-white/20'
                                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                              }`}
                              title="Remarcar"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await appointmentsService.delete(Number(apt.id));
                              await loadData(companyId || undefined);
                              showFeedback('info', 'Agendamento removido');
                            }}
                            className={`p-2.5 rounded-xl transition-all ${
                              apt.isOffline
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                            }`}
                            title="Remover"
                          >
                            <X size={14} />
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

                        <div className="flex gap-2">
                          {apt.status !== 'completed' && apt.type !== 'block' && (
                            <button onClick={() => updateStatus(String(apt.id), 'completed')} className="text-[10px] px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-black uppercase">
                              Concluir
                            </button>
                          )}
                          {apt.status !== 'cancelled' && apt.type !== 'block' && (
                            <button onClick={() => updateStatus(String(apt.id), 'cancelled')} className="text-[10px] px-3 py-1 rounded-lg bg-red-50 text-red-600 font-black uppercase">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => reschedulingApt ? confirmReschedule(time) : setManualSlot({ time })}
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

      {manualSlot && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <div className="w-10 h-1 bg-gray-100 rounded-full mx-auto mb-6"></div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Ocupar Horario - {manualSlot.time}</h3>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">Escolha o tipo de reserva</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => createManualApt('service', window.prompt('Nome do Cliente:') || undefined)}
                className="flex flex-col items-center gap-3 p-6 bg-slate-900 text-white rounded-3xl shadow-xl active:scale-95 transition-all"
              >
                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus size={24} />
                </div>
                <div className="text-center">
                  <span className="block font-black text-base">Agendamento Manual</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp / Off-line</span>
                </div>
              </button>

              <button
                onClick={() => createManualApt('block')}
                className="flex flex-col items-center gap-3 p-6 bg-gray-50 text-gray-400 rounded-3xl border border-gray-100 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <Ban size={24} />
                </div>
                <div className="text-center">
                  <span className="block font-black text-base text-gray-800">Bloquear Horario</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Almoco / Folga</span>
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
