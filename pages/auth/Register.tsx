import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, ArrowRight, Phone, MapPin, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS, AVAILABLE_CITIES } from '../../constants';
import { authService } from '../../services/api';

interface RegisterProps {
  onBack: () => void;
  onSuccess: (email?: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const goNextStep = () => {
    if (step === 1 && !city) {
      setError('Selecione uma cidade antes de continuar.');
      return;
    }
    if (step === 2 && (!name || !email || !phone)) {
      setError('Preencha nome, e-mail e telefone.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isLoading) return;
    e.preventDefault();

    if (step < 3) {
      goNextStep();
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao conferem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('city', city);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await authService.register(formData);
      const isSuccessStatus = response.status >= 200 && response.status < 300;
      const isSuccessPayload = Boolean(response.data?.success);

      if (isSuccessStatus || isSuccessPayload) {
        setSuccess(response.data?.message || 'Cadastro realizado. Verifique seu e-mail para confirmar a conta.');
        setTimeout(() => onSuccess(email), 900);
      } else {
        setError(response.data?.message || 'Nao foi possivel concluir o cadastro.');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err?.response || err);
      const backendMessage = err?.response?.data?.message;
      const emailVerificationRequired = Boolean(err?.response?.data?.emailVerificationRequired);
      if (emailVerificationRequired) {
        setSuccess(backendMessage || 'Cadastro pendente de confirmacao. Verifique sua caixa de e-mail.');
        setTimeout(() => onSuccess(email), 900);
        return;
      }
      const fallback = err?.message || 'Erro ao registrar usuario.';
      setError(backendMessage || fallback);
    } finally {
      setIsLoading(false);
    }
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
            {step === 1 ? 'Selecione sua cidade' : step === 2 ? 'Dados basicos' : 'Seguranca e avatar'}
          </p>

          <div className="flex gap-2 mb-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 font-semibold text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cidades disponiveis</label>
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c);
                        setError(null);
                      }}
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
              </div>
            ) : step === 2 ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nome completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Como quer ser chamado?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Minimo 6 caracteres"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmar senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-gray-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Foto de perfil (opcional)</label>
                  <label className="w-full p-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200 flex items-center gap-3 cursor-pointer hover:border-rose-300 transition-colors">
                    <ImageIcon className="text-gray-400" size={18} />
                    <span className="text-sm font-semibold text-gray-600 truncate">
                      {avatarFile ? avatarFile.name : 'Selecionar imagem'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </>
            )}

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
                  {step < 3 ? 'Continuar' : 'Finalizar cadastro'}
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

export default Register;

