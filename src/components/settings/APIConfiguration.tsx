import React, { useState } from 'react';
import { Settings, Check, AlertTriangle, Key, Globe } from 'lucide-react';

interface APIConfig {
  wordpressUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

const APIConfiguration: React.FC = () => {
  const [config, setConfig] = useState<APIConfig>({
    wordpressUrl: process.env.REACT_APP_WORDPRESS_URL || 'https://mycomputercareer.edu',
    consumerKey: process.env.REACT_APP_GF_CONSUMER_KEY || '',
    consumerSecret: process.env.REACT_APP_GF_CONSUMER_SECRET || ''
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isDemo, setIsDemo] = useState(process.env.REACT_APP_ENABLE_DEMO_MODE === 'true');

  const handleConfigChange = (field: keyof APIConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setTestStatus('testing');
    
    try {
      const credentials = btoa(`${config.consumerKey}:${config.consumerSecret}`);
      const response = await fetch(`${config.wordpressUrl}/wp-json/gf/v2/forms`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTimeout(() => setTestStatus('idle'), 5000);
      }
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 5000);
    }
  };

  const getTestStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <Check size={16} className="text-green-600" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getTestStatusText = () => {
    switch (testStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'success':
        return 'Connection successful!';
      case 'error':
        return 'Connection failed. Check your credentials.';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <Settings size={24} className="text-blue-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
          <p className="text-sm text-gray-600">Configure Gravity Forms API access for real-time data</p>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-yellow-800">Demo Mode</h4>
            <p className="text-sm text-yellow-700">
              {isDemo ? 'Currently showing demo data' : 'Connected to live Gravity Forms API'}
            </p>
          </div>
          <button
            onClick={() => setIsDemo(!isDemo)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isDemo 
                ? 'bg-yellow-200 text-yellow-800' 
                : 'bg-green-200 text-green-800'
            }`}
          >
            {isDemo ? 'Enable Live Data' : 'Use Demo Data'}
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe size={16} className="inline mr-2" />
            WordPress Site URL
          </label>
          <input
            type="url"
            value={config.wordpressUrl}
            onChange={(e) => handleConfigChange('wordpressUrl', e.target.value)}
            placeholder="https://mycomputercareer.edu"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The base URL of your WordPress site with Gravity Forms
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="inline mr-2" />
            Consumer Key
          </label>
          <input
            type="text"
            value={config.consumerKey}
            onChange={(e) => handleConfigChange('consumerKey', e.target.value)}
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="inline mr-2" />
            Consumer Secret
          </label>
          <input
            type="password"
            value={config.consumerSecret}
            onChange={(e) => handleConfigChange('consumerSecret', e.target.value)}
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={testConnection}
            disabled={!config.consumerKey || !config.consumerSecret || testStatus === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {getTestStatusIcon()}
            <span className="ml-2">Test Connection</span>
          </button>

          {testStatus !== 'idle' && (
            <div className="flex items-center">
              {getTestStatusIcon()}
              <span className={`ml-2 text-sm ${
                testStatus === 'success' ? 'text-green-600' : 
                testStatus === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {getTestStatusText()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Setup Instructions</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Go to your WordPress admin → Gravity Forms → Settings → REST API</li>
          <li>2. Create new API Key with "Read" permissions</li>
          <li>3. Copy the Consumer Key and Consumer Secret</li>
          <li>4. Paste them above and test the connection</li>
        </ol>
      </div>
    </div>
  );
};

export default APIConfiguration;