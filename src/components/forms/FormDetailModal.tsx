import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Database, Shield, Zap, Bot } from 'lucide-react';

interface FormDetailModalProps {
  form: {
    id: string;
    title: string;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    lastSubmission: string;
    submissionsToday: number;
    avgSubmissionsPerHour: number;
    errorRate: number;
    responseTime: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface FormSubmission {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'processing';
  processingTime: number;
  integrations: {
    hubspot: 'success' | 'failed' | 'pending';
    email: 'success' | 'failed' | 'pending';
    recaptcha: 'success' | 'failed' | 'pending';
  };
  spamScore: number;
  userAgent: string;
  ip: string;
  location: string;
}

interface SecurityEvent {
  timestamp: string;
  type: 'spam_attempt' | 'bot_detected' | 'suspicious_activity' | 'captcha_failed';
  severity: 'low' | 'medium' | 'high';
  details: string;
  ip: string;
  blocked: boolean;
}

const FormDetailModal: React.FC<FormDetailModalProps> = ({ form, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'security' | 'integrations' | 'ai-analysis'>('submissions');

  if (!isOpen) return null;

  // Mock data for submissions
  const recentSubmissions: FormSubmission[] = Array.from({ length: 20 }, (_, i) => ({
    id: `sub_${i + 1}`,
    timestamp: new Date(Date.now() - i * 30 * 60 * 1000).toLocaleString(),
    status: Math.random() > 0.9 ? 'failed' : 'success',
    processingTime: 800 + Math.random() * 2000,
    integrations: {
      hubspot: Math.random() > 0.95 ? 'failed' : 'success',
      email: Math.random() > 0.98 ? 'failed' : 'success',
      recaptcha: Math.random() > 0.97 ? 'failed' : 'success'
    },
    spamScore: Math.random() * 100,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 4)]
  }));

  // Mock security events
  const securityEvents: SecurityEvent[] = [
    {
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      type: 'spam_attempt',
      severity: 'medium',
      details: 'Multiple rapid submissions from same IP',
      ip: '45.123.45.67',
      blocked: true
    },
    {
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
      type: 'bot_detected',
      severity: 'high',
      details: 'Automated submission pattern detected',
      ip: '192.168.1.100',
      blocked: true
    },
    {
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
      type: 'captcha_failed',
      severity: 'low',
      details: 'reCAPTCHA validation failed',
      ip: '203.45.67.89',
      blocked: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-600" />;
      case 'failed': return <AlertTriangle size={16} className="text-red-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateAIAnalysis = () => {
    const issues = [];
    const recommendations = [];

    if (form.status === 'critical') {
      issues.push("Form has not received submissions despite high view count");
      issues.push("Potential JavaScript errors preventing form submission");
      recommendations.push("Check browser console for JavaScript errors");
      recommendations.push("Verify submit button onclick handlers");
      recommendations.push("Test form submission manually");
    }

    if (form.errorRate > 10) {
      issues.push(`High error rate of ${form.errorRate}% detected`);
      recommendations.push("Review server logs for processing errors");
      recommendations.push("Check database connectivity");
    }

    if (form.responseTime > 2000) {
      issues.push("Slow response times may impact user experience");
      recommendations.push("Optimize form processing logic");
      recommendations.push("Consider server resource allocation");
    }

    return { issues, recommendations };
  };

  const aiAnalysis = generateAIAnalysis();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{form.title}</h2>
              <p className="text-blue-100 text-sm">Form ID: {form.id} | Status: {form.status}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'submissions', label: 'Recent Submissions', icon: Database },
              { id: 'security', label: 'Security Events', icon: Shield },
              { id: 'integrations', label: 'Integrations', icon: Zap },
              { id: 'ai-analysis', label: 'AI Analysis', icon: Bot }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Submissions (Last 50)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Processing Time</th>
                      <th className="px-4 py-3 text-left font-medium">HubSpot</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">reCAPTCHA</th>
                      <th className="px-4 py-3 text-left font-medium">Spam Score</th>
                      <th className="px-4 py-3 text-left font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSubmissions.map(submission => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{submission.timestamp}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getStatusIcon(submission.status)}
                            <span className="ml-2 capitalize">{submission.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{Math.round(submission.processingTime)}ms</td>
                        <td className="px-4 py-3">{getStatusIcon(submission.integrations.hubspot)}</td>
                        <td className="px-4 py-3">{getStatusIcon(submission.integrations.email)}</td>
                        <td className="px-4 py-3">{getStatusIcon(submission.integrations.recaptcha)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            submission.spamScore > 70 ? 'bg-red-100 text-red-800' :
                            submission.spamScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {Math.round(submission.spamScore)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">{submission.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Events (Last 24 hours)</h3>
              <div className="space-y-3">
                {securityEvents.map((event, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield size={20} className="text-red-500 mr-3" />
                        <div>
                          <h4 className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">{event.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span>IP: {event.ip}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.blocked ? 'BLOCKED' : 'ALLOWED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Integration Health Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">HubSpot CRM</h4>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Last sync: 2 minutes ago</p>
                  <p className="text-sm">Success rate: 98.5%</p>
                  <p className="text-sm text-green-600">All leads syncing properly</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Email Notifications</h4>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Last email: 5 minutes ago</p>
                  <p className="text-sm">Delivery rate: 99.2%</p>
                  <p className="text-sm text-green-600">SMTP working normally</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">reCAPTCHA v3</h4>
                    <AlertTriangle size={20} className="text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Last check: 1 minute ago</p>
                  <p className="text-sm">Success rate: 94.1%</p>
                  <p className="text-sm text-yellow-600">Some false positives detected</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Integration Test Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>HubSpot API connectivity</span>
                    <span className="text-green-600">✓ Passed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email server connectivity</span>
                    <span className="text-green-600">✓ Passed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>reCAPTCHA key validation</span>
                    <span className="text-green-600">✓ Passed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database write permissions</span>
                    <span className="text-green-600">✓ Passed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-analysis' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">AI-Powered Form Analysis</h3>
              
              {aiAnalysis.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    Issues Detected
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <Bot size={16} className="mr-2" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Performance Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Average processing time:</span>
                    <span className="ml-2 font-medium">{form.responseTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error rate trend:</span>
                    <span className="ml-2 font-medium">{form.errorRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Submission rate:</span>
                    <span className="ml-2 font-medium">{form.avgSubmissionsPerHour}/hour</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last activity:</span>
                    <span className="ml-2 font-medium">{form.lastSubmission}</span>
                  </div>
                </div>
              </div>

              {form.status === 'healthy' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle size={16} className="mr-2" />
                    Form Health Summary
                  </h4>
                  <p className="text-sm text-green-700">
                    This form is operating normally with good performance metrics and no critical issues detected.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormDetailModal;