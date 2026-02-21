import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Clock, Users, Sparkles, Camera, Trash2, CheckCircle2, Scissors } from 'lucide-react';
import { TeamMember } from '../../types';
import { geminiService } from '../../services/gemini';
import { useFeedback } from '../../context/FeedbackContext';
import { servicesService, teamMembersService } from '../../services/api';

interface ServiceFormProps {
  serviceId?: string | null;
  companyId?: string | null;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 1, name: 'Cabelo' },
  { id: 2, name: 'Unhas' },
  { id: 3, name: 'Limpeza' },
  { id: 4, name: 'Barba' },
  { id: 5, name: 'Massagem' },
  { id: 6, name: 'Pet' }
];

const categoryNameToId = (name: string) => CATEGORIES.find((c) => c.name === name)?.id || null;

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, companyId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showFeedback } = useFeedback();

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cabelo',
    price: '',
    durationHours: '0',
    durationMinutes: '45',
    preparationTime: '15',
    description: '',
    image: '',
    attendanceMode: 'ambos' as 'presencial' | 'domicilio' | 'ambos',
    allowScheduling: true,
    assignedProfessionals: [] as string[],
    active: true
  });

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;

      try {
        setLoadingData(true);

        const teamRes = await teamMembersService.getByCompany(Number(companyId), { includeInactive: true });
        const apiTeam = teamRes.data?.teamMembers || [];
        setTeam(
          apiTeam
            .filter((member: any) => member.active)
            .map((member: any) => ({
              id: String(member.id),
              name: member.name || '',
              role: member.role || '',
              avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Profissional')}`,
              status: member.status || 'offline',
              email: member.email || '',
              phone: member.phone || '',
              commission: Number(member.commission || 0),
              commissionEnabled: Boolean(member.commission_enabled),
              specialties: member.specialties || '',
              active: Boolean(member.active),
              cpf: member.cpf || ''
            }))
        );

        if (serviceId) {
          const serviceRes = await servicesService.getById(Number(serviceId), { includeInactive: true } as any);
          const service = serviceRes.data?.service || serviceRes.data;
          if (service) {
            const durationTotal = Number(service.duration || 0);
            const h = Math.floor(durationTotal / 60);
            const m = durationTotal % 60;
            const category = service.category_name || CATEGORIES.find((c) => c.id === Number(service.category_id))?.name || 'Cabelo';

            setFormData({
              name: service.name || '',
              category,
              price: String(service.price || ''),
              durationHours: String(h),
              durationMinutes: String(m),
              preparationTime: String(service.preparation_time || 0),
              description: service.description || '',
              image: service.image || '',
              attendanceMode: service.attendance_mode || 'ambos',
              allowScheduling: service.allow_scheduling !== false,
              assignedProfessionals: (service.assigned_professionals || []).map((id: any) => String(id)),
              active: Boolean(service.active)
            });
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados do formulario de servico:', error);
        showFeedback('error', error.response?.data?.message || 'Nao foi possivel carregar os dados do servico.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [companyId, serviceId, showFeedback]);

  const handleToggleProfessional = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedProfessionals: prev.assignedProfessionals.includes(id)
        ? prev.assignedProfessionals.filter((pId) => pId !== id)
        : [...prev.assignedProfessionals, id]
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return showFeedback('error', 'De um nome ao servico para a IA criar a descricao.');
    setIsGenerating(true);
    const desc = await geminiService.generateServiceDescription(formData.name, formData.category);
    setFormData((prev) => ({ ...prev, description: desc }));
    setIsGenerating(false);
    showFeedback('success', 'Descricao gerada com IA!');
  };

  const handleSave = async () => {
    if (!companyId) {
      showFeedback('error', 'Empresa nao identificada para este servico.');
      return;
    }
    if (!formData.name || !formData.price || formData.assignedProfessionals.length === 0) {
      return showFeedback('error', 'Preencha o nome, preco e selecione ao menos um profissional.');
    }

    const totalDuration = (parseInt(formData.durationHours || '0', 10) * 60) + parseInt(formData.durationMinutes || '0', 10);
    const categoryId = categoryNameToId(formData.category);

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: Number(formData.price),
        duration: totalDuration,
        preparation_time: Number(formData.preparationTime || 0),
        company_id: Number(companyId),
        category_id: categoryId,
        image: formData.image || `https://picsum.photos/400/300?random=${Math.random()}`,
        attendance_mode: formData.attendanceMode,
        allow_scheduling: formData.allowScheduling,
        assigned_professionals: formData.assignedProfessionals.map((id) => Number(id)),
        active: formData.active
      };

      if (serviceId) {
        await servicesService.update(Number(serviceId), payload);
      } else {
        await servicesService.create(payload);
      }

      showFeedback('success', 'Servico salvo com sucesso!');
      setTimeout(onBack, 800);
    } catch (error: any) {
      console.error('Erro ao salvar servico:', error);
      showFeedback('error', error.response?.data?.message || 'Nao foi possivel salvar o servico.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto pb-24">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">Carregando dados do servico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Voltar para lista
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-pink-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : <div className="flex items-center gap-2"><Save size={20} /> Salvar Servico</div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><Scissors size={24} /></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Detalhes do Servico</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Nome do Servico *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Botox Capilar Avancado"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Preco Final (R$)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Descricao Completa</label>
                  <button
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-tight hover:bg-pink-100 transition-colors"
                  >
                    <Sparkles size={12} /> {isGenerating ? 'Criando...' : 'Criar com IA'}
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Descreva os beneficios e o processo deste servico..."
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-medium text-gray-700 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Modalidade</label>
                  <select
                    value={formData.attendanceMode}
                    onChange={(e) => setFormData({ ...formData, attendanceMode: e.target.value as 'presencial' | 'domicilio' | 'ambos' })}
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800"
                  >
                    <option value="ambos">Presencial e domicilio</option>
                    <option value="presencial">Somente na empresa</option>
                    <option value="domicilio">Somente a domicilio</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-[1.25rem] px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Permite agendamento</p>
                    <p className="text-sm font-bold text-gray-800">Cliente escolhe data e horario</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowScheduling}
                    onChange={(e) => setFormData({ ...formData, allowScheduling: e.target.checked })}
                    className="w-5 h-5 accent-pink-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Tempo & Duracao</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Duracao Prevista</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                      className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl"
                    />
                    <span className="block text-center text-[9px] font-bold text-slate-400 uppercase mt-1">Horas</span>
                  </div>
                  <span className="text-2xl font-black text-slate-300">:</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl"
                    />
                    <span className="block text-center text-[9px] font-bold text-slate-400 uppercase mt-1">Minutos</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 leading-tight italic">
                  Tempo que o profissional ficara ocupado exclusivamente com o cliente.
                </p>
              </div>

              <div className="p-6 bg-amber-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 block mb-4">Tempo de Preparacao (Buffer)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl text-amber-600"
                  />
                  <span className="font-bold text-amber-600 tracking-tighter">min</span>
                </div>
                <p className="text-[11px] text-amber-700/60 mt-4 leading-tight">
                  Tempo para limpeza, esterilizacao ou deslocamento entre servicos. O horario seguinte ficara bloqueado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl"><Users size={20} /></div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Equipe Habilitada</h2>
            </div>

            <p className="text-xs text-gray-400 mb-6 font-medium">Selecione quem pode realizar este servico:</p>

            <div className="space-y-2">
              {team.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleToggleProfessional(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    formData.assignedProfessionals.includes(member.id)
                      ? 'border-teal-500 bg-teal-50/50'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <img src={member.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-none">{member.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{member.role}</p>
                  </div>
                  {formData.assignedProfessionals.includes(member.id) && (
                    <CheckCircle2 className="text-teal-600" size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Imagem do Servico</label>
            <div className="aspect-[4/3] w-full bg-gray-50 rounded-3xl overflow-hidden relative group border-2 border-dashed border-gray-200">
              {formData.image ? (
                <>
                  <img src={formData.image} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }); }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-[10px] font-black uppercase mt-2">Use URL da imagem abaixo</span>
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full mt-4 px-4 py-3 bg-gray-50 rounded-2xl border-none font-medium text-gray-700 focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-[10px] text-center text-gray-300 mt-4 leading-tight">
              Tamanho recomendado: 800x600px.<br />Formatos: JPG, PNG ou WEBP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
