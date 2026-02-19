
import React, { useState } from 'react';
import { MapPin, ArrowLeft, Check, Home, Building2, Map as MapIcon, Navigation, ChevronDown } from 'lucide-react';
import { Address } from '../../types';
import { AVAILABLE_CITIES } from '../../constants';

interface AddressFormProps {
  onBack: () => void;
  onSave: (address: Partial<Address>) => void;
  initialData?: Address;
}

const AddressForm: React.FC<AddressFormProps> = ({ onBack, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    label: initialData?.label || '',
    street: initialData?.street || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || AVAILABLE_CITIES[0],
    state: initialData?.state || 'RO',
    zipCode: initialData?.zipCode || '',
  });

  const [type, setType] = useState<'casa' | 'trabalho' | 'outro'>(
    (initialData?.label?.toLowerCase() as any) || 'casa'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      isDefault: initialData?.isDefault || false,
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
            {initialData ? 'Editar Endereço' : 'Novo Endereço'}
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5">Onde você quer ser atendida?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Local */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'casa', label: 'Casa', icon: Home },
            { id: 'trabalho', label: 'Trabalho', icon: Building2 },
            { id: 'outro', label: 'Outro', icon: MapIcon },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setType(t.id as any);
                setFormData({ ...formData, label: t.label });
              }}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                type === t.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-gray-50 text-gray-400 hover:border-pink-100'
              }`}
            >
              <t.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CEP</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="00000-000"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#E11D48] hover:bg-rose-50 rounded-xl transition-all">
                <Navigation size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rua / Avenida</label>
              <input
                type="text"
                required
                placeholder="Nome da rua"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número</label>
              <input
                type="text"
                required
                placeholder="123"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complemento (Opcional)</label>
            <input
              type="text"
              placeholder="Apto, Bloco, etc."
              value={formData.complement}
              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bairro</label>
            <input
              type="text"
              required
              placeholder="Nome do bairro"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cidade</label>
              <div className="relative">
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all appearance-none"
                >
                  {AVAILABLE_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
              <input
                type="text"
                required
                placeholder="RO"
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-[#E11D48] transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          Salvar Endereço <Check size={22} className="text-pink-500" />
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
