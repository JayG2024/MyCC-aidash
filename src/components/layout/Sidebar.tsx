import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, LogOut, Menu, Database, FileSpreadsheet, Brain, BarChart3, MessageSquare, Upload
} from 'lucide-react';
import { logout } from '../../utils/firebase-auth';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMobileMenu();
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
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-2" />
              <div className="text-lg font-bold text-gray-800">
                Data Analytics
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 pt-6 pb-4 overflow-y-auto">
            <div className="px-4 mb-4 text-xs font-semibold text-gray-400 uppercase">
              Quick Actions
            </div>
            
            <button
              onClick={() => scrollToSection('upload-section')}
              className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-2 transition-colors"
            >
              <Upload size={20} className="mr-3" />
              <span className="font-medium">Upload Data</span>
            </button>

            <button
              onClick={() => scrollToSection('chat-section')}
              className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-2 transition-colors"
            >
              <MessageSquare size={20} className="mr-3" />
              <span className="font-medium">Ask Questions</span>
            </button>

            <button
              onClick={() => scrollToSection('table-section')}
              className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-2 transition-colors"
            >
              <BarChart3 size={20} className="mr-3" />
              <span className="font-medium">View Data</span>
            </button>

            <div className="px-4 mt-8 mb-4 text-xs font-semibold text-gray-400 uppercase">
              Features
            </div>

            <div className="px-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <FileSpreadsheet size={16} className="mr-2 text-blue-500" />
                <span>Massive Spreadsheet Support</span>
              </div>
              <div className="flex items-center">
                <Brain size={16} className="mr-2 text-purple-500" />
                <span>Gemini AI Analysis</span>
              </div>
              <div className="flex items-center">
                <Database size={16} className="mr-2 text-green-500" />
                <span>Smart Data Processing</span>
              </div>
              <div className="flex items-center">
                <BarChart3 size={16} className="mr-2 text-orange-500" />
                <span>Executive Insights</span>
              </div>
            </div>

            <div className="px-4 mt-8 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">AI Powered</span>
                </div>
                <p className="text-xs text-blue-700">
                  Upload spreadsheets up to 200MB+ and ask natural language questions to get instant business insights.
                </p>
              </div>
            </div>
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