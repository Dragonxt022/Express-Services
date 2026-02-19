
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KPI } from '../types';

const StatsCard: React.FC<KPI> = ({ label, value, change, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
