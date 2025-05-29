import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
      </div>
      
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
        
        <div className="flex items-center">
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            <span className="font-medium">{Math.abs(change)}%</span>
          </div>
          <span className="text-gray-500 text-sm ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;