
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building2, User, MapPin } from 'lucide-react';
import { Company } from '../../types';
import { storage } from '../../utils/storage';
import { maskCNPJ, maskCEP, maskPhone } from '../../utils/masks';
import { validateEmail, validateCNPJ, validateRequired } from '../../utils/validation';
import { useFeedback } from '../../context/FeedbackContext';

interface CompanyFormProps {
  companyId?: string | null;
  onBack: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ companyId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
    responsavel: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    royaltyPercent: 15,
    status: 'active' as 'active' | 'inactive' | 'pending',
    plano: 'Básico'
  });

  useEffect(() => {
    if (companyId) {
      const companies = storage.get<Company[]>('admin_companies', []);
      const company = companies.find(c => c.id === companyId);
      if (company) {
        setFormData(prev => ({ 
          ...prev, 
          name: company.name, 
          cnpj: company.cnpj,
          royaltyPercent: company.royaltyPercent,
          status: company.status,
          cep: company.address?.cep || '',
          logradouro: company.address?.street || '',
          numero: company.address?.number || '',
          complemento: company.address?.complement || '',
          bairro: company.address?.neighborhood || '',
          cidade: company.address?.city || '',
          estado: company.address?.state || 'SP'
        }));
      }
    }
  }, [companyId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Nome fantasia é obrigatório';
    if (!validateRequired(formData.razaoSocial)) newErrors.razaoSocial = 'Razão social é obrigatória';
    if (!validateCNPJ(formData.cnpj)) newErrors.cnpj = 'CNPJ inválido';
    if (!validateEmail(formData.email)) newErrors.email = 'E-mail inválido';
    if (!validateRequired(formData.responsavel)) newErrors.responsavel = 'Responsável é obrigatório';
    if (!validateRequired(formData.cep)) newErrors.cep = 'CEP é obrigatório';
    if (!validateRequired(formData.logradouro)) newErrors.logradouro = 'Rua é obrigatória';
    if (!validateRequired(formData.numero)) newErrors.numero = 'Nº é obrigatório';
    if (!validateRequired(formData.cidade)) newErrors.cidade = 'Cidade é obrigatória';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showFeedback('error', 'Verifique os campos obrigatórios!');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulando delay de API
    setTimeout(() => {
      try {
        const companies = storage.get<Company[]>('admin_companies', []);
        
        const companyData: Company = {
          id: companyId || Date.now().toString(),
          name: formData.name,
          cnpj: formData.cnpj,
          rating: companyId ? (companies.find(c => c.id === companyId)?.rating || 0) : 0,
          distance: companyId ? (companies.find(c => c.id === companyId)?.distance || '0km') : '0km',
          logo: companyId ? (companies.find(c => c.id === companyId)?.logo || `https://picsum.photos/200?random=${Math.random()}`) : `https://picsum.photos/200?random=${Math.random()}`,
          status: formData.status,
          royaltyPercent: formData.royaltyPercent,
          address: {
            cep: formData.cep,
            street: formData.logradouro,
            number: formData.numero,
            complement: formData.complemento,
            neighborhood: formData.bairro,
            city: formData.cidade,
            state: formData.estado
          }
        };

        if (companyId) {
          storage.set('admin_companies', companies.map(c => c.id === companyId ? companyData : c));
        } else {
          storage.set('admin_companies', [...companies, companyData]);
        }
        
        setLoading(false);
        showFeedback('success', 'Dados da empresa salvos!');
        setTimeout(onBack, 1500);
      } catch (err) {
        setLoading(false);
        showFeedback('error', 'Erro ao salvar os dados.');
      }
    }, 800);
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
      <Icon className="text-pink-600" size={20} />
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold transition-colors">
          <ArrowLeft size={20} /> Voltar
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all ${loading ? 'opacity-50' : 'hover:bg-black active:scale-95'}`}
        >
          {loading ? 'Salvando...' : <><Save size={20} /> Salvar Alterações</>}
        </button>
      </div>

      <div className="space-y-8">
        {/* DADOS BÁSICOS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <SectionTitle icon={Building2} title="Dados do Negócio" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Razão Social *</label>
              <input 
                type="text" 
                value={formData.razaoSocial}
                onChange={e => setFormData({...formData, razaoSocial: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome Fantasia *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">CNPJ *</label>
              <input 
                type="text" 
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <SectionTitle icon={MapPin} title="Localização & Endereço" />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">CEP *</label>
              <input 
                type="text" 
                value={formData.cep}
                onChange={e => setFormData({...formData, cep: maskCEP(e.target.value)})}
                placeholder="00000-000"
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Rua/Logradouro *</label>
              <input 
                type="text" 
                value={formData.logradouro}
                onChange={e => setFormData({...formData, logradouro: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nº *</label>
              <input 
                type="text" 
                value={formData.numero}
                onChange={e => setFormData({...formData, numero: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Complemento</label>
              <input 
                type="text" 
                value={formData.complemento}
                onChange={e => setFormData({...formData, complemento: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Bairro</label>
              <input 
                type="text" 
                value={formData.bairro}
                onChange={e => setFormData({...formData, bairro: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cidade *</label>
              <input 
                type="text" 
                value={formData.cidade}
                onChange={e => setFormData({...formData, cidade: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Estado</label>
              <select 
                value={formData.estado}
                onChange={e => setFormData({...formData, estado: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white"
              >
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="PR">Paraná</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTATO */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <SectionTitle icon={User} title="Responsável & Contato" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome do Responsável *</label>
              <input 
                type="text" 
                value={formData.responsavel}
                onChange={e => setFormData({...formData, responsavel: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Telefone *</label>
              <input 
                type="text" 
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: maskPhone(e.target.value)})}
                placeholder="(00) 00000-0000"
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">E-mail Corporativo *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
