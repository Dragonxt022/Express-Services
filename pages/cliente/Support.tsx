
import React from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronRight, Search } from 'lucide-react';

const faqs = [
  { q: 'Como cancelo um agendamento?', a: 'Você pode cancelar diretamente na aba Histórico com até 2h de antecedência sem taxas.' },
  { q: 'Quais as formas de pagamento?', a: 'Aceitamos Pix, Cartão de Crédito e Débito via Mercado Pago com split automático.' },
  { q: 'Como me tornar um parceiro?', a: 'Entre em contato com nossa equipe comercial pelo e-mail suporte@belezaexpress.com.' },
  { q: 'Tive um problema no atendimento, o que fazer?', a: 'Utilize o botão de report no histórico do pedido para abrirmos uma mediação.' },
];

const Support: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-[#E11D48] mx-auto shadow-inner">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Como podemos ajudar?</h1>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Busque por dúvidas ou termos..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#E11D48] transition-all font-medium"
          />
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs px-2">Principais dúvidas</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-[#E11D48]/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-gray-800 tracking-tight">{faq.q}</h4>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#E11D48] transition-transform" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center gap-4 p-6 bg-[#25D366] text-white rounded-[2rem] shadow-xl shadow-green-100 hover:scale-[1.02] transition-all">
          <MessageCircle size={28} fill="currentColor" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Suporte 24h</p>
            <p className="text-lg font-black tracking-tight">Via WhatsApp</p>
          </div>
        </button>
        <button className="flex items-center gap-4 p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-100 hover:scale-[1.02] transition-all">
          <Mail size={28} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Envie um</p>
            <p className="text-lg font-black tracking-tight">E-mail para nós</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Support;
