import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, MapPin } from 'lucide-react';
import { Company } from '../../types';
import CompanyForm from './CompanyForm';
import { companiesService } from '../../services/api';

const mapApiCompany = (c: any): Company => ({
  id: String(c.id),
  name: c.name,
  cnpj: c.cnpj || '',
  rating: Number(c.rating || 0),
  distance: c.distance || '0km',
  logo: c.logo || `https://picsum.photos/200?random=${c.id}`,
  status: (c.status || 'pending') as 'active' | 'inactive' | 'pending',
  royaltyPercent: Number(c.royalty_percent || 15),
  address: {
    cep: c.address_cep || '',
    street: c.address_street || '',
    number: c.address_number || '',
    neighborhood: c.address_neighborhood || '',
    city: c.address_city || '',
    state: c.address_state || ''
  }
});

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await companiesService.getAll();
      const list = (response.data?.companies || response.data || []).map(mapApiCompany);
      setCompanies(list);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setCompanies([]);
    }
  };

  useEffect(() => {
    let result = [...companies];
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.cnpj.includes(term) ||
        c.address?.city.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }
    setFilteredCompanies(result);
  }, [searchTerm, statusFilter, companies]);

  const handleCreate = () => {
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta empresa e todos os seus dados?')) return;
    try {
      await companiesService.delete(Number(id));
      await loadCompanies();
    } catch (err) {
      console.error('Erro ao remover empresa:', err);
      alert('Nao foi possivel remover a empresa.');
    }
  };

  const toggleStatus = async (id: string) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;
    const nextStatus = company.status === 'active' ? 'inactive' : 'active';
    try {
      await companiesService.update(Number(id), { status: nextStatus });
      await loadCompanies();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Nao foi possivel atualizar o status da empresa.');
    }
  };

  if (view === 'form') {
    return <CompanyForm companyId={editingId} onBack={() => { setView('list'); loadCompanies(); }} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas Parceiras</h1>
          <p className="text-gray-500">Gestao completa de unidades e licenciados.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
        >
          <Plus size={20} /> Nova Empresa
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Nome, CNPJ ou Cidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          {(['all', 'active', 'pending', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${
                statusFilter === f ? 'bg-slate-100 text-slate-800' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f === 'pending' ? 'Pendentes' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parceiro</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Localizacao</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Taxa</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={company.logo} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-gray-900">{company.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">{company.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">
                        {company.address ? `${company.address.city}/${company.address.state}` : 'Nao informado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 inline-block ${
                      company.status === 'active' ? 'bg-green-50 border-green-100 text-green-600' :
                      company.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {company.status === 'active' ? 'Ativo' : company.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-slate-700">
                    {company.royaltyPercent}%
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(company.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => toggleStatus(company.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(company.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Companies;
