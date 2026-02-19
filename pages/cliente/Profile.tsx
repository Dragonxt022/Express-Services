
import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Bell, ChevronRight, LogOut, Camera, Star, Award, Gift, Trophy, Zap, Target, MapPin, CreditCard, Plus, Check, Trash2 } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { Address, PaymentCard } from '../../types';
import AddressForm from './AddressForm';

const ClienteProfile: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments'>('profile');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Gabriel Oliveira',
    email: 'gabriel@email.com',
    phone: '(11) 99988-7766'
  });

  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Casa', street: 'Rua das Flores', number: '123', city: 'São Paulo', state: 'SP', isDefault: true },
    { id: '2', label: 'Trabalho', street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP', isDefault: false },
  ]);

  const [cards, setCards] = useState<PaymentCard[]>([
    { id: '1', brand: 'visa', last4: '4432', expiry: '12/28' },
    { id: '2', brand: 'mastercard', last4: '9901', expiry: '05/26' },
  ]);

  const xp = 2450;
  const nextLevelXp = 5000;
  const progress = (xp / nextLevelXp) * 100;

  const handleSaveAddress = (newAddr: Partial<Address>) => {
    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...a, ...newAddr } : a));
      showFeedback('success', 'Endereço atualizado!');
    } else {
      setAddresses([...addresses, newAddr as Address]);
      showFeedback('success', 'Endereço adicionado!');
    }
    setEditingAddress(null);
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddresses(addresses.filter(a => a.id !== id));
    showFeedback('info', 'Endereço removido');
  };

  const handleUpdate = () => {
    showFeedback('success', 'Perfil atualizado com sucesso!');
  };

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
        <Icon className="text-[#E11D48]" size={20} />
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">{title}</h3>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );

  if (isAddingAddress || editingAddress) {
    return (
      <AddressForm 
        onBack={() => {
          setIsAddingAddress(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress || undefined}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-in slide-in-from-bottom-8 duration-500">
      {/* Header Profile */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E11D48] to-rose-300 rounded-[2.5rem] blur-xl opacity-20"></div>
          <img 
            src={`https://ui-avatars.com/api/?name=${formData.name}&background=E11D48&color=fff&size=200`} 
            className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-white relative z-10" 
            alt="Avatar" 
          />
          <button className="absolute bottom-[-10px] right-[-10px] p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform z-20 border-4 border-white">
            <Camera size={20} />
          </button>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formData.name}</h2>
        <div className="flex items-center gap-2 mt-2">
           <span className="bg-[#E11D48] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-200">Diamond Member</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-3xl border border-gray-100 mb-10 shadow-sm">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Meus Dados
        </button>
        <button 
          onClick={() => setActiveTab('addresses')}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'addresses' ? 'bg-slate-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Endereços
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Pagamento
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
          {/* Loyalty Card */}
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white mb-10 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E11D48]/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Status de Recompensas</p>
                  <h4 className="text-3xl font-black tracking-tighter">Sua Jornada</h4>
                </div>
                <Trophy className="text-[#E11D48]" size={32} />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end mb-2 px-2">
                   <div className="flex items-center gap-2">
                     <span className="text-2xl font-black">{xp.toLocaleString()}</span>
                     <span className="text-xs font-bold text-slate-400 uppercase">XP</span>
                   </div>
                   <span className="text-[10px] font-black text-[#E11D48] uppercase tracking-widest">Próximo Nível: 5.000 XP</span>
                </div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                   <div className="h-full bg-[#E11D48] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(225,29,72,0.6)]" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                   <Zap size={18} className="mx-auto mb-2 text-amber-400" />
                   <p className="text-xl font-black">12</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Serviços</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                   <Award size={18} className="mx-auto mb-2 text-blue-400" />
                   <p className="text-xl font-black">08</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Badges</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                   <Gift size={18} className="mx-auto mb-2 text-emerald-400" />
                   <p className="text-xl font-black">R$ 45</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Economizado</p>
                </div>
              </div>
            </div>
          </div>

          <Section icon={User} title="Dados Pessoais">
            <div className="space-y-4">
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="email" 
                  value={formData.email}
                  readOnly
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-300 cursor-not-allowed"
                />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
                />
              </div>
              <button onClick={handleUpdate} className="w-full mt-4 py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-black transition-all">
                Salvar Alterações
              </button>
            </div>
          </Section>
        </>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="flex justify-between items-center px-4 mb-2">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Meus Locais Salvos</h3>
             <button 
              onClick={() => setIsAddingAddress(true)}
              className="flex items-center gap-2 text-[#E11D48] font-black text-[10px] uppercase tracking-widest"
             >
               <Plus size={14} /> Adicionar
             </button>
          </div>
          {addresses.map(addr => (
            <div 
              key={addr.id} 
              onClick={() => setEditingAddress(addr)}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-pink-200 transition-all cursor-pointer"
            >
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${addr.isDefault ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-gray-900 text-lg leading-none">{addr.label}</h4>
                      {addr.isDefault && <Check size={14} className="text-pink-600" />}
                    </div>
                    <p className="text-xs font-medium text-gray-400 mt-1">{addr.street}, {addr.number} • {addr.city}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                  onClick={(e) => handleDeleteAddress(addr.id, e)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
                 <ChevronRight size={20} className="text-gray-200 group-hover:text-pink-600 transition-colors" />
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="flex justify-between items-center px-4 mb-2">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Carteira Digital</h3>
             <button className="flex items-center gap-2 text-[#E11D48] font-black text-[10px] uppercase tracking-widest"><Plus size={14} /> Novo Cartão</button>
          </div>
          {cards.map(card => (
            <div key={card.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-pink-200 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-[8px] uppercase tracking-widest">
                    {card.brand}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg leading-none">•••• {card.last4}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Expira em {card.expiry}</p>
                  </div>
               </div>
               <ChevronRight size={20} className="text-gray-200 group-hover:text-pink-600 transition-colors" />
            </div>
          ))}
          <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
               <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-emerald-800 font-black text-sm">Pix Split Ativo</p>
              <p className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Cashback instantâneo via Mercado Pago</p>
            </div>
          </div>
        </div>
      )}

      <button className="w-full mt-10 flex items-center justify-between p-6 bg-red-50 rounded-[2rem] text-red-600 font-black group hover:bg-red-100 transition-all">
        <div className="flex items-center gap-3">
          <LogOut size={20} />
          <span className="text-sm uppercase tracking-widest">Encerrar Sessão</span>
        </div>
        <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
      </button>
    </div>
  );
};

export default ClienteProfile;
