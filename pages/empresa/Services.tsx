
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, MapPin, Clock, Users, Scissors } from 'lucide-react';
import { Service } from '../../types';
import { storage } from '../../utils/storage';
import { useFeedback } from '../../context/FeedbackContext';
import ServiceForm from './ServiceForm';

const INITIAL_SERVICES: Service[] = [
  { 
    id: '1', 
    companyId: '2', 
    name: 'Corte Moderno', 
    category: 'Cabelo', 
    price: 60, 
    duration: 45, 
    preparationTime: 15,
    assignedProfessionals: ['1', '2'],
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&h=300&auto=format&fit=crop', 
    active: true 
  },
  { 
    id: '2', 
    companyId: '2', 
    name: 'Barba Terapia', 
    category: 'Barba', 
    price: 40, 
    duration: 30, 
    preparationTime: 10,
    assignedProfessionals: ['2'],
    image: 'https://images.unsplash.com/photo-1621605815841-aa8974805c87?q=80&w=400&h=300&auto=format&fit=crop', 
    active: true 
  },
];

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const saved = storage.get<Service[]>('services', INITIAL_SERVICES);
    setServices(saved);
  };

  const handleCreate = () => {
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este serviço permanentemente?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      storage.set('services', updated);
      showFeedback('success', 'Serviço removido com sucesso!');
    }
  };

  const toggleActive = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setServices(updated);
    storage.set('services', updated);
  };

  if (view === 'form') {
    return <ServiceForm serviceId={editingId} onBack={() => { setView('list'); loadServices(); }} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Serviços</h1>
          <p className="text-gray-500 font-medium">Configure seu catálogo e a disponibilidade da sua equipe.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <Plus size={22} /> Novo Serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
            <Scissors size={40} />
          </div>
          <p className="text-gray-400 font-bold text-lg">Seu catálogo está vazio</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Adicione serviços para que seus clientes possam começar a agendar.</p>
          <button onClick={handleCreate} className="mt-8 text-pink-600 font-bold uppercase tracking-widest text-xs">Adicionar Primeiro Serviço</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
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
                    <span className="block text-[10px] font-black text-gray-300 uppercase">Preço</span>
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
                       + {service.preparationTime}m preparação
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
