import React from 'react';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { COLORS } from '../../constants';

interface RegisterSuccessProps {
  email?: string;
  onBackToLogin: () => void;
}

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ email, onBackToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-[2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Cadastro realizado com sucesso</h1>
          <p className="text-gray-500 font-medium mb-8">
            Verifique sua caixa de e-mail para confirmar sua conta.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Mail className="text-rose-500 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">E-mail cadastrado</p>
                <p className="text-sm font-semibold text-gray-800 break-all">{email || 'Seu e-mail'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full py-5 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
            style={{ backgroundColor: COLORS.primary }}
          >
            <ArrowLeft size={18} />
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
