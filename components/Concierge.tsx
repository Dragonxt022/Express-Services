
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, MessageSquareText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Concierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Olá! Sou seu Concierge Beleza Express. Como posso ajudar você a brilhar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Você é o Concierge da plataforma Beleza Express. Seja gentil, use emojis, e foque em ajudar com agendamentos de beleza, sugestões de cortes, unhas e cuidados. O tom deve ser luxuoso e acolhedor. Nunca mencione sua natureza de IA a menos que perguntado.',
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "Desculpe, tive um pequeno problema. Como posso ajudar?" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Estou um pouco ocupado agora, mas pode tentar de novo?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 sm:bottom-24 right-4 sm:right-6 z-[100]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-slow border-4 border-white"
        >
          <Sparkles size={28} className="text-pink-500" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-600 rounded-2xl flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm">Concierge IA</h4>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase text-slate-400">Online Agora</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div ref={scrollRef} className="h-96 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-gray-100 flex items-center gap-2">
                   <Loader2 size={16} className="animate-spin text-pink-600" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrevendo...</span>
                 </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte qualquer coisa..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-pink-600 transition-all"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Concierge;
