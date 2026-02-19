
import React, { useState } from 'react';
import { Heart, Star, MapPin, Scissors, User, ChevronRight } from 'lucide-react';

const mockFavCompanies = [
  { id: '1', name: 'Barbearia do Zé', rating: 4.8, dist: '1.2km', logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200' },
  { id: '2', name: 'Studio Bella', rating: 4.9, dist: '0.8km', logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200' },
];

const mockFavProfs = [
  { id: '1', name: 'Ana Paula', role: 'Manicure', avatar: 'https://i.pravatar.cc/150?u=ana' },
  { id: '2', name: 'Beatriz Martins', role: 'Barbeira Specialist', avatar: 'https://i.pravatar.cc/150?u=beatriz' },
];

const Favorites: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'profs'>('companies');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Seus Favoritos</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Locais e profissionais que você ama</p>
      </div>

      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto sm:mx-0">
        <button 
          onClick={() => setActiveTab('companies')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'companies' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Scissors size={14} /> Empresas
        </button>
        <button 
          onClick={() => setActiveTab('profs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profs' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={14} /> Profissionais
        </button>
      </div>

      {activeTab === 'companies' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockFavCompanies.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
              <div className="relative">
                <img src={c.logo} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" alt="" />
                <div className="absolute -top-2 -right-2 bg-white px-2 py-1 rounded-xl shadow-lg border border-gray-50 flex items-center gap-1">
                  <Star size={10} className="text-amber-500 fill-current" />
                  <span className="text-[10px] font-black text-gray-800">{c.rating}</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-900 text-lg leading-none mb-1 group-hover:text-pink-600 transition-colors">{c.name}</h4>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase">
                  <MapPin size={12} /> {c.dist}
                </div>
              </div>
              <button className="w-10 h-10 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all shadow-inner">
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockFavProfs.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
              <div className="relative">
                <img src={p.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" alt="" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-900 text-lg leading-none mb-1 group-hover:text-pink-600 transition-colors">{p.name}</h4>
                <div className="flex items-center gap-2 text-pink-600 text-[10px] font-black uppercase">
                   {p.role}
                </div>
              </div>
              <button className="w-10 h-10 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all shadow-inner">
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
