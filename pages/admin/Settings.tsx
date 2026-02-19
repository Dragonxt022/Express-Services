
import React, { useState } from 'react';
import { Save, Palette, Mail, Shield, Globe, Bell } from 'lucide-react';
import { COLORS } from '../../constants';

const AdminSettings: React.FC = () => {
  const [appName, setAppName] = useState('BelezaExpress');
  const [royalty, setRoyalty] = useState(15);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações Globais</h1>
          <p className="text-gray-500">Ajuste os parâmetros fundamentais da sua plataforma.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all">
          <Save size={20} />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identidade Visual */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="text-pink-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Identidade & Marca</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Nome da Plataforma</label>
              <input 
                type="text" 
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-pink-500 mt-2 font-medium" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Cor Primária</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: COLORS.primary }}></div>
                  <input type="text" value={COLORS.primary} readOnly className="flex-1 px-4 py-2 bg-gray-50 border-transparent rounded-xl text-xs font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Favicon</label>
                <button className="w-full mt-2 px-4 py-2 bg-slate-50 border border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:bg-slate-100 transition-colors">
                  Upload .ico
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Financeiro & Taxas */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Regras de Negócio</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Royalty Padrão (%)</label>
              <div className="flex items-center gap-4 mt-2">
                <input 
                  type="range" 
                  min="0" max="30" step="1"
                  value={royalty}
                  onChange={e => setRoyalty(parseInt(e.target.value))}
                  className="flex-1 accent-pink-600"
                />
                <span className="w-12 text-center font-black text-pink-600">{royalty}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-800 text-sm">Aprovação Automática</p>
                <p className="text-xs text-gray-400">Novas empresas entram como pendente.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Comunicação */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="text-amber-500" size={24} />
            <h3 className="text-lg font-bold text-gray-800">E-mail (SMTP)</h3>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Host SMTP (ex: smtp.gmail.com)" className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium" />
            <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="Porta (ex: 587)" className="px-5 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium" />
               <input type="password" placeholder="Senha do App" className="px-5 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium" />
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Segurança & Sessão</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-800 text-sm">Log de Auditoria</p>
                <p className="text-xs text-gray-400">Manter logs por 90 dias.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <button className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors text-sm">
              Limpar Cache do Sistema
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
