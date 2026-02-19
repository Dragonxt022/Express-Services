
import React, { useState, useEffect } from 'react';
// Added missing Scissors icon import from lucide-react
import { ArrowLeft, Save, Clock, Users, Sparkles, Camera, Plus, Trash2, CheckCircle2, Scissors } from 'lucide-react';
import { Service, TeamMember } from '../../types';
import { storage } from '../../utils/storage';
import { geminiService } from '../../services/gemini';
import { useFeedback } from '../../context/FeedbackContext';

interface ServiceFormProps {
  serviceId?: string | null;
  onBack: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onBack }) => {
  const [loading, setLoading] = useState(false);
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
    assignedProfessionals: [] as string[],
    active: true
  });

  useEffect(() => {
    // Fix: Updated names and avatars to be only women
    const savedTeam = storage.get<TeamMember[]>('team_members', [
      { 
        id: '1', 
        name: 'Ana Paula', 
        role: 'Cabeleireira Master', 
        avatar: 'https://i.pravatar.cc/150?u=ana', 
        status: 'online',
        email: 'ana@elegance.com',
        phone: '(11) 98888-7777',
        commission: 40,
        commissionEnabled: true,
        specialties: 'Loiras, Cortes Femininos',
        active: true
      },
      { 
        id: '2', 
        name: 'Fernanda Lima', 
        role: 'Barbeira Specialist', 
        avatar: 'https://i.pravatar.cc/150?u=fernanda', 
        status: 'offline',
        email: 'fernanda@elegance.com',
        phone: '(11) 97777-6666',
        commission: 35,
        commissionEnabled: true,
        specialties: 'Barba Terapia, Visagismo',
        active: true
      },
      { 
        id: '3', 
        name: 'Juliana Lima', 
        role: 'Manicure & Pedicure', 
        avatar: 'https://i.pravatar.cc/150?u=juju', 
        status: 'online',
        email: 'juliana@elegance.com',
        phone: '(11) 96666-5555',
        commission: 30,
        commissionEnabled: true,
        specialties: 'Unhas Artísticas',
        active: true
      },
    ]);
    setTeam(savedTeam);

    if (serviceId) {
      const services = storage.get<Service[]>('services', []);
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const h = Math.floor(service.duration / 60);
        const m = service.duration % 60;
        setFormData({
          name: service.name,
          category: service.category,
          price: service.price.toString(),
          durationHours: h.toString(),
          durationMinutes: m.toString(),
          preparationTime: service.preparationTime.toString(),
          description: service.description || '',
          image: service.image,
          assignedProfessionals: service.assignedProfessionals,
          active: service.active
        });
      }
    }
  }, [serviceId]);

  const handleToggleProfessional = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedProfessionals: prev.assignedProfessionals.includes(id)
        ? prev.assignedProfessionals.filter(pId => pId !== id)
        : [...prev.assignedProfessionals, id]
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return showFeedback('error', 'Dê um nome ao serviço para a IA criar a descrição.');
    setIsGenerating(true);
    const desc = await geminiService.generateServiceDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
    showFeedback('success', 'Descrição gerada com IA!');
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || formData.assignedProfessionals.length === 0) {
      return showFeedback('error', 'Preencha o nome, preço e selecione ao menos um profissional.');
    }

    setLoading(true);
    setTimeout(() => {
      const totalDuration = (parseInt(formData.durationHours) * 60) + parseInt(formData.durationMinutes);
      const services = storage.get<Service[]>('services', []);
      
      const serviceData: Service = {
        id: serviceId || Date.now().toString(),
        companyId: '2',
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: totalDuration,
        preparationTime: parseInt(formData.preparationTime) || 0,
        assignedProfessionals: formData.assignedProfessionals,
        image: formData.image || `https://picsum.photos/400/300?random=${Math.random()}`,
        description: formData.description,
        active: formData.active
      };

      if (serviceId) {
        storage.set('services', services.map(s => s.id === serviceId ? serviceData : s));
      } else {
        storage.set('services', [...services, serviceData]);
      }

      setLoading(false);
      showFeedback('success', 'Serviço salvo com sucesso!');
      setTimeout(onBack, 1000);
    }, 800);
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
      <Icon className="text-pink-600" size={20} />
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h3>
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
          className="bg-pink-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-lg shadow-xl shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : <div className="flex items-center gap-2"><Save size={20} /> Salvar Serviço</div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><Scissors size={24} /></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Detalhes do Serviço</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Nome do Serviço *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Botox Capilar Avançado"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800"
                  >
                    <option>Cabelo</option>
                    <option>Barba</option>
                    <option>Unhas</option>
                    <option>Maquiagem</option>
                    <option>Limpeza de Pele</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Preço Final (R$)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="0,00"
                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-bold text-gray-800" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Descrição Completa</label>
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
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Descreva os benefícios e o processo deste serviço..."
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-pink-500 font-medium text-gray-700 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* TEMPO E DISPONIBILIDADE */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Tempo & Duração</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Duração Prevista</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={formData.durationHours} 
                      onChange={e => setFormData({...formData, durationHours: e.target.value})}
                      className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl" 
                    />
                    <span className="block text-center text-[9px] font-bold text-slate-400 uppercase mt-1">Horas</span>
                  </div>
                  <span className="text-2xl font-black text-slate-300">:</span>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={formData.durationMinutes} 
                      onChange={e => setFormData({...formData, durationMinutes: e.target.value})}
                      className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl" 
                    />
                    <span className="block text-center text-[9px] font-bold text-slate-400 uppercase mt-1">Minutos</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 leading-tight italic">
                  Tempo que o profissional ficará ocupado exclusivamente com o cliente.
                </p>
              </div>

              <div className="p-6 bg-amber-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 block mb-4">Tempo de Preparação (Buffer)</label>
                <div className="flex items-center gap-3">
                   <input 
                    type="number" 
                    value={formData.preparationTime} 
                    onChange={e => setFormData({...formData, preparationTime: e.target.value})}
                    className="w-full bg-white px-4 py-3 rounded-xl border-none font-black text-center text-xl text-amber-600" 
                  />
                  <span className="font-bold text-amber-600 tracking-tighter">min</span>
                </div>
                <p className="text-[11px] text-amber-700/60 mt-4 leading-tight">
                  Tempo para limpeza, esterilização ou deslocamento entre serviços. O horário seguinte ficará bloqueado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* PROFISSIONAIS */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl"><Users size={20} /></div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Equipe Habilitada</h2>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 font-medium">Selecione quem pode realizar este serviço:</p>
            
            <div className="space-y-2">
              {team.map(member => (
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

          {/* MÍDIA */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Imagem do Serviço</label>
            <div className="aspect-[4/3] w-full bg-gray-50 rounded-3xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-pink-300 transition-all">
              {formData.image ? (
                <>
                  <img src={formData.image} className="w-full h-full object-cover" alt="" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFormData({...formData, image: ''}); }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 group-hover:text-pink-400">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-[10px] font-black uppercase mt-2">Clique para Upload</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-center text-gray-300 mt-4 leading-tight">
              Tamanho recomendado: 800x600px.<br/>Formatos: JPG, PNG ou WEBP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
