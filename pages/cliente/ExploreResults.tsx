
import React, { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, MapPin, Star, Clock, ChevronRight, Filter } from 'lucide-react';

interface ExploreResultsProps {
  category: string;
  onBack: () => void;
  onSelectCompany: (id: string) => void;
}

const mockResults = [
  { id: '1', name: 'Barbearia do Zé', rating: 4.8, reviews: 120, dist: '1.2km', status: 'open', priceRange: '$$', logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200' },
  { id: '2', name: 'Studio Bella', rating: 4.9, reviews: 85, dist: '0.8km', status: 'open', priceRange: '$$$', logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200' },
  { id: '3', name: 'Vintage Barber', rating: 4.5, reviews: 210, dist: '2.5km', status: 'closed', priceRange: '$', logo: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=200' },
  { id: '4', name: 'Nails Designer', rating: 4.7, reviews: 45, dist: '3.1km', status: 'open', priceRange: '$$', logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=200' },
];

const ExploreResults: React.FC<ExploreResultsProps> = ({ category, onBack, onSelectCompany }) => {
  const [filter, setFilter] = useState('dist');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{category}</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{mockResults.length} locais encontrados</p>
          </div>
        </div>
        <button className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        {[
          { id: 'dist', label: 'Mais Próximos' },
          { id: 'rating', label: 'Melhor Avaliados' },
          { id: 'price', label: 'Melhor Preço' },
          { id: 'open', label: 'Abertos Agora' },
        ].map(f => (
          <button 
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === f.id ? 'bg-[#E11D48] border-transparent text-white shadow-lg shadow-rose-100' : 'bg-white border-gray-100 text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {mockResults.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectCompany(item.id)}
            className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:border-rose-100 transition-all cursor-pointer"
          >
            <div className="relative">
              <img src={item.logo} className="w-20 h-20 rounded-3xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
              <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm border ${
                item.status === 'open' ? 'bg-green-500 text-white border-green-400' : 'bg-gray-400 text-white border-gray-300'
              }`}>
                {item.status === 'open' ? 'Aberto' : 'Fechado'}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-black text-gray-900 text-lg leading-none tracking-tight group-hover:text-[#E11D48] transition-colors">{item.name}</h4>
                <span className="text-[10px] font-black text-gray-300">{item.priceRange}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                  <Star size={12} fill="currentColor" /> {item.rating}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">({item.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase">
                  <MapPin size={10} /> {item.dist}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${item.id}${i}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="" />
                  ))}
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Equipe disponível</span>
              </div>
            </div>

            <button className="w-10 h-10 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center group-hover:bg-[#E11D48] group-hover:text-white transition-all shadow-inner">
              <ChevronRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreResults;
