
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Camera, Sparkles, Percent, Briefcase, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import { TeamMember } from '../../types';
import { storage } from '../../utils/storage';
import { maskPhone } from '../../utils/masks';
import { useFeedback } from '../../context/FeedbackContext';

interface StaffFormProps {
  staffId?: string | null;
  onBack: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ staffId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cabeleireiro',
    avatar: '',
    email: '',
    phone: '',
    cpf: '',
    commission: '0',
    commissionEnabled: false, // Desligado por padrão
    specialties: '',
    password: '',
    active: true
  });

  useEffect(() => {
    if (staffId) {
      const team = storage.get<TeamMember[]>('team_members', []);
      const member = team.find(m => m.id === staffId);
      if (member) {
        setFormData({
          name: member.name,
          role: member.role,
          avatar: member.avatar,
          email: member.email,
          phone: member.phone,
          cpf: member.cpf || '',
          commission: member.commission.toString(),
          commissionEnabled: member.commissionEnabled || false,
          specialties: member.specialties,
          password: '••••••••',
          active: member.active
        });
      }
    }
  }, [staffId]);

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role) {
      return showFeedback('error', 'Nome, E-mail e Cargo são obrigatórios.');
    }

    setLoading(true);
    setTimeout(() => {
      const team = storage.get<TeamMember[]>('team_members', []);
      
      const staffData: TeamMember = {
        id: staffId || Date.now().toString(),
        name: formData.name,
        role: formData.role,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        commission: parseFloat(formData.commission),
        commissionEnabled: formData.commissionEnabled,
        status: staffId ? (team.find(m => m.id === staffId)?.status || 'offline') : 'offline',
        active: formData.active,
        specialties: formData.specialties
      };

      if (staffId) {
        storage.set('team_members', team.map(m => m.id === staffId ? staffData : m));
      } else {
        storage.set('team_members', [...team, staffData]);
      }

      setLoading(false);
      showFeedback('success', 'Ficha do profissional atualizada!');
      setTimeout(onBack, 1000);
    }, 800);
  };

  const InputGroup = ({ label, children, icon: Icon }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Voltar para lista
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Ficha'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative group cursor-pointer mb-6">
              <img 
                src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&size=200`} 
                className="w-40 h-40 rounded-[3rem] object-cover shadow-2xl ring-4 ring-gray-50 group-hover:opacity-75 transition-opacity" 
                alt="Avatar" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={32} className="text-white drop-shadow-lg" />
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-400 uppercase">Perfil Ativo</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.active} 
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Percent size={14} className="text-pink-600" /> Regras de Comissão
              </h4>
              <button 
                onClick={() => setFormData({...formData, commissionEnabled: !formData.commissionEnabled})}
                className={`p-1 rounded-lg transition-colors ${formData.commissionEnabled ? 'text-pink-600' : 'text-gray-300'}`}
              >
                {formData.commissionEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>

            <div className={`transition-all duration-500 ${formData.commissionEnabled ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
              <input 
                type="number" 
                value={formData.commission}
                onChange={e => setFormData({...formData, commission: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-2xl text-pink-600 text-center focus:ring-2 focus:ring-pink-500" 
              />
              <p className="text-[10px] text-gray-400 text-center mt-3 font-medium uppercase tracking-tight leading-tight">
                Percentual sobre serviços. O split automático via Gateway só ocorrerá se este campo estiver ativo.
              </p>
            </div>
            {!formData.commissionEnabled && (
              <p className="text-[9px] text-center mt-4 text-amber-600 font-bold uppercase tracking-widest">Atualmente Desativado</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-slate-900 text-white rounded-2xl"><User size={24} /></div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Identidade & Contato</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputGroup label="Nome Completo *" icon={User}>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: João da Silva"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </InputGroup>
              </div>

              <InputGroup label="Cargo / Função" icon={Briefcase}>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option>Cabeleireiro</option>
                  <option>Barbeiro</option>
                  <option>Manicure</option>
                  <option>Esteticista</option>
                  <option>Recepcionista</option>
                  <option>Gerente</option>
                </select>
              </InputGroup>

              <InputGroup label="CPF (Opcional)">
                <input 
                  type="text" 
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </InputGroup>

              <InputGroup label="WhatsApp / Celular" icon={Phone}>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})}
                  placeholder="(00) 00000-0000"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </InputGroup>

              <InputGroup label="E-mail de Acesso *" icon={Mail}>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@profissional.com"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </InputGroup>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="grid grid-cols-1 gap-8">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Sparkles size={12} className="text-pink-600" /> Especialidades & Habilidades
                      </label>
                   </div>
                   <textarea 
                    value={formData.specialties}
                    onChange={e => setFormData({...formData, specialties: e.target.value})}
                    placeholder="Descreva as técnicas dominadas pelo profissional..."
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-medium text-gray-700 resize-none leading-relaxed focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div className="pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl"><Lock size={20} /></div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Segurança do Login</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup label="Senha do Painel">
                        <input 
                          type="password" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-800 focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                      </InputGroup>
                      <div className="flex items-end pb-1">
                         <p className="text-[9px] text-gray-400 font-medium uppercase leading-tight">
                           O profissional poderá usar este e-mail e senha para acessar apenas as funções de agenda delegadas a ele.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;
