import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertTriangle, Loader2, Lock, Shield, Sparkles, Copy } from 'lucide-react';
import { checkAPIKeyValidity, initializeGemini, isAPIKeyConfigured } from '../../utils/gemini';

interface APIKeyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const APIKeyModal: React.FC<APIKeyModalProps> = ({ onClose, onSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isUsingDemoKey, setIsUsingDemoKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    // Check if there's already a key stored
    const checkExistingKey = async () => {
      const hasKey = await isAPIKeyConfigured();
      setHasExistingKey(hasKey);
      if (hasKey) {
        setApiKey('••••••••••••••••••••••••••••••••'); // Placeholder for existing key
      }
    };
    
    checkExistingKey();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || apiKey === '•••••••••••••••••••••••••••••••••') {
      setError('Please enter your Gemini API key');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Validating API key...');
      const isValid = await checkAPIKeyValidity(apiKey);
      
      if (isValid) {
        console.log('API key is valid, initializing Gemini client');
        await initializeGemini(apiKey);
        onSuccess();
      } else {
        setError('The API key appears to be invalid. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setError('Failed to validate API key. Please check your internet connection and try again.');
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleUseDemoKey = async () => {
    setIsChecking(true);
    setIsUsingDemoKey(true);
    
    try {
      // Initialize with no key to use the default key
      await initializeGemini();
      onSuccess();
    } catch (error) {
      console.error('Error setting up demo key:', error);
      setError('Failed to set up demo key. Please try again.');
      setIsUsingDemoKey(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Function to handle the copy link
  const handleCopy = () => {
    navigator.clipboard.writeText('https://aistudio.google.com/app/apikey');
    // You could add a toast notification here if desired
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <Key className="mr-2" size={20} />
              Connect to Gemini AI
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full text-white"
              disabled={isChecking}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
              <Sparkles size={18} className="mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Connect your Google Gemini API key to enable AI-powered data analysis. Gemini 2.5 Pro offers the most advanced reasoning and analysis capabilities.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1.5">
                Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="apiKey"
                  type={showPassword ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AI..."
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center">
                  <p className="text-sm text-gray-500">
                    Need a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get one from Google AI Studio</a>
                  </p>
                  <button 
                    type="button" 
                    onClick={handleCopy}
                    className="ml-1 p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Copy link"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                {hasExistingKey && (
                  <button
                    type="button"
                    onClick={() => onSuccess()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Use existing key
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertTriangle size={18} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <div className="border-t border-gray-200 flex-1 mr-4"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="border-t border-gray-200 flex-1 ml-4"></div>
            </div>
            
            <button
              type="button"
              onClick={handleUseDemoKey}
              disabled={isChecking || isUsingDemoKey}
              className={`w-full mb-4 py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium ${
                isChecking || isUsingDemoKey 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors shadow-sm`}
            >
              {isUsingDemoKey ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Setting up demo key...
                </>
              ) : (
                <>
                  <Key size={18} className="mr-2" />
                  Use Demo Key (Limited Features)
                </>
              )}
            </button>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isChecking}
                className={`px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm ${
                  isChecking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChecking || !apiKey || apiKey === '•••••••••••••••••••••••••••••••••'}
                className={`px-4 py-2.5 bg-blue-600 text-white rounded-lg flex items-center shadow-sm ${
                  isChecking || !apiKey || apiKey === '•••••••••••••••••••••••••••••••••' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                } transition-colors`}
              >
                {isChecking && !isUsingDemoKey ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Connect
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Shield size={16} className="mr-1.5 text-blue-600" />
              Security and benefits:
            </h4>
            <ul className="text-sm text-gray-600 space-y-2.5 mt-3">
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-0.5 mr-2 mt-0.5">
                  <Check size={12} className="text-green-600" />
                </div>
                <span>Data privacy guaranteed - your data never leaves your system</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-0.5 mr-2 mt-0.5">
                  <Check size={12} className="text-green-600" />
                </div>
                <span>Demo mode available for testing without an API key</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-0.5 mr-2 mt-0.5">
                  <Check size={12} className="text-green-600" />
                </div>
                <span>Executive-ready analysis with professional formatting</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-0.5 mr-2 mt-0.5">
                  <Check size={12} className="text-green-600" />
                </div>
                <span>Your key is stored only in your browser's secure storage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyModal;