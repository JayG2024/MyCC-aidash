import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import SubmissionTracker from '../components/dashboard/SubmissionTracker';
import EmergencyAlertPanel from '../components/alerts/EmergencyAlertPanel';
import { 
  Database, Shield, FileText, Bell, ArrowRight,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Settings, Save
} from 'lucide-react';

const Analytics: React.FC = () => {
  const isDemoMode = process.env.REACT_APP_ENABLE_DEMO_MODE === 'true' || 
                    !process.env.REACT_APP_GF_CONSUMER_KEY ||
                    !process.env.REACT_APP_GF_CONSUMER_SECRET;

  // Mock data for quick overview metrics
  const quickMetrics = {
    dataAnalysis: {
      datasetsAnalyzed: 12,
      totalRows: '2.4M',
      avgProcessingTime: '1.2s',
      trend: '+15%'
    },
    gravityForms: {
      totalForms: 42,
      entriesProcessed: '18.5K',
      integrationHealth: '98.2%',
      trend: '+8%'
    },
    formMonitoring: {
      healthyForms: 38,
      criticalIssues: 4,
      avgResponseTime: '1.8s',
      uptime: '99.1%'
    },
    notifications: {
      activeRules: 6,
      alertsSent: 23,
      avgResponseTime: '45s',
      successRate: '96%'
    }
  };

  const QuickOverviewCard = ({ 
    title, 
    icon, 
    metrics, 
    linkTo, 
    statusColor = 'text-green-600',
    bgColor = 'bg-blue-50'
  }: {
    title: string;
    icon: React.ReactNode;
    metrics: Array<{ label: string; value: string; subtext?: string }>;
    linkTo: string;
    statusColor?: string;
    bgColor?: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${bgColor} mr-3`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <Link 
          to={linkTo}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <p className="text-sm text-gray-600">{metric.label}</p>
            <p className="text-xl font-bold text-gray-800">{metric.value}</p>
            {metric.subtext && (
              <p className={`text-xs ${statusColor} font-medium`}>{metric.subtext}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout title="Dashboard Overview">
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Quick access to key metrics from all monitoring features</p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* API Status Banner */}
          {isDemoMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-yellow-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Demo Mode Active</h4>
                    <p className="text-sm text-yellow-700">
                      Currently showing demo data. Configure Gravity Forms API for real-time monitoring.
                    </p>
                  </div>
                </div>
                <Link 
                  to="/form-monitoring"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Configure API
                </Link>
              </div>
            </div>
          )}

          {/* Emergency Alert System - Top Priority */}
          <EmergencyAlertPanel />

          {/* Form Submission Tracker - Priority Widget */}
          <SubmissionTracker />

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Analysis Overview */}
            <QuickOverviewCard
              title="Data Upload & Analysis"
              icon={<Database size={24} className="text-blue-600" />}
              linkTo="/data-analysis"
              bgColor="bg-blue-50"
              statusColor="text-green-600"
              metrics={[
                { label: 'Datasets Analyzed', value: quickMetrics.dataAnalysis.datasetsAnalyzed.toString() },
                { label: 'Total Rows Processed', value: quickMetrics.dataAnalysis.totalRows },
                { label: 'Avg Processing Time', value: quickMetrics.dataAnalysis.avgProcessingTime },
                { label: 'Performance Trend', value: quickMetrics.dataAnalysis.trend, subtext: 'vs last month' }
              ]}
            />

            {/* Gravity Forms Overview */}
            <QuickOverviewCard
              title="Gravity Forms Data"
              icon={<FileText size={24} className="text-purple-600" />}
              linkTo="/gravity-forms"
              bgColor="bg-purple-50"
              statusColor="text-green-600"
              metrics={[
                { label: 'Total Forms', value: quickMetrics.gravityForms.totalForms.toString() },
                { label: 'Entries Processed', value: quickMetrics.gravityForms.entriesProcessed },
                { label: 'Integration Health', value: quickMetrics.gravityForms.integrationHealth, subtext: 'HubSpot sync rate' },
                { label: 'Growth Trend', value: quickMetrics.gravityForms.trend, subtext: 'vs last month' }
              ]}
            />

            {/* Form Health Monitoring Overview */}
            <QuickOverviewCard
              title="Form Health Monitor"
              icon={<Shield size={24} className="text-green-600" />}
              linkTo="/form-monitoring"
              bgColor="bg-green-50"
              statusColor={quickMetrics.formMonitoring.criticalIssues > 0 ? "text-red-600" : "text-green-600"}
              metrics={[
                { label: 'Healthy Forms', value: `${quickMetrics.formMonitoring.healthyForms}/42` },
                { 
                  label: 'Critical Issues', 
                  value: quickMetrics.formMonitoring.criticalIssues.toString(),
                  subtext: quickMetrics.formMonitoring.criticalIssues > 0 ? 'Needs attention' : 'All clear'
                },
                { label: 'Avg Response Time', value: quickMetrics.formMonitoring.avgResponseTime },
                { label: 'System Uptime', value: quickMetrics.formMonitoring.uptime, subtext: 'Last 30 days' }
              ]}
            />

            {/* Notification Settings Overview */}
            <QuickOverviewCard
              title="Notification Settings"
              icon={<Bell size={24} className="text-orange-600" />}
              linkTo="/notification-settings"
              bgColor="bg-orange-50"
              statusColor="text-blue-600"
              metrics={[
                { label: 'Active Alert Rules', value: quickMetrics.notifications.activeRules.toString() },
                { label: 'Alerts Sent Today', value: quickMetrics.notifications.alertsSent.toString() },
                { label: 'Avg Response Time', value: quickMetrics.notifications.avgResponseTime },
                { label: 'Delivery Success', value: quickMetrics.notifications.successRate, subtext: 'All channels' }
              ]}
            />
          </div>

          {/* System Status Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle size={20} className="text-green-600 mr-2" />
              System Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Form Monitoring</span>
                </div>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Data Processing</span>
                </div>
                <p className="text-xs text-gray-600">Running smoothly</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Integrations</span>
                </div>
                <p className="text-xs text-gray-600">Minor delays detected</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Notifications</span>
                </div>
                <p className="text-xs text-gray-600">All channels active</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/data-analysis"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
              >
                <Database size={20} className="text-blue-600 mr-3" />
                <span className="font-medium text-gray-700">Upload Data</span>
              </Link>
              
              <Link 
                to="/form-monitoring"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
              >
                <Shield size={20} className="text-green-600 mr-3" />
                <span className="font-medium text-gray-700">Check Forms</span>
              </Link>
              
              <Link 
                to="/notification-settings"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
              >
                <Settings size={20} className="text-orange-600 mr-3" />
                <span className="font-medium text-gray-700">Set Alerts</span>
              </Link>
              
              <Link 
                to="/gravity-forms"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
              >
                <FileText size={20} className="text-purple-600 mr-3" />
                <span className="font-medium text-gray-700">View Forms</span>
              </Link>
              
              <Link 
                to="/form-backup"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
              >
                <Save size={20} className="text-green-600 mr-3" />
                <span className="font-medium text-gray-700">Form Backup</span>
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default Analytics;