import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Bell, Zap, RefreshCw } from 'lucide-react';
import FormDetailModal from './FormDetailModal';
import { formDataService, FormStats } from '../../services/formDataService';

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

  // Legacy demo data generator for fallback
  const generateMockData = (): FormHealth[] => {
      const realForms = [
        { id: '69', title: 'AA Referral Form', entries: 323, views: 1316, conversion: 24.5 },
        { id: '42', title: 'AFF Email Form', entries: 0, views: 1285, conversion: 0 },
        { id: '74', title: 'AI Form', entries: 24, views: 6625, conversion: 0.4 },
        { id: '67', title: 'Blog News Form', entries: 1923, views: 774617, conversion: 0.2 },
        { id: '58', title: 'Counseling Services Disclosure Policy Form', entries: 0, views: 530, conversion: 0 },
        { id: '81', title: 'Cyber Warrior Program Converze Form', entries: 0, views: 18562, conversion: 0 },
        { id: '68', title: 'Cyber Warrior Program Form', entries: 10731, views: 1116148, conversion: 1 },
        { id: '80', title: 'Cyber Warrior Program Intero Form', entries: 3, views: 99649, conversion: 0 },
        { id: '72', title: 'Cybersecurity Form', entries: 105, views: 12582, conversion: 0.8 },
        { id: '66', title: 'Dear CEO Form', entries: 0, views: 878, conversion: 0 },
        { id: '59', title: 'Dear Tony Form', entries: 13, views: 1552, conversion: 0.8 },
        { id: '77', title: 'Dreambound form', entries: 0, views: 0, conversion: 0 },
        { id: '44', title: 'Evaluation Questions', entries: 6756, views: 77709, conversion: 8.7 },
        { id: '71', title: 'Event - MIC Vegas Form', entries: 0, views: 470, conversion: 0 },
        { id: '75', title: 'Event - Military Career Fairs Form', entries: 152, views: 3064, conversion: 5 },
        { id: '62', title: 'Free Career Evaluation Form', entries: 10435, views: 787919, conversion: 1.3 },
        { id: '54', title: 'Google PPC - Internet Ad Form', entries: 167, views: 48094, conversion: 0.3 },
        { id: '61', title: 'Military Form', entries: 239, views: 16170, conversion: 1.5 },
        { id: '70', title: 'Nellis Walk In Form', entries: 0, views: 499, conversion: 0 },
        { id: '73', title: 'Network Admin Form', entries: 7, views: 5801, conversion: 0.1 },
        { id: '76', title: 'Recruit Military Form', entries: 263, views: 5498, conversion: 4.8 },
        { id: '79', title: 'Request Information 529fb Form', entries: 0, views: 13889, conversion: 0 },
        { id: '78', title: 'Request Information 529g Form', entries: 0, views: 14327, conversion: 0 },
        { id: '60', title: 'Request Information Form', entries: 4477, views: 285600, conversion: 1.6 },
        { id: '63', title: 'Salesforce Training Form', entries: 0, views: 1753, conversion: 0 },
        { id: '55', title: 'Scarlett Scholarship Form', entries: 15, views: 1769, conversion: 0.8 },
        { id: '45', title: 'Schedule Campus Tour Form', entries: 28, views: 5474, conversion: 0.5 },
        { id: '53', title: 'Skillbridge Form', entries: 4299, views: 456115, conversion: 0.9 },
        { id: '82', title: 'Skillbridge Intero Form', entries: 4, views: 89845, conversion: 0 },
        { id: '47', title: 'Social - Facebook Ad Form', entries: 106, views: 57273, conversion: 0.2 },
        { id: '46', title: 'Social - Facebook Form', entries: 1, views: 1196, conversion: 0.1 },
        { id: '52', title: 'Social - Google My Business Form', entries: 0, views: 1193, conversion: 0 },
        { id: '49', title: 'Social - Instagram Ad Form', entries: 0, views: 644, conversion: 0 },
        { id: '48', title: 'Social - Instagram Form', entries: 5, views: 1960, conversion: 0.3 },
        { id: '41', title: 'Social - LinkedIn Form', entries: 0, views: 1497, conversion: 0 },
        { id: '64', title: 'Social - Reddit Form', entries: 0, views: 693, conversion: 0 },
        { id: '65', title: 'Social - Tiktok Form', entries: 581, views: 476125, conversion: 0.1 },
        { id: '51', title: 'Social - Twitter Form', entries: 0, views: 489, conversion: 0 },
        { id: '50', title: 'Social - YouTube Form', entries: 1, views: 731, conversion: 0.1 },
        { id: '57', title: 'VA Counselors Form', entries: 1205, views: 660, conversion: 182.6 },
        { id: '56', title: 'Veteran Advocates Form', entries: 2478, views: 656, conversion: 377.7 },
        { id: '43', title: 'We Are IT Form', entries: 45, views: 2340, conversion: 1.9 }
      ];

      return realForms.map(form => {
        // Simulate different health statuses based on real patterns
        let status: FormHealth['status'] = 'healthy';
        let lastSubmission = '2 minutes ago';
        let errorRate = Math.random() * 2; // 0-2% for healthy forms
        
        // Forms with 0 entries are likely problematic
        if (form.entries === 0 && form.views > 500) {
          status = 'critical';
          lastSubmission = Math.random() > 0.5 ? 'Never' : '5+ days ago';
          errorRate = 15 + Math.random() * 10; // 15-25% error rate
        } else if (form.entries < 5 && form.views > 1000) {
          status = 'warning';
          lastSubmission = '2-6 hours ago';
          errorRate = 5 + Math.random() * 5; // 5-10% error rate
        } else if (form.entries > 0) {
          // Recent activity for forms with entries
          const timeSinceSubmission = Math.random() * 120; // 0-120 minutes
          if (timeSinceSubmission < 30) {
            lastSubmission = `${Math.floor(timeSinceSubmission)} minutes ago`;
          } else if (timeSinceSubmission < 60) {
            lastSubmission = '1 hour ago';
          } else {
            lastSubmission = `${Math.floor(timeSinceSubmission / 60)} hours ago`;
          }
        }

        return {
          id: form.id,
          title: form.title,
          status,
          lastSubmission,
          submissionsToday: Math.floor(form.entries * 0.1), // Simulate daily submissions
          avgSubmissionsPerHour: Math.max(1, Math.floor(form.entries / 30)), // Rough hourly estimate
          errorRate: parseFloat(errorRate.toFixed(1)),
          responseTime: 800 + Math.random() * 2000, // 800-2800ms
          totalEntries: form.entries,
          successRate: 100 - parseFloat(errorRate.toFixed(1))
        };
      });
    };

    // This is now only used as fallback - real data comes from the new useEffect above

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

  return (
    <div className="space-y-6">
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
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              Last updated: {lastUpdate.toLocaleTimeString()}
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