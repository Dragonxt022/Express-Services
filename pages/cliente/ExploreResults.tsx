import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, SlidersHorizontal, MapPin, Star, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { companiesService } from '../../services/api';

interface ExploreResultsProps {
  category: string;
  onBack: () => void;
  onSelectCompany: (id: string) => void;
}

const CATEGORY_ID_BY_NAME: Record<string, number> = {
  Cabelo: 1,
  Unhas: 2,
  Limpeza: 3,
  Barba: 4,
  Massagem: 5,
  Pet: 6
};

const ExploreResults: React.FC<ExploreResultsProps> = ({ category, onBack, onSelectCompany }) => {
  const [filter, setFilter] = useState('rating');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSearch = category.startsWith('Busca: ');
  const searchTerm = isSearch ? category.replace('Busca: ', '').trim().toLowerCase() : '';

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isSearch) {
          const response = await companiesService.getAll({ status: 'active' });
          const companies = response.data?.companies || response.data || [];
          const filtered = companies.filter((company: any) => {
            const name = String(company.name || '').toLowerCase();
            const city = String(company.address_city || '').toLowerCase();
            const neighborhood = String(company.address_neighborhood || '').toLowerCase();
            return name.includes(searchTerm) || city.includes(searchTerm) || neighborhood.includes(searchTerm);
          });
          setResults(filtered);
          return;
        }

        const categoryId = CATEGORY_ID_BY_NAME[category];
        if (categoryId) {
          const response = await companiesService.getByCategory(categoryId);
          const companies = response.data?.companies || response.data || [];
          setResults(companies);
          return;
        }

        const fallback = await companiesService.getAll({ status: 'active' });
        setResults(fallback.data?.companies || fallback.data || []);
      } catch (err: any) {
        console.error('Erro ao carregar resultados:', err);
        setError('Nao foi possivel carregar as empresas no momento.');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [category, isSearch, searchTerm]);

  const sortedResults = useMemo(() => {
    const list = [...results];
    if (filter === 'rating') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (filter === 'open') {
      list.sort((a, b) => (a.is_open ? -1 : 1) - (b.is_open ? -1 : 1));
    }
    return list;
  }, [filter, results]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{category}</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{sortedResults.length} locais encontrados</p>
          </div>
        </div>
        <button className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        {[
          { id: 'rating', label: 'Melhor Avaliados' },
          { id: 'open', label: 'Abertos Agora' }
        ].map((f) => (
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

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader size={36} className="animate-spin text-[#E11D48] mb-3" />
          <p className="text-gray-400 font-semibold text-sm">Carregando empresas...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {sortedResults.map((item) => {
            const isOpen = Boolean(item.is_open);
            return (
            <div
              key={item.id}
              onClick={() => onSelectCompany(String(item.id))}
              className={`bg-white p-4 rounded-3xl border shadow-sm flex items-center gap-4 group transition-all cursor-pointer ${
                isOpen ? 'border-gray-100 hover:shadow-lg hover:border-rose-100' : 'border-gray-200 opacity-80'
              }`}
            >
              <div className="relative">
                <img src={item.logo || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200'} className={`w-16 h-16 rounded-2xl object-cover shadow-sm transition-transform ${isOpen ? 'group-hover:scale-105' : 'grayscale'}`} alt="" />
                <div className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm border ${
                  isOpen ? 'bg-green-500 text-white border-green-400' : 'bg-gray-400 text-white border-gray-300'
                }`}>
                  {isOpen ? 'Aberto' : 'Fechado'}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-black text-gray-900 text-base leading-none tracking-tight group-hover:text-[#E11D48] transition-colors">{item.name}</h4>
                </div>

                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-[11px]">
                    <Star size={10} fill="currentColor" /> {Number(item.rating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-[9px] font-black uppercase">
                    <MapPin size={10} /> {item.address_city || 'Nao informado'}
                  </div>
                </div>
              </div>

              <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-inner ${isOpen ? 'bg-gray-50 text-gray-300 group-hover:bg-[#E11D48] group-hover:text-white' : 'bg-gray-100 text-gray-300'}`}>
                <ChevronRight size={18} />
              </button>
            </div>
            );
          })}

          {sortedResults.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">Nenhuma empresa encontrada para esse filtro.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreResults;
