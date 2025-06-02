import React, { useState, useEffect } from 'react';
import { AlertTriangle, XCircle, CheckCircle, Clock, Bell, BellOff, Settings, X } from 'lucide-react';
import { emergencyAlertService, EmergencyAlert, EmergencyThresholds } from '../../services/emergencyAlerts';

const EmergencyAlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState<EmergencyThresholds[]>([]);

  useEffect(() => {
    // Load initial data
    setAlerts(emergencyAlertService.getAllAlerts());
    setActiveAlerts(emergencyAlertService.getActiveAlerts());
    setIsMonitoring(emergencyAlertService.isCurrentlyMonitoring());
    setThresholds(emergencyAlertService.getThresholds());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setAlerts(emergencyAlertService.getAllAlerts());
      setActiveAlerts(emergencyAlertService.getActiveAlerts());
      setIsMonitoring(emergencyAlertService.isCurrentlyMonitoring());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      emergencyAlertService.stopMonitoring();
    } else {
      emergencyAlertService.startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const resolveAlert = (alertId: string) => {
    emergencyAlertService.resolveAlert(alertId);
    setActiveAlerts(emergencyAlertService.getActiveAlerts());
    setAlerts(emergencyAlertService.getAllAlerts());
  };

  const getSeverityIcon = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={20} className="text-red-600" />;
      case 'high':
        return <AlertTriangle size={20} className="text-orange-600" />;
      case 'medium':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeLabel = (type: EmergencyAlert['type']) => {
    switch (type) {
      case 'no_submissions':
        return 'No Submissions';
      case 'high_failure_rate':
        return 'High Failure Rate';
      case 'database_error':
        return 'Database Error';
      case 'plugin_failure':
        return 'Plugin Failure';
      case 'integration_failure':
        return 'Integration Failure';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell size={24} className={`mr-3 ${isMonitoring ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Alert System</h3>
              <p className="text-sm text-gray-600">
                {isMonitoring ? 'Active monitoring' : 'Monitoring stopped'} • 
                {activeAlerts.length} active alerts
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="Alert Settings"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={toggleMonitoring}
              className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                isMonitoring
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isMonitoring ? <BellOff size={16} className="mr-2" /> : <Bell size={16} className="mr-2" />}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">🚨 Active Critical Alerts</h4>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {getSeverityIcon(alert.severity)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-semibold">{alert.formTitle}</h5>
                        <span className="px-2 py-1 text-xs rounded bg-white bg-opacity-50">
                          {getTypeLabel(alert.type)}
                        </span>
                        <span className="text-xs opacity-75">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      
                      {/* Metadata */}
                      {Object.keys(alert.metadata).length > 0 && (
                        <div className="mt-2 text-xs space-y-1">
                          {Object.entries(alert.metadata).map(([key, value]) => (
                            <div key={key} className="opacity-75">
                              <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-2 p-1 text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50 rounded"
                    title="Mark as Resolved"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert History */}
      <div className="px-6 py-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Alert History</h4>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-600" />
            <p>No alerts yet. System monitoring is ready.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.resolved 
                    ? 'bg-gray-50 border-gray-200 opacity-60' 
                    : getSeverityColor(alert.severity)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {alert.resolved ? (
                      <CheckCircle size={16} className="text-green-600 mr-2" />
                    ) : (
                      getSeverityIcon(alert.severity)
                    )}
                    <div className="ml-2">
                      <span className="font-medium text-sm">{alert.formTitle}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {getTypeLabel(alert.type)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <p className="text-xs mt-1 text-gray-700">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Alert Thresholds</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-40 overflow-y-auto">
            {thresholds.map(threshold => (
              <div key={threshold.formId} className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{threshold.formTitle}</h5>
                  {threshold.criticalForms && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      Critical
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>No submissions: {threshold.noSubmissionMinutes}min</div>
                  <div>Max failure rate: {threshold.maxFailureRate}%</div>
                  <div>Min submissions/hour: {threshold.minSubmissionsPerHour}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <p>💡 Critical forms get faster alerts. Low-traffic forms have relaxed thresholds to prevent alert fatigue.</p>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Monitoring {thresholds.length} forms • 
            Last check: {new Date().toLocaleTimeString()}
          </span>
          <span className={`font-medium ${isMonitoring ? 'text-green-600' : 'text-gray-500'}`}>
            {isMonitoring ? '🟢 Active' : '🔴 Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertPanel;