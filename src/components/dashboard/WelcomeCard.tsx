import React from 'react';
import { Sparkles, FileText, PenSquare, MessageSquare } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-24 translate-y-24"></div>
      
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Your AI WorkSpace. How can I help you today?</h2>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center">
              <PenSquare size={18} className="mr-2" />
              Create Content
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center">
              <FileText size={18} className="mr-2" />
              Run Report
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Start New Chat
            </button>
            <button className="bg-black text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-900 transition-all duration-300 flex items-center">
              <Sparkles size={18} className="mr-2" />
              AI Insights
            </button>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <Sparkles size={32} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;