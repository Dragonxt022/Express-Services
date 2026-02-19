
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Star, Target, Zap, Award, Settings, 
  Plus, Trash2, Edit3, Sparkles, TrendingUp, Users 
} from 'lucide-react';
import { storage } from '../../utils/storage';
import { useFeedback } from '../../context/FeedbackContext';
import { geminiService } from '../../services/gemini';

const GamificationManager: React.FC = () => {
  const { showFeedback } = useFeedback();
  const [xpRate, setXpRate] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const [levels, setLevels] = useState([
    { id: 1, name: 'Bronze', xp: 0, color: 'bg-orange-400', perks: 'Básico' },
    { id: 2, name: 'Silver', xp: 500, color: 'bg-slate-400', perks: '5% cashback' },
    { id: 3, name: 'Gold', xp: 2000, color: 'bg-amber-400', perks: '10% cashback + brinde' },
    { id: 4, name: 'Diamond', xp: 5000, color: 'bg-pink-600', perks: 'Atendimento VIP + 15% cashback' },
  ]);

  const [badges, setBadges] = useState([
    { id: 1, name: 'Explorador', desc: 'Use 3 empresas diferentes', icon: Target, points: 500 },
    { id: 2, name: 'Fidelidade', desc: '5 visitas na mesma unidade', icon: Award, points: 300 },
    { id: 3, name: 'Madrugador', desc: 'Serviços antes das 09:00', icon: Zap, points: 200 },
  ]);

  const handleSuggestChallenge = async () => {
    setIsGenerating(true);
    try {
      // Usando o serviço Gemini para gerar ideias de desafios dinâmicos
      const res = await geminiService.analyzeBusinessInsights({ 
        currentCampaign: "Gamificação de Lançamento",
        goal: "Aumentar recorrência mensal" 
      });
      setAiSuggestion(res || "Crie o 'Desafio das Cores': Clientes que fizerem Unha e Cabelo na mesma semana ganham XP em dobro.");
    } catch (e) {
      setAiSuggestion("Desafio Verão: 3 drenagens linfáticas ganham badge exclusivo.");
    }
    setIsGenerating(false);
  };

  const SectionHeader = ({ icon: Icon, title, desc, color }: any) => (
    <div className="flex items-center gap-4 mb-8">
      <div className={`p-3 rounded-2xl text-white shadow-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">{title}</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Beleza Rewards</h1>
          <p className="text-gray-500 font-medium mt-2">Configure a jornada de engajamento do cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-xs font-black text-gray-800">1.240 Participantes</span>
          </div>
        </div>
      </div>

      {/* AI Strategy Suggestion */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2rem] flex items-center justify-center shadow-xl shrink-0">
            <Sparkles size={36} className={isGenerating ? 'animate-spin' : 'animate-pulse'} />
          </div>
          <div className="flex-1">
             <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">IA Mission Suggestion</span>
             <p className="text-xl font-bold mt-3 italic text-slate-200">
               {aiSuggestion || "Clique no botão para gerar um desafio estratégico baseado em dados."}
             </p>
          </div>
          <button 
            onClick={handleSuggestChallenge}
            disabled={isGenerating}
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-100 transition-all shadow-xl active:scale-95"
          >
            {isGenerating ? 'Analisando...' : 'Sugerir Desafio'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regras de Pontuação */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <SectionHeader icon={Star} title="Regras de XP" desc="Configuração de Ganho" color="bg-amber-500" />
          
          <div className="space-y-8">
            <div className="p-6 bg-gray-50 rounded-[2rem]">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Pontos por Real Gasto (R$ 1,00)</label>
              <div className="flex items-center gap-6">
                <input 
                  type="range" 
                  min="1" max="50" 
                  value={xpRate}
                  onChange={(e) => setXpRate(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 font-black text-2xl text-amber-600">
                  {xpRate} XP
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Bônus Cadastro</p>
                <h4 className="text-2xl font-black text-emerald-700">200 XP</h4>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Avaliação</p>
                <h4 className="text-2xl font-black text-blue-700">50 XP</h4>
              </div>
            </div>
            
            <button className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">
              Atualizar Algoritmo de Pontos
            </button>
          </div>
        </section>

        {/* Níveis e Progressão */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <SectionHeader icon={Trophy} title="Tiers de Nível" desc="Thresholds e Benefícios" color="bg-indigo-500" />
          
          <div className="space-y-4">
            {levels.map(level => (
              <div key={level.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-indigo-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${level.color} shadow-lg flex items-center justify-center text-white`}>
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 leading-none mb-1">{level.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">A partir de {level.xp} XP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Perk Ativo</p>
                  <p className="text-xs font-bold text-gray-700">{level.perks}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 mt-4">
              <Plus size={16} /> Adicionar Novo Nível
            </button>
          </div>
        </section>
      </div>

      {/* Galeria de Badges */}
      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <SectionHeader icon={Award} title="Conquistas & Badges" desc="Gatilhos de Recompensas Especiais" color="bg-pink-600" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map(badge => (
            <div key={badge.id} className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Edit3 size={16} className="text-gray-400 cursor-pointer" />
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm mb-4">
                <badge.icon size={28} />
              </div>
              <h4 className="font-black text-gray-900 text-lg leading-none mb-2">{badge.name}</h4>
              <p className="text-xs text-gray-400 font-medium mb-4">{badge.desc}</p>
              <div className="flex items-center gap-2">
                <div className="bg-pink-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  +{badge.points} XP
                </div>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 border-2 border-dashed border-gray-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-300 transition-all group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-pink-600 shadow-sm mb-3">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Criar Badge</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GamificationManager;
