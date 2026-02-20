import React, { useState } from 'react';
import { Lock, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS } from '../../constants';
import { companiesService } from '../../services/api';
import { UserRole } from '../../types';

interface CompanyInviteSetupProps {
  token: string;
  onActivated: (role: UserRole, token: string, user: any) => void;
}

const CompanyInviteSetup: React.FC<CompanyInviteSetupProps> = ({ token, onActivated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) {
      setError('As senhas nao conferem.');
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError('Aceite os termos e a politica para continuar.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await companiesService.acceptInvite({
        token,
        password,
        confirmPassword,
        acceptTerms,
        acceptPrivacy
      });

      if (response.data?.success && response.data?.token && response.data?.user) {
        onActivated(UserRole.EMPRESA, response.data.token, response.data.user);
      } else {
        setError('Nao foi possivel ativar a conta empresarial.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao ativar conta da empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mb-6 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck size={30} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Ativar conta da empresa</h1>
          <p className="text-gray-500 mb-8 font-medium">Aceite os termos e defina sua senha de acesso.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Minimo 6 caracteres"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" />
              <span className="text-sm font-medium text-gray-700">
                Aceito os <span className="font-black">Termos de Uso</span>.
              </span>
              <FileText size={16} className="text-gray-400 mt-1 ml-auto" />
            </label>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
              <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-1" />
              <span className="text-sm font-medium text-gray-700">
                Aceito a <span className="font-black">Politica de Privacidade</span>.
              </span>
              <CheckCircle2 size={16} className="text-gray-400 mt-1 ml-auto" />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-[1.8rem] font-black text-white shadow-xl shadow-rose-100 text-lg hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: COLORS.primary }}
            >
              {isLoading ? 'Ativando conta...' : 'Ativar conta e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyInviteSetup;
