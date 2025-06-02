interface EmergencyAlert {
  id: string;
  formId: string;
  formTitle: string;
  severity: 'critical' | 'high' | 'medium';
  type: 'no_submissions' | 'high_failure_rate' | 'database_error' | 'plugin_failure' | 'integration_failure';
  message: string;
  timestamp: string;
  resolved: boolean;
  channels: ('email' | 'slack' | 'sms' | 'dashboard')[];
  metadata: {
    lastSubmission?: string;
    failureRate?: number;
    expectedSubmissions?: number;
    actualSubmissions?: number;
    errorDetails?: string;
  };
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'sms';
  enabled: boolean;
  config: {
    recipients?: string[];
    webhook?: string;
    phoneNumbers?: string[];
  };
}

interface EmergencyThresholds {
  formId: string;
  formTitle: string;
  noSubmissionMinutes: number; // Alert if no submissions for X minutes
  maxFailureRate: number; // Alert if failure rate exceeds X%
  minSubmissionsPerHour: number; // Alert if submissions below X per hour
  criticalForms: boolean; // Mark as critical revenue-generating form
}

class EmergencyAlertService {
  private alerts: EmergencyAlert[] = [];
  private thresholds: EmergencyThresholds[] = [];
  private channels: NotificationChannel[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultThresholds();
    this.initializeNotificationChannels();
  }

  private initializeDefaultThresholds() {
    // Based on Matthew's high-revenue forms from the call
    const criticalForms = [
      { id: '68', title: 'Cyber Warrior Program Form', expectedHourly: 15 },
      { id: '62', title: 'Free Career Evaluation Form', expectedHourly: 8 },
      { id: '60', title: 'Request Information Form', expectedHourly: 12 },
      { id: '53', title: 'Skillbridge Form', expectedHourly: 5 },
      { id: '44', title: 'Evaluation Questions', expectedHourly: 10 }
    ];

    this.thresholds = criticalForms.map(form => ({
      formId: form.id,
      formTitle: form.title,
      noSubmissionMinutes: form.expectedHourly > 10 ? 30 : 60, // High-traffic forms get faster alerts
      maxFailureRate: 15, // Alert if >15% failure rate
      minSubmissionsPerHour: Math.max(1, form.expectedHourly * 0.3), // Alert if <30% of expected
      criticalForms: true
    }));

    // Add other forms with more relaxed thresholds
    const otherForms = [
      { id: '42', title: 'AFF Email Form' },
      { id: '74', title: 'AI Form' },
      { id: '67', title: 'Blog News Form' }
    ];

    otherForms.forEach(form => {
      this.thresholds.push({
        formId: form.id,
        formTitle: form.title,
        noSubmissionMinutes: 24 * 60, // 24 hours for low-traffic forms
        maxFailureRate: 25,
        minSubmissionsPerHour: 0.1,
        criticalForms: false
      });
    });
  }

  private initializeNotificationChannels() {
    this.channels = [
      {
        type: 'email',
        enabled: true,
        config: {
          recipients: [
            'matthew@mycomputercareer.edu',
            'jason@jaydus.ai',
            'tech-alerts@mycomputercareer.edu'
          ]
        }
      },
      {
        type: 'slack',
        enabled: true,
        config: {
          webhook: process.env.REACT_APP_SLACK_WEBHOOK || ''
        }
      },
      {
        type: 'sms',
        enabled: false, // Enable when configured
        config: {
          phoneNumbers: ['+1-555-0123'] // Matthew's emergency number
        }
      }
    ];
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚨 Emergency Alert System: Monitoring started');
    
    // Check every 5 minutes for critical issues
    this.monitoringInterval = setInterval(() => {
      this.checkAllForms();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAllForms();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Emergency Alert System: Monitoring stopped');
  }

  private async checkAllForms() {
    console.log('🔍 Checking all forms for emergency conditions...');
    
    for (const threshold of this.thresholds) {
      await this.checkFormHealth(threshold);
    }
  }

  private async checkFormHealth(threshold: EmergencyThresholds) {
    try {
      // In a real implementation, this would fetch actual form data
      // For now, simulating critical scenarios based on the call transcript
      
      const mockFormData = this.generateMockFormData(threshold);
      
      // Check for no submissions
      if (mockFormData.minutesSinceLastSubmission > threshold.noSubmissionMinutes) {
        this.createAlert({
          formId: threshold.formId,
          formTitle: threshold.formTitle,
          severity: threshold.criticalForms ? 'critical' : 'high',
          type: 'no_submissions',
          message: `⚠️ CRITICAL: ${threshold.formTitle} has not received submissions for ${mockFormData.minutesSinceLastSubmission} minutes`,
          metadata: {
            lastSubmission: mockFormData.lastSubmission,
            expectedSubmissions: threshold.minSubmissionsPerHour
          }
        });
      }

      // Check failure rate
      if (mockFormData.failureRate > threshold.maxFailureRate) {
        this.createAlert({
          formId: threshold.formId,
          formTitle: threshold.formTitle,
          severity: mockFormData.failureRate > 50 ? 'critical' : 'high',
          type: 'high_failure_rate',
          message: `🚨 HIGH FAILURE RATE: ${threshold.formTitle} failing ${mockFormData.failureRate}% of submissions`,
          metadata: {
            failureRate: mockFormData.failureRate,
            actualSubmissions: mockFormData.submissionsLastHour,
            errorDetails: mockFormData.lastError
          }
        });
      }

      // Check low submission volume
      if (mockFormData.submissionsLastHour < threshold.minSubmissionsPerHour && threshold.criticalForms) {
        this.createAlert({
          formId: threshold.formId,
          formTitle: threshold.formTitle,
          severity: 'medium',
          type: 'no_submissions',
          message: `📉 LOW VOLUME: ${threshold.formTitle} only ${mockFormData.submissionsLastHour} submissions (expected ${threshold.minSubmissionsPerHour}/hour)`,
          metadata: {
            actualSubmissions: mockFormData.submissionsLastHour,
            expectedSubmissions: threshold.minSubmissionsPerHour
          }
        });
      }

    } catch (error) {
      console.error(`Error checking form ${threshold.formId}:`, error);
      this.createAlert({
        formId: threshold.formId,
        formTitle: threshold.formTitle,
        severity: 'critical',
        type: 'database_error',
        message: `💥 SYSTEM ERROR: Cannot monitor ${threshold.formTitle} - database/API failure`,
        metadata: {
          errorDetails: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  private generateMockFormData(threshold: EmergencyThresholds) {
    // Simulate different scenarios based on form patterns from the call
    const scenarios = {
      '42': { // AFF Email Form - mentioned as having no submissions for days
        minutesSinceLastSubmission: 72 * 60, // 3 days
        failureRate: 0,
        submissionsLastHour: 0,
        lastSubmission: '3 days ago',
        lastError: null
      },
      '68': { // Cyber Warrior - high volume, occasional issues
        minutesSinceLastSubmission: Math.random() * 60,
        failureRate: Math.random() * 20,
        submissionsLastHour: 10 + Math.random() * 10,
        lastSubmission: `${Math.floor(Math.random() * 60)} minutes ago`,
        lastError: Math.random() > 0.8 ? 'HubSpot integration timeout' : null
      },
      default: {
        minutesSinceLastSubmission: Math.random() * 180,
        failureRate: Math.random() * 30,
        submissionsLastHour: Math.random() * 5,
        lastSubmission: `${Math.floor(Math.random() * 180)} minutes ago`,
        lastError: Math.random() > 0.9 ? 'Database connection error' : null
      }
    };

    return scenarios[threshold.formId as keyof typeof scenarios] || scenarios.default;
  }

  private createAlert(alertData: Omit<EmergencyAlert, 'id' | 'timestamp' | 'resolved' | 'channels'>) {
    // Check if similar alert already exists and is unresolved
    const existingAlert = this.alerts.find(a => 
      a.formId === alertData.formId && 
      a.type === alertData.type && 
      !a.resolved &&
      Date.now() - new Date(a.timestamp).getTime() < 60 * 60 * 1000 // Within last hour
    );

    if (existingAlert) {
      console.log(`Skipping duplicate alert for ${alertData.formTitle}`);
      return;
    }

    const alert: EmergencyAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      channels: this.getChannelsForSeverity(alertData.severity)
    };

    this.alerts.push(alert);
    console.log(`🚨 NEW ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Send notifications
    this.sendNotifications(alert);
  }

  private getChannelsForSeverity(severity: EmergencyAlert['severity']): EmergencyAlert['channels'] {
    switch (severity) {
      case 'critical':
        return ['email', 'slack', 'sms', 'dashboard'];
      case 'high':
        return ['email', 'slack', 'dashboard'];
      case 'medium':
        return ['dashboard', 'email'];
      default:
        return ['dashboard'];
    }
  }

  private async sendNotifications(alert: EmergencyAlert) {
    for (const channelType of alert.channels) {
      const channel = this.channels.find(c => c.type === channelType);
      if (!channel || !channel.enabled) continue;

      try {
        switch (channelType) {
          case 'email':
            await this.sendEmailAlert(alert, channel);
            break;
          case 'slack':
            await this.sendSlackAlert(alert, channel);
            break;
          case 'sms':
            await this.sendSMSAlert(alert, channel);
            break;
          case 'dashboard':
            this.showDashboardAlert(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channelType} notification:`, error);
      }
    }
  }

  private async sendEmailAlert(alert: EmergencyAlert, channel: NotificationChannel) {
    // In production, integrate with actual email service
    console.log(`📧 EMAIL ALERT to ${channel.config.recipients?.join(', ')}: ${alert.message}`);
    
    const emailBody = this.formatEmailAlert(alert);
    
    // TODO: Integrate with SendGrid, AWS SES, or other email service
    // For now, just log the alert
    console.log('Email Body:', emailBody);
  }

  private async sendSlackAlert(alert: EmergencyAlert, channel: NotificationChannel) {
    if (!channel.config.webhook) return;

    const slackMessage = {
      text: `🚨 Form Monitoring Alert`,
      attachments: [{
        color: this.getSlackColor(alert.severity),
        fields: [
          { title: 'Form', value: alert.formTitle, short: true },
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Issue', value: alert.message, short: false },
          { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true }
        ],
        footer: 'MyCC Form Monitoring',
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
      }]
    };

    console.log(`💬 SLACK ALERT: ${alert.message}`);
    
    // TODO: Implement actual Slack webhook call
    // await fetch(channel.config.webhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(slackMessage)
    // });
  }

  private async sendSMSAlert(alert: EmergencyAlert, channel: NotificationChannel) {
    console.log(`📱 SMS ALERT to ${channel.config.phoneNumbers?.join(', ')}: ${alert.message}`);
    
    // TODO: Integrate with Twilio or other SMS service
  }

  private showDashboardAlert(alert: EmergencyAlert) {
    // This would trigger a real-time update in the dashboard
    console.log(`🖥️ DASHBOARD ALERT: ${alert.message}`);
    
    // In a real implementation, this would use WebSocket or Server-Sent Events
    // to push alerts to connected dashboard clients
  }

  private formatEmailAlert(alert: EmergencyAlert): string {
    return `
MYCOMPUTERCAREER FORM MONITORING ALERT

Alert Level: ${alert.severity.toUpperCase()}
Form: ${alert.formTitle} (ID: ${alert.formId})
Issue: ${alert.message}
Time: ${new Date(alert.timestamp).toLocaleString()}

Details:
${Object.entries(alert.metadata).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Dashboard: https://mycc-ai-dashboard.web.app

This is an automated alert from the MyComputerCareer Form Monitoring System.
    `.trim();
  }

  private getSlackColor(severity: EmergencyAlert['severity']): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      default: return '#808080';
    }
  }

  // Public methods for dashboard integration
  getActiveAlerts(): EmergencyAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  getAllAlerts(): EmergencyAlert[] {
    return [...this.alerts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  updateThreshold(formId: string, updates: Partial<EmergencyThresholds>): boolean {
    const threshold = this.thresholds.find(t => t.formId === formId);
    if (threshold) {
      Object.assign(threshold, updates);
      console.log(`Updated thresholds for ${threshold.formTitle}`);
      return true;
    }
    return false;
  }

  getThresholds(): EmergencyThresholds[] {
    return [...this.thresholds];
  }

  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}

// Singleton instance
export const emergencyAlertService = new EmergencyAlertService();
export type { EmergencyAlert, EmergencyThresholds, NotificationChannel };