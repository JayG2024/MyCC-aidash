import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Bell, Zap, RefreshCw, Settings, Save } from 'lucide-react';
import FormDetailModal from './FormDetailModal';
import { formDataService, FormStats } from '../../services/formDataService';
import { updateAPIConfig, GravityFormsConfig } from '../../services/gravityFormsAPI';

// Use FormStats from service instead of local interface
type FormHealth = FormStats;

interface AlertRule {
  id: string;
  formId: string;
  type: 'no_submissions' | 'low_volume' | 'high_error_rate';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;
}

const FormHealthMonitor: React.FC = () => {
  const [formsHealth, setFormsHealth] = useState<FormHealth[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedForm, setSelectedForm] = useState<FormHealth | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<GravityFormsConfig>({
    baseUrl: 'https://www.mycomputercareer.edu',
    consumerKey: 'ck_594bb734d34bfd182e012626d7f7540a88e3bf40',
    consumerSecret: 'cs_8f95fa9e4fe83404a9beff5fd917ab064e405183'
  });

  // Load saved API config on component mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('gravityFormsConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.baseUrl && parsed.consumerKey && parsed.consumerSecret) {
          setApiConfig(parsed);
          console.log('📋 Loaded saved API configuration from localStorage');
        }
      }
    } catch (error) {
      console.warn('Error loading saved API config:', error);
    }
  }, []);

  // Load real form data from API
  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        const formStats = await formDataService.getFormStats();
        setFormsHealth(formStats);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(loadFormData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Removed demo data generator - now shows only real API data

  const getStatusColor = (status: FormHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: FormHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'critical': return <AlertTriangle size={16} />;
      case 'offline': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const totalSubmissionsToday = formsHealth.reduce((sum, form) => sum + form.submissionsToday, 0);
  const avgResponseTime = formsHealth.reduce((sum, form) => sum + form.responseTime, 0) / formsHealth.length;
  const criticalFormsCount = formsHealth.filter(form => form.status === 'critical' || form.status === 'offline').length;

  const handleViewDetails = (form: FormHealth) => {
    setSelectedForm(form);
    setIsModalOpen(true);
  };

  const handleDebugForm = (form: FormHealth) => {
    setSelectedForm(form);
    setIsModalOpen(true);
  };

  const handleSaveAPIConfig = () => {
    updateAPIConfig(apiConfig);
    setShowSettings(false);
    // Reload form data with new config
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="mr-2" size={20} />
              API Configuration
            </h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>
        </div>
        
        {showSettings && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WordPress Site URL</label>
              <input
                type="url"
                value={apiConfig.baseUrl}
                onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://www.mycomputercareer.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Key</label>
              <input
                type="text"
                value={apiConfig.consumerKey}
                onChange={(e) => setApiConfig({ ...apiConfig, consumerKey: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Secret</label>
              <input
                type="password"
                value={apiConfig.consumerSecret}
                onChange={(e) => setApiConfig({ ...apiConfig, consumerSecret: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveAPIConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="mr-2" size={16} />
                Save & Test Connection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {formsHealth.length === 0 && !loading && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="text-amber-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-bold text-amber-800">
                CORS Configuration Required
              </h3>
              <p className="text-amber-700 mb-3">
                The MyComputerCareer website needs CORS configuration to allow API access from this dashboard.
              </p>
              <div className="bg-amber-100 p-3 rounded-lg text-sm text-amber-800">
                <p className="font-medium mb-2">WordPress Admin needs to:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Install a CORS plugin (like "CORS" by WebFactory)</li>
                  <li>Add this domain to allowed origins: <code className="bg-amber-200 px-1 rounded">https://mycc-ai-dashboard.web.app</code></li>
                  <li>Or fix the duplicate Access-Control-Allow-Origin headers</li>
                </ol>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium mt-3"
              >
                Configure API Settings (will work after CORS is fixed) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issues Alert */}
      {criticalFormsCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <Zap className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-800">
                Critical Form Issues Detected
              </h3>
              <p className="text-red-700">
                <span className="font-bold">{criticalFormsCount} forms</span> require immediate attention
              </p>
              <p className="text-sm text-red-600 mt-1">
                Forms may not be accepting submissions or have processing errors
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold">{formsHealth.length}</p>
              <p className="text-xs text-gray-500 mt-1">{totalSubmissionsToday} submissions today</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <RefreshCw className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy Forms</p>
              <p className="text-2xl font-bold text-green-600">
                {formsHealth.filter(f => f.status === 'healthy').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {formsHealth.filter(f => f.status === 'critical' || f.status === 'offline').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(avgResponseTime)}ms
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Forms Health Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Form Health Status
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  window.location.reload();
                }}
                className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                disabled={loading}
              >
                <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg/Hour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formsHealth.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {form.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {form.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {getStatusIcon(form.status)}
                      <span className="ml-1 capitalize">{form.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {form.lastSubmission}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {form.submissionsToday}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {form.avgSubmissionsPerHour}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      form.errorRate > 10 ? 'text-red-600' : 
                      form.errorRate > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {form.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {form.responseTime}ms
                    </div>
                    {form.responseTime > 2000 && (
                      <div className="text-xs text-red-600 font-medium">
                        SLOW
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleViewDetails(form)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                    >
                      View Details
                    </button>
                    {(form.status === 'critical' || form.status === 'warning') && (
                      <button 
                        onClick={() => handleDebugForm(form)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Debug
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Detail Modal */}
      {selectedForm && (
        <FormDetailModal
          form={selectedForm}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedForm(null);
          }}
        />
      )}
    </div>
  );
};

export default FormHealthMonitor;