
import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../constants';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 2000);
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-100">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">E-mail enviado!</h1>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
              Enviamos um link de recuperação para <span className="text-gray-900 font-bold">{email}</span>. 
              Verifique sua caixa de entrada e spam.
            </p>

            <button
              onClick={onBack}
              className="w-full py-6 rounded-[1.8rem] font-black text-white shadow-xl shadow-emerald-100 text-lg hover:scale-[1.02] transition-all active:scale-95"
              style={{ backgroundColor: '#10B981' }}
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <button 
            onClick={onBack}
            className="mb-8 p-3 rounded-2xl bg-slate-50 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Esqueceu a senha?</h1>
          <p className="text-gray-500 mb-10 font-medium">Não se preocupe, vamos te ajudar a recuperar o acesso.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail cadastrado</label>
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
                  Enviar Instruções
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
