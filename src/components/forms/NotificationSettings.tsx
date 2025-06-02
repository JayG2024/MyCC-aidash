import React, { useState, useEffect } from 'react';
import { Bell, Settings, Mail, MessageSquare, Phone, AlertTriangle, Clock, Shield, Zap, Save } from 'lucide-react';

interface NotificationRule {
  id: string;
  formId: string;
  formTitle: string;
  type: 'submission_stopped' | 'high_error_rate' | 'spam_detected' | 'integration_failed' | 'slow_response';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;
  channels: {
    email: boolean;
    slack: boolean;
    sms: boolean;
    dashboard: boolean;
  };
  recipients: {
    emails: string[];
    phones: string[];
    slackChannels: string[];
  };
}

interface FormOption {
  id: string;
  title: string;
}

const NotificationSettings: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [forms, setForms] = useState<FormOption[]>([]);
  
  // Global notification settings
  const [globalSettings, setGlobalSettings] = useState({
    emailEnabled: true,
    slackEnabled: true,
    smsEnabled: false,
    dashboardEnabled: true,
    defaultRecipients: {
      emails: ['admin@mycomputercareer.edu'],
      phones: ['+1234567890'],
      slackChannels: ['#form-alerts']
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  // Initialize with mock forms and some default rules
  useEffect(() => {
    const mockForms: FormOption[] = [
      { id: '69', title: 'AA Referral Form' },
      { id: '68', title: 'Cyber Warrior Program Form' },
      { id: '62', title: 'Free Career Evaluation Form' },
      { id: '60', title: 'Request Information Form' },
      { id: '53', title: 'Skillbridge Form' },
      { id: '44', title: 'Evaluation Questions' },
      // Add more as needed
    ];
    setForms(mockForms);

    // Default critical rules for high-traffic forms
    const defaultRules: NotificationRule[] = [
      {
        id: '1',
        formId: '68',
        formTitle: 'Cyber Warrior Program Form',
        type: 'submission_stopped',
        threshold: 2, // 2 consecutive failures
        timeWindow: 30, // within 30 minutes
        enabled: true,
        channels: { email: true, slack: true, sms: true, dashboard: true },
        recipients: {
          emails: ['admin@mycomputercareer.edu', 'tech@mycomputercareer.edu'],
          phones: ['+1234567890'],
          slackChannels: ['#critical-alerts', '#form-monitoring']
        }
      },
      {
        id: '2',
        formId: '62',
        formTitle: 'Free Career Evaluation Form',
        type: 'high_error_rate',
        threshold: 15, // 15% error rate
        timeWindow: 60, // within 1 hour
        enabled: true,
        channels: { email: true, slack: true, sms: false, dashboard: true },
        recipients: {
          emails: ['admin@mycomputercareer.edu'],
          phones: [],
          slackChannels: ['#form-monitoring']
        }
      }
    ];
    setRules(defaultRules);
  }, []);

  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    formId: '',
    type: 'submission_stopped',
    threshold: 2,
    timeWindow: 30,
    enabled: true,
    channels: { email: true, slack: false, sms: false, dashboard: true },
    recipients: { emails: [], phones: [], slackChannels: [] }
  });

  const ruleTypes = [
    {
      id: 'submission_stopped',
      label: 'Submissions Stopped',
      description: 'Alert when consecutive submissions fail',
      icon: AlertTriangle,
      thresholdLabel: 'Failed attempts',
      thresholdMin: 1,
      thresholdMax: 10
    },
    {
      id: 'high_error_rate',
      label: 'High Error Rate',
      description: 'Alert when error rate exceeds threshold',
      icon: Zap,
      thresholdLabel: 'Error rate (%)',
      thresholdMin: 5,
      thresholdMax: 50
    },
    {
      id: 'spam_detected',
      label: 'Spam Activity',
      description: 'Alert when spam attempts detected',
      icon: Shield,
      thresholdLabel: 'Spam attempts',
      thresholdMin: 5,
      thresholdMax: 100
    },
    {
      id: 'integration_failed',
      label: 'Integration Failure',
      description: 'Alert when HubSpot/email fails',
      icon: Zap,
      thresholdLabel: 'Failed integrations',
      thresholdMin: 1,
      thresholdMax: 10
    },
    {
      id: 'slow_response',
      label: 'Slow Response Time',
      description: 'Alert when forms respond slowly',
      icon: Clock,
      thresholdLabel: 'Response time (ms)',
      thresholdMin: 2000,
      thresholdMax: 10000
    }
  ];

  const handleAddRule = () => {
    if (!newRule.formId || !newRule.type) return;
    
    const formTitle = forms.find(f => f.id === newRule.formId)?.title || 'Unknown Form';
    const rule: NotificationRule = {
      id: Date.now().toString(),
      formId: newRule.formId,
      formTitle,
      type: newRule.type as any,
      threshold: newRule.threshold || 2,
      timeWindow: newRule.timeWindow || 30,
      enabled: newRule.enabled || true,
      channels: newRule.channels || { email: true, slack: false, sms: false, dashboard: true },
      recipients: newRule.recipients || { emails: [], phones: [], slackChannels: [] }
    };

    setRules([...rules, rule]);
    setNewRule({
      formId: '',
      type: 'submission_stopped',
      threshold: 2,
      timeWindow: 30,
      enabled: true,
      channels: { email: true, slack: false, sms: false, dashboard: true },
      recipients: { emails: [], phones: [], slackChannels: [] }
    });
    setShowAddRule(false);
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const getRuleTypeInfo = (type: string) => {
    return ruleTypes.find(t => t.id === type) || ruleTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Bell className="mr-2" size={24} />
              Notification Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Configure alerts for form issues and submission problems
            </p>
          </div>
          <button
            onClick={() => setShowAddRule(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Alert Rule
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Global Notification Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Notification Channels</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalSettings.emailEnabled}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    emailEnabled: e.target.checked
                  })}
                  className="mr-3"
                />
                <Mail size={16} className="mr-2" />
                Email Notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalSettings.slackEnabled}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    slackEnabled: e.target.checked
                  })}
                  className="mr-3"
                />
                <MessageSquare size={16} className="mr-2" />
                Slack Notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={globalSettings.smsEnabled}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    smsEnabled: e.target.checked
                  })}
                  className="mr-3"
                />
                <Phone size={16} className="mr-2" />
                SMS Notifications (Critical Only)
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Default Recipients</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Addresses</label>
                <textarea
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  placeholder="admin@mycomputercareer.edu, tech@mycomputercareer.edu"
                  value={globalSettings.defaultRecipients.emails.join(', ')}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    defaultRecipients: {
                      ...globalSettings.defaultRecipients,
                      emails: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Slack Channels</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="#form-alerts, #critical-alerts"
                  value={globalSettings.defaultRecipients.slackChannels.join(', ')}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    defaultRecipients: {
                      ...globalSettings.defaultRecipients,
                      slackChannels: e.target.value.split(',').map(channel => channel.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Alert Rules ({rules.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rules.map(rule => {
            const typeInfo = getRuleTypeInfo(rule.type);
            return (
              <div key={rule.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <label className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="mr-3"
                      />
                      <typeInfo.icon size={20} className="mr-3 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{rule.formTitle}</h4>
                        <p className="text-sm text-gray-600">
                          {typeInfo.label}: {rule.threshold}{rule.type === 'high_error_rate' ? '%' : rule.type === 'slow_response' ? 'ms' : ''} 
                          {rule.type !== 'slow_response' && ` within ${rule.timeWindow} minutes`}
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      {rule.channels.email && <Mail size={16} className="text-blue-600" />}
                      {rule.channels.slack && <MessageSquare size={16} className="text-green-600" />}
                      {rule.channels.sms && <Phone size={16} className="text-red-600" />}
                      {rule.channels.dashboard && <Bell size={16} className="text-purple-600" />}
                    </div>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add Alert Rule</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
                <select
                  value={newRule.formId || ''}
                  onChange={(e) => setNewRule({ ...newRule, formId: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a form</option>
                  {forms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                <select
                  value={newRule.type || 'submission_stopped'}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  {ruleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                {newRule.type && (
                  <p className="text-sm text-gray-600 mt-1">
                    {getRuleTypeInfo(newRule.type).description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {newRule.type ? getRuleTypeInfo(newRule.type).thresholdLabel : 'Threshold'}
                  </label>
                  <input
                    type="number"
                    value={newRule.threshold || 2}
                    onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                    min={newRule.type ? getRuleTypeInfo(newRule.type).thresholdMin : 1}
                    max={newRule.type ? getRuleTypeInfo(newRule.type).thresholdMax : 100}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {newRule.type !== 'slow_response' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Window (minutes)</label>
                    <input
                      type="number"
                      value={newRule.timeWindow || 30}
                      onChange={(e) => setNewRule({ ...newRule, timeWindow: parseInt(e.target.value) })}
                      min={5}
                      max={1440}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.email || false}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        channels: { ...newRule.channels, email: e.target.checked } as any
                      })}
                      className="mr-2"
                    />
                    <Mail size={16} className="mr-2" />
                    Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.slack || false}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        channels: { ...newRule.channels, slack: e.target.checked } as any
                      })}
                      className="mr-2"
                    />
                    <MessageSquare size={16} className="mr-2" />
                    Slack
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.sms || false}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        channels: { ...newRule.channels, sms: e.target.checked } as any
                      })}
                      className="mr-2"
                    />
                    <Phone size={16} className="mr-2" />
                    SMS
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.dashboard || true}
                      onChange={(e) => setNewRule({
                        ...newRule,
                        channels: { ...newRule.channels, dashboard: e.target.checked } as any
                      })}
                      className="mr-2"
                    />
                    <Bell size={16} className="mr-2" />
                    Dashboard
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRule(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
          <Save size={16} className="mr-2" />
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;