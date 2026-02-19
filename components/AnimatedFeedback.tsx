
import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface AnimatedFeedbackProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const AnimatedFeedback: React.FC<AnimatedFeedbackProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 flex flex-col items-center text-center max-w-xs w-full animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg transform transition-transform animate-bounce ${
          type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {type === 'success' ? <Check size={48} strokeWidth={4} /> : <X size={48} strokeWidth={4} />}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          {type === 'success' ? 'Sucesso!' : 'Ops!'}
        </h3>
        <p className="text-gray-500 font-medium leading-tight">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AnimatedFeedback;
