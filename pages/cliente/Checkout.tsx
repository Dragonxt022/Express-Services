
import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, QrCode, Copy, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { appointmentsService, ordersService } from '../../services/api';
import { storage } from '../../utils/storage';
import { validateCoupon } from '../../utils/customerData';

interface CheckoutProps {
  onConfirm: () => void;
  onBack: () => void;
  services: any[];
  bookingDetails: any;
}

// Fixed: Component was complete but file was truncated in provided context
const PixModal: React.FC<{ onConfirm: () => void, onCancel: () => void, price: number }> = ({ onConfirm, onCancel, price }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [isConfirming, setIsConfirming] = useState(false);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136be-express-uuid-v4-payment-key-2024');
    showFeedback('success', 'CÃ³digo Pix copiado!');
  };

  const handlePaid = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      onConfirm();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in slide-in-from-bottom-12 duration-500 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
          <div 
            className="h-full bg-pink-600 transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / 300) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center mb-8 pt-2">
          <div className="flex items-center gap-2 text-pink-600">
            <Clock size={16} className="animate-pulse" />
            <span className="text-sm font-black font-mono">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 relative group">
           <QrCode size={180} className="mx-auto text-slate-800 opacity-90 group-hover:scale-105 transition-transform duration-500" />
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-[2.5rem]">
              <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Ampliar QR Code</span>
           </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Pague com Pix</h2>
        <p className="text-gray-400 text-xs font-medium mb-8">Escaneie o cÃ³digo acima ou copie o cÃ³digo abaixo para pagar.</p>

        <button 
          onClick={handleCopyPix}
          className="w-full flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl mb-8 group hover:bg-gray-100 transition-all"
        >
          <span className="text-[10px] font-mono text-gray-400 truncate pr-4">00020126580014BR.GOV.BCB.PIX...</span>
          <Copy size={18} className="text-pink-600 group-active:scale-90 transition-transform" />
        </button>

        <div className="space-y-3">
          <button 
            onClick={handlePaid}
            disabled={isConfirming}
            className="w-full py-5 bg-pink-600 text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-rose-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isConfirming ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Validando...
              </>
            ) : (
              'JÃ¡ realizei o pagamento'
            )}
          </button>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Pagamento via Mercado Pago Split</p>
        </div>
      </div>
    </div>
  );
};

// Fixed: Added missing logic and default export to fix "has no default export" error in App.tsx
const Checkout: React.FC<CheckoutProps> = ({ onConfirm, onBack, services, bookingDetails }) => {
  const { showFeedback } = useFeedback();
  const [method, setMethod] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = services.reduce((acc, s) => acc + s.price, 0);
  const total = Math.max(0, subtotal - discount);

  const getCurrentUserId = () => {
    const sessionUser = storage.get<{ id?: string | number } | null>('session', null);
    const numericId = Number(sessionUser?.id);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  };

  const getCurrentUser = () => {
    return storage.get<{ id?: string | number; name?: string; phone?: string } | null>('session', null);
  };

  const toScheduledAt = (date: string, time: string) => {
    const safeDate = date || new Date().toISOString().split('T')[0];
    const safeTime = time || '09:00';
    return new Date(`${safeDate}T${safeTime}:00`).toISOString();
  };

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponCode, subtotal);
    if (!result.valid) {
      setAppliedCouponCode(null);
      setDiscount(0);
      setError(result.message || 'Nao foi possivel aplicar o cupom.');
      showFeedback('error', result.message || 'Cupom invalido.');
      return;
    }

    setError(null);
    setAppliedCouponCode(result.coupon?.code || couponCode.trim().toUpperCase());
    setDiscount(result.discount);
    showFeedback('success', `Cupom aplicado: ${result.coupon?.code || couponCode.trim().toUpperCase()}`);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCouponCode(null);
    setDiscount(0);
    setError(null);
  };

  const processCheckout = async (paymentMethod: 'credit_card' | 'pix') => {
    try {
      setError(null);
      setIsProcessing(true);

      const customerId = getCurrentUserId();
      if (!customerId) {
        setError('Sessão inválida. Faça login novamente para continuar.');
        showFeedback('error', 'Sessão inválida. Faça login novamente.');
        return;
      }

      const companyId = Number(bookingDetails.company?.id);
      const serviceIds = services
        .map((s) => Number(s.id))
        .filter((id) => Number.isFinite(id) && id > 0);
      if (!serviceIds.length) {
        setError('Nenhum serviço válido selecionado.');
        return;
      }

      const currentUser = getCurrentUser();
      const appointmentPayload = {
        customer_id: customerId,
        company_id: Number.isFinite(companyId) && companyId > 0 ? companyId : 1,
        professional_id: Number(bookingDetails?.professional?.id) || null,
        address_id: bookingDetails?.location === 'domicilio' ? Number(bookingDetails?.address?.id) || null : null,
        client_name: currentUser?.name || bookingDetails?.professional?.name || 'Cliente',
        client_phone: currentUser?.phone || null,
        scheduled_at: toScheduledAt(bookingDetails?.date, bookingDetails?.time),
        time: bookingDetails?.time || null,
        service_location: bookingDetails?.location || 'presencial',
        booking_mode: bookingDetails?.bookingMode || 'scheduled',
        price: subtotal,
        duration: services.reduce((sum, item) => sum + Number(item.duration || 0), 0),
        services: serviceIds
      };

      const appointmentResponse = await appointmentsService.create(appointmentPayload);
      const appointmentId = Number(appointmentResponse.data?.appointment?.id);

      const orderData = {
        customer_id: customerId,
        company_id: Number.isFinite(companyId) && companyId > 0 ? companyId : 1,
        appointment_id: Number.isFinite(appointmentId) ? appointmentId : null,
        total_price: subtotal,
        discount: discount,
        payment_method: paymentMethod,
        status: 'confirmed',
        notes: appliedCouponCode ? `Cupom aplicado: ${appliedCouponCode}` : undefined
      };

      const response = await ordersService.create(orderData);

      if (response.data?.success || response.data?.id) {
        showFeedback('success', 'Pagamento processado com sucesso!');
        setTimeout(() => {
          onConfirm();
        }, 1500);
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao processar pagamento:', err);
      setError(err.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
      showFeedback('error', 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (method === 'pix') {
      setShowPixModal(true);
      return;
    }
    await processCheckout('credit_card');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Pagamento</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Seguro via Mercado Pago</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumo do Pedido</h3>
        
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-50">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#E11D48] shadow-inner">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs leading-none mb-1">{service.name}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{service.duration} min</p>
                </div>
              </div>
              <span className="text-xs font-black text-gray-900 tracking-tighter">R$ {service.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mb-4 pb-4 border-b border-gray-50">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Local e HorÃ¡rio</p>
           <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-800">
                {bookingDetails.location === 'domicilio' ? 'A DomicÃ­lio' : 'Presencial'}
              </p>
              <p className="text-[10px] font-black text-pink-600 uppercase">
                {new Date(bookingDetails.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} â€¢ {bookingDetails.time}
              </p>
           </div>
           {bookingDetails.location === 'domicilio' && (
             <p className="text-[9px] text-gray-400 mt-1">{bookingDetails.address?.street}, {bookingDetails.address?.number}</p>
           )}
        </div>

        <div className="mb-4 pb-4 border-b border-gray-50">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Cupom</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Digite seu cupom"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleApplyCoupon}
              type="button"
              className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Aplicar
            </button>
          </div>
          {appliedCouponCode && (
            <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2">
              <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">{appliedCouponCode}</p>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-emerald-700 text-[10px] font-black uppercase tracking-widest"
              >
                Remover
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-green-500">
            <span>Desconto {appliedCouponCode ? `(${appliedCouponCode})` : ''}</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-gray-50">
            <span className="text-sm font-black text-gray-900 uppercase">Total a Pagar</span>
            <span className="text-3xl font-black text-[#E11D48] tracking-tighter">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Escolha o MÃ©todo</h3>
        
        <button 
          onClick={() => setMethod('card')}
          className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
            method === 'card' ? 'border-[#E11D48] bg-rose-50/30' : 'border-gray-100 bg-white opacity-60'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className={`p-2.5 rounded-xl ${method === 'card' ? 'bg-[#E11D48] text-white shadow-lg shadow-rose-100' : 'bg-gray-100 text-gray-400'}`}>
              <CreditCard size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none mb-1 text-sm">CartÃ£o de CrÃ©dito</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Visa Final 4432</p>
            </div>
          </div>
          {method === 'card' && <div className="w-4 h-4 bg-[#E11D48] rounded-full border-2 border-white shadow-sm"></div>}
        </button>

        <button 
          onClick={() => setMethod('pix')}
          className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${
            method === 'pix' ? 'border-[#E11D48] bg-rose-50/30' : 'border-gray-100 bg-white opacity-60'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className={`p-2.5 rounded-xl ${method === 'pix' ? 'bg-[#E11D48] text-white shadow-lg shadow-rose-100' : 'bg-gray-100 text-gray-400'}`}>
              <QrCode size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none mb-1 text-sm">Pix (Split InstantÃ¢neo)</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ConfirmaÃ§Ã£o em tempo real</p>
            </div>
          </div>
          {method === 'pix' && <div className="w-4 h-4 bg-[#E11D48] rounded-full border-2 border-white shadow-sm"></div>}
        </button>
      </div>

      <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 mb-4">
        <ShieldCheck className="text-[#E11D48]" size={32} />
        <p className="text-xs font-medium text-gray-500 leading-tight">
          Suas informaÃ§Ãµes estÃ£o seguras. O pagamento serÃ¡ processado e o agendamento confirmado imediatamente.
        </p>
      </div>

      <button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-6 bg-[#E11D48] text-white rounded-[2rem] font-black text-xl shadow-xl shadow-rose-100 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            Processando Split...
          </>
        ) : (
          <>{method === 'pix' ? 'Gerar QR Code Pix' : 'Finalizar Pagamento'} <ArrowRight size={24} /></>
        )}
      </button>

      {showPixModal && (
        <PixModal 
          onConfirm={async () => {
            setShowPixModal(false);
            await processCheckout('pix');
          }} 
          onCancel={() => setShowPixModal(false)} 
          price={total} 
        />
      )}
    </div>
  );
};

export default Checkout;



