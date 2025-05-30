import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, Settings, UserCircle, LogOut, Database, Menu, BarChart3, FileText, Users, Bot
} from 'lucide-react';
import { logout } from '../../utils/auth';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, icon, label, isActive, onClick 
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md lg:hidden bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <img 
              src="https://www.mycomputercareer.edu/wp-content/uploads/2024/02/mycc_newlogo_blue_trans2.png.webp" 
              alt="MyComputerCareer Logo" 
              className="h-8 object-contain"
            />
          </div>

          {/* Links */}
          <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
            <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
              Dashboard
            </div>
            <SidebarLink
              to="/analytics"
              icon={<BarChart3 size={20} />}
              label="Analytics Overview"
              isActive={isActive('/analytics')}
              onClick={closeMobileMenu}
            />
            
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">
              Data Analysis
            </div>
            <SidebarLink
              to="/data-analysis"
              icon={<Database size={20} />}
              label="Data Upload & Analysis"
              isActive={isActive('/data-analysis')}
              onClick={closeMobileMenu}
            />
            <SidebarLink
              to="/gravity-forms"
              icon={<FileText size={20} />}
              label="Gravity Forms Data"
              isActive={isActive('/gravity-forms')}
              onClick={closeMobileMenu}
            />
            

            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">
              Account
            </div>
            <SidebarLink
              to="/profile"
              icon={<UserCircle size={20} />}
              label="Profile"
              isActive={isActive('/profile')}
              onClick={closeMobileMenu}
            />
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button 
              className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;