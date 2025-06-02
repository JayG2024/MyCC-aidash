import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Bell, Zap, RefreshCw } from 'lucide-react';

interface FormHealth {
  id: string;
  title: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastSubmission: string;
  submissionsToday: number;
  avgSubmissionsPerHour: number;
  errorRate: number;
  responseTime: number;
}

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

  // Mock data for demonstration
  useEffect(() => {
    const mockData: FormHealth[] = [
      {
        id: '1',
        title: 'Contact Form - Main Page',
        status: 'healthy',
        lastSubmission: '2 minutes ago',
        submissionsToday: 23,
        avgSubmissionsPerHour: 12,
        errorRate: 0.5,
        responseTime: 1200
      },
      {
        id: '2',
        title: 'Lead Generation Form',
        status: 'warning',
        lastSubmission: '45 minutes ago',
        submissionsToday: 8,
        avgSubmissionsPerHour: 15,
        errorRate: 2.1,
        responseTime: 2800
      },
      {
        id: '3',
        title: 'Newsletter Signup',
        status: 'critical',
        lastSubmission: '3 hours ago',
        submissionsToday: 1,
        avgSubmissionsPerHour: 25,
        errorRate: 15.3,
        responseTime: 8900
      }
    ];
    setFormsHealth(mockData);
    setLoading(false);
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateHourlyLoss = (avgSubmissionsPerHour: number) => {
    // Assuming average lead value of $75
    const avgLeadValue = 75;
    return avgSubmissionsPerHour * avgLeadValue;
  };

  const totalHourlyRevenue = formsHealth.reduce((sum, form) => {
    return sum + calculateHourlyLoss(form.avgSubmissionsPerHour);
  }, 0);

  const criticalFormsLoss = formsHealth
    .filter(form => form.status === 'critical' || form.status === 'offline')
    .reduce((sum, form) => sum + calculateHourlyLoss(form.avgSubmissionsPerHour), 0);

  return (
    <div className="space-y-6">
      {/* Revenue Impact Alert */}
      {criticalFormsLoss > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <Zap className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-bold text-red-800">
                Revenue Impact Alert
              </h3>
              <p className="text-red-700">
                <span className="font-bold">{formatCurrency(criticalFormsLoss)}/hour</span> potential revenue loss from failed forms
              </p>
              <p className="text-sm text-red-600 mt-1">
                Total hourly potential: {formatCurrency(totalHourlyRevenue)}
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
              <p className="text-sm text-gray-600">Hourly Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalHourlyRevenue)}
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
                  Revenue Impact
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
                      {formatCurrency(calculateHourlyLoss(form.avgSubmissionsPerHour))}/hr
                    </div>
                    {(form.status === 'critical' || form.status === 'offline') && (
                      <div className="text-xs text-red-600 font-medium">
                        REVENUE AT RISK
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormHealthMonitor;