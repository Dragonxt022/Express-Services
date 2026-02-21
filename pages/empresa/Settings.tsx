import React, { useEffect, useState } from 'react';
import { Save, Clock, CreditCard, Share2, Power } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { companiesService } from '../../services/api';

const DAYS_OF_WEEK = [
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terca' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
  { id: 'sab', label: 'Sabado' },
  { id: 'dom', label: 'Domingo' }
];

const DEFAULT_BUSINESS_HOURS: Record<string, { open: string; close: string; active: boolean }> = {
  seg: { open: '09:00', close: '18:00', active: true },
  ter: { open: '09:00', close: '18:00', active: true },
  qua: { open: '09:00', close: '18:00', active: true },
  qui: { open: '09:00', close: '18:00', active: true },
  sex: { open: '09:00', close: '20:00', active: true },
  sab: { open: '09:00', close: '14:00', active: true },
  dom: { open: '00:00', close: '00:00', active: false }
};

const DEFAULT_PAYMENTS = {
  pix: true,
  credit: true,
  debit: true,
  money: true
};

const DEFAULT_SOCIAL = {
  whatsapp: '',
  instagram: '',
  website: ''
};

const EmpresaSettings: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [businessHours, setBusinessHours] = useState(DEFAULT_BUSINESS_HOURS);
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS);
  const [social, setSocial] = useState(DEFAULT_SOCIAL);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        const response = await companiesService.getMySettings();
        const settings = response.data?.settings || {};

        setBusinessHours({
          ...DEFAULT_BUSINESS_HOURS,
          ...(settings.businessHours || {})
        });
        setPayments({
          ...DEFAULT_PAYMENTS,
          ...(settings.payments || {})
        });
        setSocial({
          ...DEFAULT_SOCIAL,
          ...(settings.social || {})
        });
        setIsOpen(settings.isOpen !== undefined ? Boolean(settings.isOpen) : true);
      } catch (error: any) {
        console.error('Erro ao carregar configuracoes da empresa:', error);
        showFeedback('error', error.response?.data?.message || 'Nao foi possivel carregar as configuracoes.');
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [showFeedback]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await companiesService.updateMySettings({
        businessHours,
        payments,
        social,
        isOpen
      });
      showFeedback('success', 'Configuracoes atualizadas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configuracoes da empresa:', error);
      showFeedback('error', error.response?.data?.message || 'Nao foi possivel salvar as configuracoes.');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, desc }: any) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900 leading-none tracking-tight">{title}</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">{desc}</p>
      </div>
    </div>
  );

  if (loadingSettings) {
    return (
      <div className="max-w-4xl mx-auto pb-24">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">Carregando configuracoes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configuracoes da Unidade</h1>
          <p className="text-gray-500 font-medium">Personalize como os clientes interagem com seu negocio.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-pink-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Save size={20} /> {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Power size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Loja {isOpen ? 'Aberta' : 'Fechada'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Controla disponibilidade imediata no app cliente
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              isOpen ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isOpen ? 'Fechar Loja' : 'Abrir Loja'}
          </button>
        </section>

        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <SectionHeader icon={Clock} title="Expediente" desc="Horarios de Atendimento" />
          <div className="space-y-3 flex-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 group hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={businessHours[day.id].active}
                    onChange={(e) =>
                      setBusinessHours({
                        ...businessHours,
                        [day.id]: { ...businessHours[day.id], active: e.target.checked }
                      })
                    }
                    className="w-5 h-5 accent-pink-600 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700 w-20">{day.label}</span>
                </div>
                {businessHours[day.id].active ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={businessHours[day.id].open}
                      onChange={(e) =>
                        setBusinessHours({
                          ...businessHours,
                          [day.id]: { ...businessHours[day.id], open: e.target.value }
                        })
                      }
                      className="bg-white border-none px-2 py-1 rounded-lg text-xs font-black text-gray-800"
                    />
                    <span className="text-gray-300 font-black">-</span>
                    <input
                      type="time"
                      value={businessHours[day.id].close}
                      onChange={(e) =>
                        setBusinessHours({
                          ...businessHours,
                          [day.id]: { ...businessHours[day.id], close: e.target.value }
                        })
                      }
                      className="bg-white border-none px-2 py-1 rounded-lg text-xs font-black text-gray-800"
                    />
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest px-4">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <SectionHeader icon={CreditCard} title="Pagamentos" desc="Formas de Recebimento" />
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(payments).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setPayments({ ...payments, [key]: !value })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    value ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-50 bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                  <span className="text-xs font-bold mt-1">{value ? 'Ativado' : 'Inativo'}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <SectionHeader icon={Share2} title="Canais" desc="Contato e Redes" />
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">WhatsApp</label>
                <input
                  type="text"
                  value={social.whatsapp}
                  onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Instagram</label>
                <input
                  type="text"
                  value={social.instagram}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Website</label>
                <input
                  type="text"
                  value={social.website}
                  onChange={(e) => setSocial({ ...social, website: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmpresaSettings;
