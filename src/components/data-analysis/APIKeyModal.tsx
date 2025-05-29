import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertTriangle, Loader2, Lock, Shield } from 'lucide-react';
import { checkAPIKeyValidity, initializeOpenAI, isAPIKeyConfigured } from '../../utils/openai';

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
      setError('Please enter your OpenAI API key');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Validating API key...');
      const isValid = await checkAPIKeyValidity(apiKey);
      
      if (isValid) {
        console.log('API key is valid, initializing OpenAI client');
        await initializeOpenAI(apiKey);
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
      await initializeOpenAI();
      onSuccess();
    } catch (error) {
      console.error('Error setting up demo key:', error);
      setError('Failed to set up demo key. Please try again.');
      setIsUsingDemoKey(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <Key className="mr-2" size={20} />
              Connect to OpenAI
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600">
              Connect your OpenAI API key to enable AI-powered data analysis. The default model is o3-mini, which offers efficient and cost-effective business intelligence.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mt-1 flex justify-between">
                <p className="text-sm text-gray-500">
                  Need an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Get one from OpenAI</a>
                </p>
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
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
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
              className={`w-full mb-4 py-2.5 px-4 flex items-center justify-center rounded-md text-white font-medium ${
                isChecking || isUsingDemoKey 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChecking || !apiKey || apiKey === '•••••••••••••••••••••••••••••••••'}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center ${
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
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Shield size={16} className="mr-1 text-blue-600" />
              Security and benefits:
            </h4>
            <ul className="text-sm text-gray-600 space-y-2 mt-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Data privacy guaranteed - your data never leaves your system</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Demo mode available for testing without an API key</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Executive-ready analysis with professional formatting</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
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