
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, ArrowRight, Phone, MapPin } from 'lucide-react';
import { COLORS, AVAILABLE_CITIES } from '../../constants';

interface RegisterProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      onSuccess();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <button 
            onClick={step > 1 ? () => setStep(step - 1) : onBack}
            className="mb-8 p-3 rounded-2xl bg-slate-50 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Crie sua conta</h1>
          <p className="text-gray-500 mb-10 font-medium">
            {step === 1 ? 'Selecione sua cidade' : step === 2 ? 'Dados básicos' : 'Segurança'}
          </p>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cidades Disponíveis</label>
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        city === c ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-white border-gray-50 text-gray-400 hover:border-pink-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className={city === c ? 'text-rose-500' : 'text-gray-300'} />
                        <span className="font-black text-sm uppercase tracking-widest">{c}</span>
                      </div>
                      {city === c && <div className="w-2 h-2 bg-rose-500 rounded-full"></div>}
                    </button>
                  ))}
                </div>
                {city && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full mt-6 py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Continuar <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : step === 2 ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      placeholder="Como quer ser chamado?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium px-1 mt-2">
                  Use letras, números e símbolos para uma senha mais forte.
                </p>
              </div>
            )}

            {step > 1 && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                style={{ backgroundColor: COLORS.primary }}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {step === 2 ? 'Continuar' : 'Finalizar Cadastro'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </form>

          <p className="mt-10 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Ao se cadastrar, você concorda com nossos <br />
            <span className="text-gray-600 underline cursor-pointer">Termos de Uso</span> e <span className="text-gray-600 underline cursor-pointer">Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
