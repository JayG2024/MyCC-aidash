import { emergencyAlertService } from '../services/emergencyAlerts';

// Auto-start emergency monitoring when the app loads
export const initializeMonitoring = () => {
  // Start monitoring automatically
  emergencyAlertService.startMonitoring();
  
  console.log('🚀 MyComputerCareer Form Monitoring System initialized');
  console.log('📊 Real-time monitoring active for critical revenue forms');
  console.log('🚨 Emergency alerts configured for immediate notification');
  
  // Log current configuration
  const thresholds = emergencyAlertService.getThresholds();
  const criticalForms = thresholds.filter(t => t.criticalForms);
  
  console.log(`⚡ Monitoring ${thresholds.length} forms (${criticalForms.length} critical)`);
  console.log('💰 Critical forms with fast alerts:', criticalForms.map(f => f.formTitle).join(', '));
};

// Cleanup when app unloads
export const cleanupMonitoring = () => {
  emergencyAlertService.stopMonitoring();
  console.log('🛑 Form monitoring stopped');
};

// For debugging - simulate alerts
export const triggerTestAlert = () => {
  console.log('🧪 Triggering test alert...');
  // This would be used for testing the alert system
};