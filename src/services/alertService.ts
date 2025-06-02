interface AlertConfig {
  slack?: {
    webhook: string;
    channel: string;
    mentions: string[];
  };
  email?: {
    apiKey: string;
    recipients: string[];
    fromEmail: string;
  };
  sms?: {
    apiKey: string;
    numbers: string[];
    provider: 'twilio' | 'textmagic';
  };
  teams?: {
    webhook: string;
  };
}

interface Alert {
  id: string;
  type: 'form_offline' | 'low_submissions' | 'high_error_rate' | 'recovery';
  severity: 'info' | 'warning' | 'critical';
  formId: string;
  formTitle: string;
  message: string;
  revenueImpact: number;
  timestamp: Date;
  resolved?: boolean;
}

class AlertService {
  private config: AlertConfig;
  private activeAlerts: Map<string, Alert> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async sendAlert(alert: Alert): Promise<void> {
    // Prevent duplicate alerts
    const alertKey = `${alert.formId}-${alert.type}`;
    if (this.activeAlerts.has(alertKey) && !alert.resolved) {
      return;
    }

    if (alert.resolved) {
      this.activeAlerts.delete(alertKey);
    } else {
      this.activeAlerts.set(alertKey, alert);
    }

    const promises: Promise<void>[] = [];

    // Send to all configured channels
    if (this.config.slack) {
      promises.push(this.sendSlackAlert(alert));
    }
    
    if (this.config.email && alert.severity === 'critical') {
      promises.push(this.sendEmailAlert(alert));
    }
    
    if (this.config.sms && alert.severity === 'critical') {
      promises.push(this.sendSMSAlert(alert));
    }
    
    if (this.config.teams) {
      promises.push(this.sendTeamsAlert(alert));
    }

    try {
      await Promise.allSettled(promises);
      console.log(`Alert sent successfully: ${alert.type} for form ${alert.formId}`);
    } catch (error) {
      console.error('Error sending alerts:', error);
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    if (!this.config.slack) return;

    const emoji = this.getAlertEmoji(alert.severity);
    const color = this.getAlertColor(alert.severity);
    const mentions = alert.severity === 'critical' ? this.config.slack.mentions.join(' ') : '';

    const payload = {
      channel: this.config.slack.channel,
      username: 'Form Monitor',
      icon_emoji: ':robot_face:',
      text: `${emoji} ${alert.resolved ? 'RESOLVED' : 'ALERT'}: ${alert.message} ${mentions}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Form',
              value: `${alert.formTitle} (ID: ${alert.formId})`,
              short: true
            },
            {
              title: 'Revenue Impact',
              value: `$${alert.revenueImpact.toLocaleString()}/hour`,
              short: true
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Time',
              value: alert.timestamp.toLocaleString(),
              short: true
            }
          ],
          footer: 'MyCC Form Monitor',
          ts: Math.floor(alert.timestamp.getTime() / 1000)
        }
      ]
    };

    const response = await fetch(this.config.slack.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack alert failed: ${response.statusText}`);
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    if (!this.config.email) return;

    const subject = `🚨 CRITICAL: Form Monitor Alert - $${alert.revenueImpact.toLocaleString()}/hr at risk`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            ${alert.resolved ? '✅ RESOLVED' : '🚨 FORM ALERT'}
          </h1>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #374151; margin-top: 0;">${alert.message}</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Form:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${alert.formTitle} (ID: ${alert.formId})</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Revenue Impact:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">$${alert.revenueImpact.toLocaleString()}/hour</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Severity:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${alert.severity.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Time:</td>
              <td style="padding: 10px;">${alert.timestamp.toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #7f1d1d;">Immediate Actions Required:</h3>
            <ul style="margin: 0; color: #991b1b;">
              <li>Check form accessibility on website</li>
              <li>Verify Gravity Forms plugin status</li>
              <li>Review server performance and errors</li>
              <li>Test form submission manually</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.DASHBOARD_URL}/forms-health" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    // Replace with your email service (SendGrid, Mailgun, etc.)
    const emailPayload = {
      to: this.config.email.recipients,
      from: this.config.email.fromEmail,
      subject,
      html: htmlBody
    };

    // Implement your email service call here
    console.log('Email alert would be sent:', emailPayload);
  }

  private async sendSMSAlert(alert: Alert): Promise<void> {
    if (!this.config.sms) return;

    const message = `🚨 CRITICAL FORM ALERT: ${alert.formTitle} is offline. $${alert.revenueImpact.toLocaleString()}/hr revenue at risk. Check dashboard immediately.`;

    if (this.config.sms.provider === 'twilio') {
      // Implement Twilio SMS
      console.log('Twilio SMS would be sent:', message);
    } else if (this.config.sms.provider === 'textmagic') {
      // Implement TextMagic SMS
      console.log('TextMagic SMS would be sent:', message);
    }
  }

  private async sendTeamsAlert(alert: Alert): Promise<void> {
    if (!this.config.teams) return;

    const payload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": `Form Alert: ${alert.formTitle}`,
      "themeColor": this.getAlertColor(alert.severity).replace('#', ''),
      "sections": [{
        "activityTitle": `${alert.resolved ? '✅ RESOLVED' : '🚨 FORM ALERT'}`,
        "activitySubtitle": alert.message,
        "facts": [
          {
            "name": "Form",
            "value": `${alert.formTitle} (ID: ${alert.formId})`
          },
          {
            "name": "Revenue Impact",
            "value": `$${alert.revenueImpact.toLocaleString()}/hour`
          },
          {
            "name": "Severity",
            "value": alert.severity.toUpperCase()
          }
        ],
        "markdown": true
      }],
      "potentialAction": [{
        "@type": "OpenUri",
        "name": "View Dashboard",
        "targets": [{
          "os": "default",
          "uri": `${process.env.DASHBOARD_URL}/forms-health`
        }]
      }]
    };

    const response = await fetch(this.config.teams.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Teams alert failed: ${response.statusText}`);
    }
  }

  private getAlertEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  }

  private getAlertColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#2563eb';
      default: return '#6b7280';
    }
  }

  // Public method to create and send alerts
  async createAlert(params: {
    type: Alert['type'];
    severity: Alert['severity'];
    formId: string;
    formTitle: string;
    message: string;
    revenueImpact: number;
    resolved?: boolean;
  }): Promise<void> {
    const alert: Alert = {
      id: `${params.formId}-${params.type}-${Date.now()}`,
      ...params,
      timestamp: new Date(),
      resolved: params.resolved || false
    };

    await this.sendAlert(alert);
  }
}

// Export configured instance
export const alertService = new AlertService({
  slack: {
    webhook: process.env.SLACK_WEBHOOK_URL || '',
    channel: '#form-monitoring',
    mentions: ['@channel', '@jason']
  },
  email: {
    apiKey: process.env.EMAIL_API_KEY || '',
    recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(','),
    fromEmail: process.env.FROM_EMAIL || 'alerts@mycomputercareer.edu'
  },
  sms: {
    apiKey: process.env.SMS_API_KEY || '',
    numbers: (process.env.ALERT_PHONE_NUMBERS || '').split(','),
    provider: 'twilio'
  },
  teams: {
    webhook: process.env.TEAMS_WEBHOOK_URL || ''
  }
});

export default AlertService;