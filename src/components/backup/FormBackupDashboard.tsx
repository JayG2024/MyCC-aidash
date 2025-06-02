import React, { useState, useEffect } from 'react';
import { 
  Download, Save, AlertTriangle, CheckCircle, Clock, 
  X, Eye, Code, RefreshCw, Filter, Search 
} from 'lucide-react';
import { formBackupService, FormBackupEntry } from '../../services/formBackupService';

const FormBackupDashboard: React.FC = () => {
  const [backups, setBackups] = useState<FormBackupEntry[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<FormBackupEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    abandoned: 0,
    submitted: 0,
    failed: 0,
    recoverable: 0
  });
  const [selectedEntry, setSelectedEntry] = useState<FormBackupEntry | null>(null);
  const [showTrackingCode, setShowTrackingCode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'submitted' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [backups, filter, searchTerm]);

  const loadData = () => {
    const allBackups = formBackupService.getAllBackups();
    setBackups(allBackups);
    setStats(formBackupService.getBackupStats());
  };

  const applyFilters = () => {
    let filtered = [...backups];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(backup => backup.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(backup => 
        backup.formTitle.toLowerCase().includes(term) ||
        backup.formId.includes(term) ||
        JSON.stringify(backup.fieldData).toLowerCase().includes(term)
      );
    }
    
    setFilteredBackups(filtered);
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = formBackupService.exportBackupData(undefined, format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-backups-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTrackingCode = () => {
    return formBackupService.generateTrackingScript({
      dashboardUrl: window.location.origin,
      apiKey: 'mycc_dashboard_key', // In production, this would be a real API key
      formsToTrack: ['*'] // Track all forms
    });
  };

  const getStatusIcon = (status: FormBackupEntry['status']) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'abandoned':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'failed':
        return <X size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-blue-600" />;
    }
  };

  const getStatusColor = (status: FormBackupEntry['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const extractContactInfo = (entry: FormBackupEntry) => {
    const fieldData = entry.fieldData;
    let email = '', name = '', phone = '';
    
    for (const [key, field] of Object.entries(fieldData)) {
      if (field.type === 'email' || key.toLowerCase().includes('email')) {
        email = field.value || '';
      } else if (key.toLowerCase().includes('name') && field.value) {
        name += (name ? ' ' : '') + field.value;
      } else if (field.type === 'tel' || key.toLowerCase().includes('phone')) {
        phone = field.value || '';
      }
    }
    
    return { email, name, phone };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Form Data Backup System</h3>
            <p className="text-sm text-gray-600">
              Real-time backup of form entries to prevent data loss
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTrackingCode(!showTrackingCode)}
              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Code size={16} className="mr-2" />
              Tracking Code
            </button>
            
            <button
              onClick={loadData}
              className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Backups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.abandoned}</div>
            <div className="text-sm text-gray-600">Abandoned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.recoverable}</div>
            <div className="text-sm text-gray-600">Recoverable</div>
          </div>
        </div>
      </div>

      {/* Tracking Code Modal */}
      {showTrackingCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Website Tracking Code</h3>
              <button
                onClick={() => setShowTrackingCode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Add this code to your MyComputerCareer website (before the closing &lt;/body&gt; tag) 
                to start backing up form data in real-time:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{generateTrackingCode()}</code>
                </pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📝 Smart Backup System:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Automatically tracks all Gravity Forms on your website</li>
                  <li>• <strong>Only saves when contact info is entered</strong> (email + name/phone)</li>
                  <li>• Saves 3 seconds after valuable data is entered</li>
                  <li>• Tracks abandoned forms for follow-up opportunities</li>
                  <li>• Provides data recovery when forms fail to submit</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">⚡ Ultra-Lightweight Performance:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Smart triggers</strong> - Only saves when valuable contact data exists</li>
                  <li>• <strong>No constant polling</strong> - Zero website performance impact</li>
                  <li>• <strong>Local storage first</strong> - No network requests during form filling</li>
                  <li>• <strong>Minimal sync</strong> - Dashboard sync only once per minute</li>
                  <li>• <strong>Tiny footprint</strong> - ~3KB compressed JavaScript</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="abandoned">Abandoned</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 flex-1">
            <Search size={16} className="text-gray-600" />
            <input
              type="text"
              placeholder="Search forms, emails, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('csv')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} className="mr-2" />
              CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={16} className="mr-2" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Backup Entries */}
      <div className="px-6 py-4">
        {filteredBackups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Save size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No form backups found.</p>
            <p className="text-sm mt-1">Install the tracking code to start backing up form data.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredBackups.map(entry => {
              const contact = extractContactInfo(entry);
              return (
                <div
                  key={entry.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(entry.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.formTitle}</h4>
                        <div className="text-sm text-gray-600">
                          {contact.name && <span className="mr-4">👤 {contact.name}</span>}
                          {contact.email && <span className="mr-4">📧 {contact.email}</span>}
                          {contact.phone && <span>📞 {contact.phone}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status.toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.completionPercentage}% complete
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(entry.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{selectedEntry.formTitle}</h3>
                <p className="text-sm text-gray-600">Form ID: {selectedEntry.formId}</p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedEntry.status)}`}>
                      {selectedEntry.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Completion</label>
                  <div className="mt-1 text-sm">{selectedEntry.completionPercentage}%</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Started</label>
                  <div className="mt-1 text-sm">{formatTimestamp(selectedEntry.timestamp)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <div className="mt-1 text-sm">{formatTimestamp(selectedEntry.lastUpdated)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Form Fields</label>
                <div className="space-y-3">
                  {Object.entries(selectedEntry.fieldData).map(([key, field]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-sm">{field.label || key}</h5>
                          <p className="text-sm text-gray-600">
                            Type: {field.type} {field.required && '(Required)'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          field.isEmpty ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {field.isEmpty ? 'Empty' : 'Filled'}
                        </span>
                      </div>
                      {field.value && (
                        <div className="mt-2 text-sm font-medium">
                          Value: {typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                        </div>
                      )}
                      {field.lastModified && (
                        <div className="mt-1 text-xs text-gray-500">
                          Last modified: {formatTimestamp(field.lastModified)} 
                          ({field.changeCount} changes)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBackupDashboard;