import express from 'express';
import axios from 'axios';
const router = express.Router();

// In-memory storage for form health data (use Redis/DB in production)
let formHealthData = new Map();
let formHeartbeats = new Map();

// Configuration
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CRITICAL_THRESHOLD = 60 * 60 * 1000; // 1 hour without submissions
const WARNING_THRESHOLD = 30 * 60 * 1000; // 30 minutes

// WordPress API configuration
const WP_API_URL = process.env.WP_API_URL;
const WP_CONSUMER_KEY = process.env.WP_CONSUMER_KEY;
const WP_CONSUMER_SECRET = process.env.WP_CONSUMER_SECRET;

// Alert configuration
const ALERT_WEBHOOKS = {
  slack: process.env.SLACK_WEBHOOK_URL,
  email: process.env.EMAIL_ALERT_API_URL,
  sms: process.env.SMS_ALERT_API_URL
};

// Receive form submission heartbeats from WordPress
router.post('/form-health', async (req, res) => {
  try {
    const { form_id, form_title, timestamp, status, entry_count } = req.body;
    
    const healthRecord = {
      id: form_id,
      title: form_title,
      lastSubmission: new Date(timestamp),
      status: status || 'active',
      entryCount: entry_count || 0,
      lastHeartbeat: new Date()
    };
    
    formHealthData.set(form_id, healthRecord);
    
    // Check if this resolves any previous alerts
    checkAndResolveAlerts(form_id);
    
    res.json({ success: true, message: 'Health data recorded' });
  } catch (error) {
    console.error('Error recording form health:', error);
    res.status(500).json({ error: 'Failed to record health data' });
  }
});

// Receive heartbeats from JavaScript form monitor
router.post('/form-heartbeat', async (req, res) => {
  try {
    const { total_forms, forms_detected, timestamp, page_url } = req.body;
    
    const heartbeat = {
      totalForms: total_forms,
      formsDetected: forms_detected,
      timestamp: new Date(timestamp),
      pageUrl: page_url,
      receivedAt: new Date()
    };
    
    formHeartbeats.set(page_url, heartbeat);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording heartbeat:', error);
    res.status(500).json({ error: 'Failed to record heartbeat' });
  }
});

// Get comprehensive form health status
router.get('/forms-health', async (req, res) => {
  try {
    const currentTime = new Date();
    const formsHealth = [];
    
    // Get all forms from WordPress
    let wordpressForms = [];
    if (WP_API_URL && WP_CONSUMER_KEY && WP_CONSUMER_SECRET) {
      try {
        const credentials = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString('base64');
        const response = await axios({
          method: 'GET',
          url: `${WP_API_URL}/gf/v2/forms`,
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          },
          timeout: 5000
        });
        wordpressForms = response.data || [];
      } catch (error) {
        console.error('Error fetching WordPress forms:', error.message);
      }
    }
    
    // Combine WordPress forms with health data
    for (const wpForm of wordpressForms) {
      const formId = wpForm.id.toString();
      const healthData = formHealthData.get(formId);
      
      let status = 'unknown';
      let lastSubmission = 'Never';
      let timeSinceLastSubmission = null;
      
      if (healthData) {
        timeSinceLastSubmission = currentTime - healthData.lastSubmission;
        
        if (timeSinceLastSubmission > CRITICAL_THRESHOLD) {
          status = 'critical';
        } else if (timeSinceLastSubmission > WARNING_THRESHOLD) {
          status = 'warning';
        } else {
          status = 'healthy';
        }
        
        lastSubmission = formatTimeAgo(healthData.lastSubmission);
      }
      
      // Calculate estimated hourly submissions (mock data - replace with real analytics)
      const avgSubmissionsPerHour = calculateAvgSubmissions(formId);
      const submissionsToday = calculateTodaySubmissions(formId);
      
      formsHealth.push({
        id: formId,
        title: wpForm.title,
        status,
        lastSubmission,
        submissionsToday,
        avgSubmissionsPerHour,
        errorRate: calculateErrorRate(formId),
        responseTime: calculateResponseTime(formId),
        revenueImpact: avgSubmissionsPerHour * 75 // $75 per lead
      });
    }
    
    // Calculate summary metrics
    const summary = {
      totalForms: formsHealth.length,
      healthyForms: formsHealth.filter(f => f.status === 'healthy').length,
      warningForms: formsHealth.filter(f => f.status === 'warning').length,
      criticalForms: formsHealth.filter(f => f.status === 'critical').length,
      totalHourlyRevenue: formsHealth.reduce((sum, f) => sum + f.revenueImpact, 0),
      revenueAtRisk: formsHealth
        .filter(f => f.status === 'critical')
        .reduce((sum, f) => sum + f.revenueImpact, 0)
    };
    
    res.json({
      forms: formsHealth,
      summary,
      lastUpdate: currentTime.toISOString()
    });
    
  } catch (error) {
    console.error('Error getting forms health:', error);
    res.status(500).json({ error: 'Failed to get forms health' });
  }
});

// Alert management endpoint
router.post('/alerts/rules', async (req, res) => {
  try {
    const { formId, type, threshold, timeWindow, enabled } = req.body;
    
    // Store alert rule (use database in production)
    const alertRule = {
      id: Date.now().toString(),
      formId,
      type,
      threshold,
      timeWindow,
      enabled,
      createdAt: new Date()
    };
    
    // Store in database/cache
    res.json({ success: true, rule: alertRule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert rule' });
  }
});

// Trigger manual alert test
router.post('/alerts/test', async (req, res) => {
  try {
    const { alertType, formId } = req.body;
    
    await sendAlert({
      type: 'test',
      formId,
      message: `Test alert for form ${formId}`,
      severity: 'info'
    });
    
    res.json({ success: true, message: 'Test alert sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

// Helper functions
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function calculateAvgSubmissions(formId) {
  // Mock calculation - replace with real analytics
  const baseRate = Math.floor(Math.random() * 20) + 5;
  return baseRate;
}

function calculateTodaySubmissions(formId) {
  // Mock calculation - replace with real data
  return Math.floor(Math.random() * 50) + 1;
}

function calculateErrorRate(formId) {
  // Mock calculation - replace with real error tracking
  return Math.random() * 5; // 0-5% error rate
}

function calculateResponseTime(formId) {
  // Mock calculation - replace with real performance monitoring
  return Math.floor(Math.random() * 3000) + 500; // 500-3500ms
}

async function sendAlert(alert) {
  const message = `🚨 Form Alert: ${alert.message}`;
  
  // Send to Slack
  if (ALERT_WEBHOOKS.slack) {
    try {
      await axios.post(ALERT_WEBHOOKS.slack, {
        text: message,
        channel: '#form-monitoring',
        username: 'Form Monitor Bot'
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }
  
  // Send email alert
  if (ALERT_WEBHOOKS.email) {
    try {
      await axios.post(ALERT_WEBHOOKS.email, {
        to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        subject: `Form Monitor Alert - ${alert.severity.toUpperCase()}`,
        body: message
      });
    } catch (error) {
      console.error('Failed to send email alert:', error.message);
    }
  }
  
  console.log('Alert sent:', alert);
}

function checkAndResolveAlerts(formId) {
  // Logic to check if form recovery resolves any active alerts
  console.log(`Form ${formId} is healthy again`);
}

// Periodic health check
setInterval(async () => {
  try {
    const currentTime = new Date();
    
    for (const [formId, healthData] of formHealthData.entries()) {
      const timeSinceLastSubmission = currentTime - healthData.lastSubmission;
      
      if (timeSinceLastSubmission > CRITICAL_THRESHOLD) {
        await sendAlert({
          type: 'no_submissions',
          formId,
          message: `Form "${healthData.title}" has not received submissions for over 1 hour`,
          severity: 'critical'
        });
      } else if (timeSinceLastSubmission > WARNING_THRESHOLD) {
        await sendAlert({
          type: 'low_activity',
          formId,
          message: `Form "${healthData.title}" has low activity - no submissions for 30+ minutes`,
          severity: 'warning'
        });
      }
    }
  } catch (error) {
    console.error('Error in periodic health check:', error);
  }
}, HEALTH_CHECK_INTERVAL);

export default router;