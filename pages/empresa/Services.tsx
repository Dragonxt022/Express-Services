import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Clock, Users, Scissors } from 'lucide-react';
import { Service } from '../../types';
import { useFeedback } from '../../context/FeedbackContext';
import ServiceForm from './ServiceForm';
import { companiesService, servicesService } from '../../services/api';

const CATEGORY_BY_ID: Record<number, string> = {
  1: 'Cabelo',
  2: 'Unhas',
  3: 'Limpeza',
  4: 'Barba',
  5: 'Massagem',
  6: 'Pet'
};

const mapApiService = (service: any): Service => ({
  id: String(service.id),
  companyId: String(service.company_id),
  name: service.name || '',
  category: service.category_name || CATEGORY_BY_ID[Number(service.category_id)] || 'Sem categoria',
  price: Number(service.price || 0),
  duration: Number(service.duration || 0),
  preparationTime: Number(service.preparation_time || 0),
  assignedProfessionals: (service.assigned_professionals || []).map((id: any) => String(id)),
  image: service.image || `https://picsum.photos/400/300?random=${service.id}`,
  description: service.description || '',
  active: Boolean(service.active)
});

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);

      let currentCompanyId = companyId;
      if (!currentCompanyId) {
        const settingsResponse = await companiesService.getMySettings();
        currentCompanyId = String(settingsResponse.data?.settings?.companyId || '');
        if (!currentCompanyId) {
          showFeedback('error', 'Empresa vinculada nao encontrada para este usuario.');
          setServices([]);
          return;
        }
        setCompanyId(currentCompanyId);
      }

      const response = await servicesService.getByCompany(Number(currentCompanyId), {
        includeInactive: true
      });
      const apiServices = response.data?.services || [];
      setServices(apiServices.map(mapApiService));
    } catch (error: any) {
      console.error('Erro ao carregar servicos:', error);
      showFeedback('error', error.response?.data?.message || 'Nao foi possivel carregar os servicos.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este servico permanentemente?')) return;
    try {
      await servicesService.delete(Number(id));
      showFeedback('success', 'Servico removido com sucesso!');
      await loadServices();
    } catch (error: any) {
      console.error('Erro ao remover servico:', error);
      showFeedback('error', error.response?.data?.message || 'Nao foi possivel remover o servico.');
    }
  };

  const toggleActive = async (id: string) => {
    const service = services.find((item) => item.id === id);
    if (!service) return;
    try {
      await servicesService.update(Number(id), { active: !service.active });
      await loadServices();
    } catch (error: any) {
      console.error('Erro ao atualizar status do servico:', error);
      showFeedback('error', error.response?.data?.message || 'Nao foi possivel atualizar o status.');
    }
  };

  if (view === 'form') {
    return (
      <ServiceForm
        serviceId={editingId}
        companyId={companyId}
        onBack={() => {
          setView('list');
          loadServices();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestao de Servicos</h1>
          <p className="text-gray-500 font-medium">Configure seu catalogo e a disponibilidade da sua equipe.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <Plus size={22} /> Novo Servico
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 text-gray-500 font-medium">
          Carregando servicos...
        </div>
      ) : services.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
            <Scissors size={40} />
          </div>
          <p className="text-gray-400 font-bold text-lg">Seu catalogo esta vazio</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Adicione servicos para que seus clientes possam comecar a agendar.</p>
          <button onClick={handleCreate} className="mt-8 text-pink-600 font-bold uppercase tracking-widest text-xs">Adicionar Primeiro Servico</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300">
              <div className="h-56 relative overflow-hidden">
                <img src={service.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={service.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(service.id)}
                    className="p-3 bg-white/95 backdrop-blur rounded-2xl text-gray-700 hover:text-blue-600 shadow-lg transform group-hover:translate-y-0 translate-y-[-10px] transition-all duration-300"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-3 bg-white/95 backdrop-blur rounded-2xl text-red-500 hover:bg-red-50 shadow-lg transform group-hover:translate-y-0 translate-y-[-10px] transition-all duration-300 delay-75"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/95 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-600 shadow-sm">
                    {service.category}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl text-gray-900 group-hover:text-pink-600 transition-colors">{service.name}</h3>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-gray-300 uppercase">Preco</span>
                    <span className="font-black text-2xl text-slate-900 tracking-tighter">R$ {service.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">{service.assignedProfessionals.length} profissionais</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-black text-gray-300 uppercase leading-none">Status</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={service.active} className="sr-only peer" onChange={() => toggleActive(service.id)} />
                      <div className="w-10 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                  {service.preparationTime > 0 && (
                    <div className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg uppercase">
                      + {service.preparationTime}m preparacao
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
