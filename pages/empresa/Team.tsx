
import React, { useState, useEffect } from 'react';
import { Plus, Phone, Mail, ChevronRight, UserPlus, Trash2, Edit3, ShieldCheck, ShieldAlert, UserX, Percent } from 'lucide-react';
import { TeamMember } from '../../types';
import { storage } from '../../utils/storage';
import { useFeedback } from '../../context/FeedbackContext';
import StaffForm from './StaffForm';

const INITIAL_TEAM: TeamMember[] = [
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
    specialties: 'Loiras, Cortes Femininos, Visagismo', 
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
    commission: 0,
    commissionEnabled: false,
    specialties: 'Barba Terapia, Visagismo Masculino', 
    active: true 
  },
];

const Team: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = () => {
    const saved = storage.get<TeamMember[]>('team_members', INITIAL_TEAM);
    setTeam(saved);
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
    if (window.confirm('Excluir este funcionário permanentemente?')) {
      const updated = team.filter(m => m.id !== id);
      setTeam(updated);
      storage.set('team_members', updated);
      showFeedback('success', 'Funcionário removido da base.');
    }
  };

  const toggleStatus = (id: string) => {
    const updated = team.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setTeam(updated);
    storage.set('team_members', updated);
    showFeedback('success', 'Status do funcionário atualizado.');
  };

  if (view === 'form') {
    return <StaffForm staffId={editingId} onBack={() => { setView('list'); loadTeam(); }} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Minha Equipe</h1>
          <p className="text-gray-500 font-medium">Gerencie talentos, comissões e acessos.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"
        >
          <UserPlus size={22} /> Novo Profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {team.map(person => (
          <div key={person.id} className={`bg-white p-6 sm:p-8 rounded-[3rem] border shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl transition-all duration-300 ${!person.active ? 'opacity-60 border-gray-100 bg-gray-50/50' : 'border-gray-100'}`}>
            <div className="relative">
              <img src={person.avatar} className="w-24 h-24 rounded-[2.2rem] object-cover shadow-lg border-4 border-white" alt="" />
              <span className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${person.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="font-black text-xl text-gray-900 leading-none">{person.name}</h3>
                {!person.active && (
                   <span className="text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-full inline-block w-fit mx-auto sm:mx-0">Inativo</span>
                )}
              </div>
              <p className="text-sm text-pink-600 font-black uppercase tracking-widest mb-4">{person.role}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase leading-none">Comissão</span>
                  <span className={`font-bold ${person.commissionEnabled ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                    {person.commissionEnabled ? `${person.commission}%` : 'Sem comissão'}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-100 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase leading-none">Especialidades</span>
                  <span className="font-bold text-gray-400 text-xs truncate max-w-[150px]">{person.specialties}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 w-full sm:w-auto justify-center">
              <button 
                onClick={() => handleEdit(person.id)}
                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                title="Editar Ficha"
              >
                <Edit3 size={20} />
              </button>
              <button 
                onClick={() => toggleStatus(person.id)}
                className={`p-3 rounded-2xl transition-all shadow-sm ${person.active ? 'bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'bg-green-50 text-green-600'}`}
                title={person.active ? 'Desativar' : 'Ativar'}
              >
                {person.active ? <UserX size={20} /> : <ShieldCheck size={20} />}
              </button>
              <button 
                onClick={() => handleDelete(person.id)}
                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {team.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
              <UserPlus size={40} />
            </div>
            <p className="font-bold text-gray-400">Nenhum profissional cadastrado.</p>
            <button onClick={handleCreate} className="mt-4 text-pink-600 font-black uppercase tracking-widest text-xs">Adicionar Primeiro Membro</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
