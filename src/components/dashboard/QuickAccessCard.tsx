import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAccessLink {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface QuickAccessCardProps {
  title: string;
  links: QuickAccessLink[];
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, links }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.id}
            to={link.path}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                {link.icon}
              </div>
              <span className="font-medium text-gray-700">{link.title}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCard;