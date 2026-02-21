import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { COLORS } from '../../constants';
import { UserRole } from '../../types';
import { authService } from '../../services/api';
import { storage } from '../../utils/storage';
import BrandLogo from '../../components/BrandLogo';

interface LoginProps {
  onLogin: (role: UserRole, token: string, user: any) => void;
  onNavigate: (view: 'register' | 'forgot_password') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('bruno@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.data?.success && response.data?.token) {
        storage.set('token', response.data.token);
        storage.set('user', response.data.user);

        const roleMap: Record<string, UserRole> = {
          CLIENTE: UserRole.CLIENTE,
          EMPRESA: UserRole.EMPRESA,
          ADMIN: UserRole.ADMIN
        };

        const userRole = roleMap[response.data.user.role] || UserRole.CLIENTE;
        onLogin(userRole, response.data.token, response.data.user);
      } else {
        setError('Credenciais invalidas. Tente novamente.');
      }
    } catch (err: any) {
      if (err.response?.data?.companyOnboardingRequired) {
        setError('Conta empresarial pendente. Acesse o link enviado por e-mail para ativar.');
      } else {
        setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
        <div className="mb-10">
          <BrandLogo imageClassName="h-16 w-auto" />
          <h1 className="mt-8 text-3xl font-black tracking-tight text-gray-900 text-center">Bem-vindo de volta</h1>
          <p className="mt-2 font-medium text-gray-500 text-center">Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">E-mail</label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <Mail className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-rose-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-[1.5rem] border border-gray-100 bg-slate-50 py-5 pl-12 pr-5 font-medium text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Senha</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot_password')}
                className="text-xs font-bold text-rose-500 transition-colors hover:text-rose-600"
              >
                Esqueceu?
              </button>
            </div>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <Lock className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-rose-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-[1.5rem] border border-gray-100 bg-slate-50 py-5 pl-12 pr-14 font-medium text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-[1.8rem] py-6 text-lg font-black text-white shadow-xl shadow-rose-100 transition-all active:scale-95 disabled:scale-100 disabled:opacity-70"
            style={{ backgroundColor: COLORS.primary }}
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <>
                Entrar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="font-medium text-gray-500">
            Nao tem uma conta?{' '}
            <button onClick={() => onNavigate('register')} className="font-bold text-rose-500 hover:underline">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
