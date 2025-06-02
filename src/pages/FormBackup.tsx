import React from 'react';
import Layout from '../components/layout/Layout';
import FormBackupDashboard from '../components/backup/FormBackupDashboard';
import { Save, Shield, Clock } from 'lucide-react';

const FormBackup: React.FC = () => {
  return (
    <Layout title="Form Data Backup">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Save size={28} className="mr-3 text-blue-600" />
                Form Data Backup System
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time backup and recovery of form submissions to prevent data loss
              </p>
              <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-green-600" />
                  <span>Automatic Protection</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-blue-600" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center">
                  <Save size={16} className="mr-2 text-purple-600" />
                  <span>Instant Recovery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Save size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Auto-Backup</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Smart backup system that only saves when valuable contact info (email + name/phone) is entered. Zero performance impact on your website.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Shield size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Data Recovery</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Recover lost submissions from plugin failures, database issues, or server problems. Export data in CSV or JSON format.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Clock size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Abandoned Forms</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track partially completed forms and follow up with users who started but didn't submit. Recover lost leads.
            </p>
          </div>
        </div>

        {/* Main Dashboard */}
        <FormBackupDashboard />

        {/* Implementation Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Implementation Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Install Tracking Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                Click "Tracking Code" above to get the JavaScript code. Add it to your MyComputerCareer website before the closing &lt;/body&gt; tag.
              </p>
              
              <h4 className="font-medium text-gray-800 mb-2">2. Test the System</h4>
              <p className="text-sm text-gray-600">
                Fill out a form partially on your website, then check this dashboard to see the backup data appear.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">3. Monitor & Recover</h4>
              <p className="text-sm text-gray-600 mb-4">
                Use the dashboard to monitor abandoned forms and export data when needed for recovery.
              </p>
              
              <h4 className="font-medium text-gray-800 mb-2">4. Emergency Recovery</h4>
              <p className="text-sm text-gray-600">
                When plugins fail or data is lost, export the backup data and manually process the submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormBackup;