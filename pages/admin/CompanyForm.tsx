
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building2, User, MapPin } from 'lucide-react';
import { maskCNPJ, maskCEP, maskPhone } from '../../utils/masks';
import { validateEmail, validateCNPJ, validateRequired } from '../../utils/validation';
import { useFeedback } from '../../context/FeedbackContext';
import { companiesService } from '../../services/api';

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
      (async () => {
        try {
          const response = await companiesService.getById(Number(companyId));
          const company = response.data?.company || response.data;
          if (!company) return;

          setFormData(prev => ({
            ...prev,
            name: company.name || '',
            razaoSocial: company.description || '',
            cnpj: company.cnpj || '',
            responsavel: company.responsible_name || '',
            email: company.responsible_email || '',
            telefone: company.responsible_phone || '',
            royaltyPercent: Number(company.royalty_percent || 15),
            status: company.status || 'pending',
            cep: company.address_cep || '',
            logradouro: company.address_street || '',
            numero: company.address_number || '',
            complemento: company.address_complement || '',
            bairro: company.address_neighborhood || '',
            cidade: company.address_city || '',
            estado: company.address_state || 'SP'
          }));
        } catch (err) {
          console.error('Erro ao carregar empresa:', err);
          showFeedback('error', 'Nao foi possivel carregar os dados da empresa.');
        }
      })();
    }
  }, [companyId, showFeedback]);

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
    if (Number(formData.royaltyPercent) < 0 || Number(formData.royaltyPercent) > 100) {
      newErrors.royaltyPercent = 'Royalties deve estar entre 0 e 100';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showFeedback('error', 'Verifique os campos obrigatórios!');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        name: formData.name,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        responsavel: formData.responsavel,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        address_cep: formData.cep.replace(/\D/g, ''),
        address_street: formData.logradouro,
        address_number: formData.numero,
        address_complement: formData.complemento,
        address_neighborhood: formData.bairro,
        address_city: formData.cidade,
        address_state: formData.estado,
        description: formData.razaoSocial,
        royalty_percent: Number(formData.royaltyPercent)
      };

      if (companyId) {
        payload.status = formData.status;
        await companiesService.update(Number(companyId), payload);
        showFeedback('success', 'Dados da empresa atualizados!');
      } else {
        await companiesService.create(payload);
        showFeedback('success', 'Empresa cadastrada. Convite enviado por e-mail!');
      }

      setTimeout(onBack, 1200);
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Erro ao salvar os dados.');
    } finally {
      setLoading(false);
    }
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
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Royalties (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={formData.royaltyPercent}
                onChange={e => setFormData({...formData, royaltyPercent: Number(e.target.value)})}
                className="w-full px-5 py-3 bg-gray-50 rounded-2xl mt-1 border-2 border-transparent focus:bg-white focus:ring-2 focus:ring-pink-500"
              />
              {errors.royaltyPercent && <p className="text-xs text-red-500 mt-1 ml-1">{errors.royaltyPercent}</p>}
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
                <option value="RO">Rondônia</option>
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


