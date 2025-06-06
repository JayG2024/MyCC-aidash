import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import FormHealthMonitor from '../components/forms/FormHealthMonitor';
import APIConfiguration from '../components/settings/APIConfiguration';
import EmergencyAlertPanel from '../components/alerts/EmergencyAlertPanel';
import { Settings } from 'lucide-react';

const FormMonitoring: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Layout title="Form Health Monitoring">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Form Health Monitoring
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time monitoring of all Gravity Forms for technical issues and performance
              </p>
              <div className="mt-3 text-sm text-gray-500">
                <span className="font-medium">Update Frequency:</span> Every 5 minutes | 
                <span className="font-medium ml-2">Forms Monitored:</span> 42 active forms
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Settings size={16} className="mr-2" />
              {showSettings ? 'Hide Settings' : 'API Settings'}
            </button>
          </div>
        </div>

        {showSettings && <APIConfiguration />}

        {/* Temporarily disabled until real API is working */}
        {/* <EmergencyAlertPanel /> */}

        <FormHealthMonitor />
      </div>
    </Layout>
  );
};

export default FormMonitoring;