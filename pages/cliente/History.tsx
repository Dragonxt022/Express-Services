import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Star,
  MessageSquare,
  Repeat,
  User,
  Scissors,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { appointmentsService, ordersService, reviewsService } from '../../services/api';
import { storage } from '../../utils/storage';

const API_BASE = ((import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  in_progress: 'Em atendimento',
  completed: 'Finalizado',
  cancelled: 'Cancelado'
};

const statusClass: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  confirmed: 'text-blue-600 bg-blue-50',
  in_progress: 'text-indigo-600 bg-indigo-50',
  completed: 'text-emerald-600 bg-emerald-50',
  cancelled: 'text-red-600 bg-red-50'
};

const History: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointmentsById, setAppointmentsById] = useState<Record<string, any>>({});
  const [serviceUsageCount, setServiceUsageCount] = useState<Record<string, number>>({});
  const [reviewedServiceIds, setReviewedServiceIds] = useState<Set<string>>(new Set());
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [focusAppointmentId, setFocusAppointmentId] = useState<string | null>(null);

  const userId = useMemo(() => {
    const session = storage.get<{ id?: string | number } | null>('session', null);
    const n = Number(session?.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  const hydrateData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      const [ordersRes, appointmentsRes, reviewsRes] = await Promise.all([
        ordersService.getByCustomer(userId),
        appointmentsService.getByCustomer(userId),
        reviewsService.getMy()
      ]);

      const fetchedOrders = ordersRes.data?.orders || [];
      const fetchedAppointments = appointmentsRes.data?.appointments || [];
      const fetchedReviews = reviewsRes.data?.reviews || [];

      const byId = fetchedAppointments.reduce((acc: Record<string, any>, item: any) => {
        acc[String(item.id)] = item;
        return acc;
      }, {});

      const usage = fetchedAppointments.reduce((acc: Record<string, number>, appointment: any) => {
        if (appointment.status !== 'completed') return acc;
        (appointment.services || []).forEach((service: any) => {
          const key = String(service.id);
          acc[key] = (acc[key] || 0) + 1;
        });
        return acc;
      }, {});

      const reviewed = new Set<string>((fetchedReviews || []).map((review: any) => String(review.service_id)).filter(Boolean));

      const sortedOrders = (fetchedOrders || [])
        .slice()
        .sort((a: any, b: any) => {
          const aTs = new Date(a.created_at || a.updated_at || 0).getTime();
          const bTs = new Date(b.created_at || b.updated_at || 0).getTime();
          if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) {
            return bTs - aTs;
          }
          return Number(b.id || 0) - Number(a.id || 0);
        });

      setOrders(sortedOrders);
      setAppointmentsById(byId);
      setServiceUsageCount(usage);
      setReviewedServiceIds(reviewed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nao foi possivel carregar seu historico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateData();
  }, [userId]);

  useEffect(() => {
    const focused = storage.get<string | null>('history_focus_appointment_id', null);
    if (focused) {
      setFocusAppointmentId(String(focused));
      storage.remove('history_focus_appointment_id');
    }
  }, []);

  useEffect(() => {
    if (!userId) return undefined;

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let retryMs = 1500;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      source = new EventSource(`${API_BASE}/api/events/stream?userId=${userId}`);

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            ['order_created', 'order_updated', 'order_status_changed', 'appointment_status_changed', 'review_created'].includes(data?.type)
          ) {
            hydrateData();
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
  }, [userId]);

  const getOrderVisualStatus = (order: any, appointment: any) => {
    if (appointment?.status === 'completed') return 'completed';
    if (appointment?.status === 'cancelled') return 'cancelled';
    return String(order.status || '');
  };

  const getRateableService = (order: any) => {
    const appointment = appointmentsById[String(order.appointment_id)];
    const visualStatus = getOrderVisualStatus(order, appointment);
    if (!appointment || visualStatus !== 'completed') return null;
    const candidate = (appointment.services || []).find((service: any) => {
      const serviceId = String(service.id);
      return (serviceUsageCount[serviceId] || 0) >= 2 && !reviewedServiceIds.has(serviceId);
    });
    return candidate || null;
  };

  const handleRate = (order: any) => {
    const appointment = appointmentsById[String(order.appointment_id)];
    const rateableService = getRateableService(order);
    if (!appointment || !rateableService) return;

    setSelectedItem({
      order,
      appointment,
      service: rateableService
    });
    setSelectedRating(5);
    setComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    try {
      if (!selectedItem) return;
      await reviewsService.create({
        order_id: selectedItem.order.id,
        appointment_id: selectedItem.appointment.id,
        company_id: selectedItem.order.company_id,
        service_id: selectedItem.service.id,
        rating: selectedRating,
        comment
      });
      setShowRatingModal(false);
      showFeedback('success', 'Obrigado pela sua avaliacao!');
      await hydrateData();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Nao foi possivel enviar sua avaliacao.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-20">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Minha Jornada</h1>
        <p className="text-gray-400 font-semibold">Carregando historico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Minha Jornada</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Seu historico de bem-estar e brilho</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
            <Zap size={24} className="fill-current" />
          </div>
          <button onClick={hydrateData} className="w-12 h-12 bg-white rounded-2xl border border-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => {
          const appointment = appointmentsById[String(order.appointment_id)];
          const visualStatus = getOrderVisualStatus(order, appointment);
          const serviceLabel = appointment?.services?.length
            ? appointment.services.map((service: any) => service.name).join(', ')
            : 'Servico';
          const professional = appointment?.professional_name_ref || appointment?.professional_name || 'Profissional';
          const canRate = Boolean(getRateableService(order));

          return (
            <div key={order.id} className={`bg-white p-8 rounded-[3.5rem] border shadow-sm flex flex-col gap-8 group hover:shadow-2xl transition-all relative overflow-hidden ${
              focusAppointmentId && String(order.appointment_id) === focusAppointmentId
                ? 'border-pink-300 ring-2 ring-pink-100'
                : 'border-gray-100'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 rounded-[2.2rem] flex flex-col items-center justify-center font-black shrink-0 shadow-inner ${order.status === 'confirmed' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-300'}`}>
                    <span className="text-[10px] uppercase tracking-tighter leading-none mb-1">
                      {order.appointment_scheduled_at ? new Date(order.appointment_scheduled_at).toLocaleDateString('pt-BR', { month: 'short' }) : '--'}
                    </span>
                    <span className="text-2xl leading-none">
                      {order.appointment_scheduled_at ? new Date(order.appointment_scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit' }) : '--'}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em] mb-1">{order.company_name || 'Empresa'}</p>
                    <h3 className="font-black text-gray-900 text-2xl tracking-tight leading-none mb-3 group-hover:text-pink-600 transition-colors">{serviceLabel}</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                        <User size={14} className="text-gray-400" />
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{professional}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-300" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.appointment_time || '--:--'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Investimento</p>
                    <p className="font-black text-gray-900 text-2xl tracking-tighter">R$ {Number(order.final_price || 0).toFixed(2)}</p>
                    <p className={`inline-flex mt-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase ${statusClass[visualStatus] || 'text-gray-500 bg-gray-50'}`}>
                      {statusLabel[visualStatus] || visualStatus}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl shadow-sm border bg-pink-50 text-pink-600 border-pink-100">
                    <Scissors size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-8 border-t border-gray-50">
                {canRate ? (
                  <button
                    onClick={() => handleRate(order)}
                    className="flex items-center justify-center gap-2 py-5 bg-slate-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    <Star size={16} className="fill-current text-amber-400" /> Avaliar Experiencia
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-5 bg-gray-50 text-gray-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    <CheckCircle size={16} /> Avaliacao indisponivel
                  </div>
                )}

                <button className="flex items-center justify-center gap-2 py-5 bg-gray-50 text-gray-600 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-inner">
                  <Repeat size={16} /> Repetir Servico
                </button>
                <button className="flex items-center justify-center gap-2 py-5 bg-white border border-transparent text-gray-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                  <MessageSquare size={16} /> Suporte
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showRatingModal && selectedItem && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 blur-3xl rounded-full -mr-12 -mt-12"></div>
            <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner relative z-10">
              <Star size={48} className="fill-current" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Como foi sua experiencia?</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">{selectedItem.service.name}</p>

            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setSelectedRating(star)} className={`${star <= selectedRating ? 'text-amber-500' : 'text-gray-200'} transition-all transform hover:scale-125`}>
                  <Star size={36} className="fill-current" />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos o que voce mais gostou..."
              className="w-full p-6 bg-gray-50 border-none rounded-[2rem] text-sm font-medium mb-10 focus:ring-2 focus:ring-pink-600 resize-none h-32"
            />

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowRatingModal(false)} className="py-5 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={submitRating} className="py-5 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 active:scale-95 transition-all">
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
