
import React, { useState } from 'react';
import { Camera, MapPin, ArrowRight, Check, Sparkles, Home, Building2, Plus, ChevronDown } from 'lucide-react';
import { COLORS, AVAILABLE_CITIES } from '../../constants';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [address, setAddress] = useState({
    label: 'Casa',
    street: '',
    number: '',
    city: AVAILABLE_CITIES[0],
  });

  const handleComplete = () => {
    onComplete({ avatar, address });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-1.5">
              <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 1 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
              <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 2 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
              <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 3 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Passo {step} de 3</span>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Bem-vinda! ✨</h1>
              <p className="text-gray-500 mb-10 font-medium">Vamos deixar seu perfil com a sua cara. Adicione uma foto!</p>
              
              <div className="flex flex-col items-center mb-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-rose-100 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center relative z-10 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <Camera size={40} className="text-gray-300" />
                    )}
                  </div>
                  <button className="absolute bottom-[-10px] right-[-10px] p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform z-20 border-4 border-white">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                style={{ backgroundColor: COLORS.primary }}
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => setStep(2)} className="w-full mt-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-400 transition-colors">Pular por enquanto</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Onde você está? 📍</h1>
              <p className="text-gray-500 mb-10 font-medium">Adicione seu endereço principal para atendimentos a domicílio.</p>
              
              <div className="space-y-4 mb-10">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAddress({...address, label: 'Casa'})}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${address.label === 'Casa' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-white border-gray-50 text-gray-400'}`}
                  >
                    <Home size={18} /> <span className="text-xs font-black uppercase">Casa</span>
                  </button>
                  <button 
                    onClick={() => setAddress({...address, label: 'Trabalho'})}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${address.label === 'Trabalho' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-white border-gray-50 text-gray-400'}`}
                  >
                    <Building2 size={18} /> <span className="text-xs font-black uppercase">Trabalho</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="Rua / Avenida"
                  value={address.street}
                  onChange={e => setAddress({...address, street: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-rose-500 transition-all"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Número"
                    value={address.number}
                    onChange={e => setAddress({...address, number: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                  <div className="relative">
                    <select 
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                    >
                      {AVAILABLE_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                style={{ backgroundColor: COLORS.primary }}
              >
                Configurar Endereço <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
                <Sparkles size={40} fill="currentColor" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Tudo Pronto! 🚀</h1>
              <p className="text-gray-500 mb-10 font-medium">Sua conta foi configurada com sucesso. Agora é só brilhar!</p>
              
              <button
                onClick={handleComplete}
                className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                style={{ backgroundColor: COLORS.primary }}
              >
                Começar a Usar <Check size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
