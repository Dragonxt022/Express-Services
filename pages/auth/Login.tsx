
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { COLORS } from '../../constants';
import { UserRole } from '../../types';
import { authService } from '../../services/api';
import { storage } from '../../utils/storage';

interface LoginProps {
  onLogin: (role: UserRole, token: string, user: any) => void;
  onNavigate: (view: 'register' | 'forgot_password') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('gabriel@email.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      
      if (response.data?.success && response.data?.token) {
        // Guardar token no localStorage
        storage.set('token', response.data.token);
        storage.set('user', response.data.user);
        
        // Mapear role para UserRole
        const roleMap: Record<string, UserRole> = {
          'CLIENTE': UserRole.CLIENTE,
          'EMPRESA': UserRole.EMPRESA,
          'ADMIN': UserRole.ADMIN,
        };
        
        const userRole = roleMap[response.data.user.role] || UserRole.CLIENTE;
        onLogin(userRole, response.data.token, response.data.user);
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 blur-3xl rounded-full -ml-12 -mb-12"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#E11D48] to-rose-700 flex items-center justify-center text-white mb-8 shadow-xl group hover:rotate-12 transition-transform">
            <span className="text-3xl font-black tracking-tighter">BE</span>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Bem-vindo de volta</h1>
          <p className="text-gray-500 mb-10 font-medium">Acesse sua conta para continuar</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                <button 
                  type="button"
                  onClick={() => onNavigate('forgot_password')}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-14 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
                  Entrar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              Não tem uma conta?{' '}
              <button 
                onClick={() => onNavigate('register')}
                className="text-rose-500 font-bold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
