# MyCC Form Monitor - Complete Documentation

## Overview

MyCC Form Monitor is a WordPress plugin that provides real-time monitoring and alerting for Gravity Forms submissions. It tracks form health, detects submission issues, and sends automatic alerts when forms stop receiving entries.

## Key Features

- **Real-time Submission Tracking** - Captures every form submission instantly
- **Automated Health Monitoring** - Checks form status every 5 minutes
- **Smart Alert System** - Email and webhook notifications
- **Visual Dashboard** - At-a-glance form health status
- **REST API** - Integration with external dashboards
- **Historical Data** - Complete submission history and trends

## Installation Guide

### Requirements
- WordPress 5.0 or higher
- Gravity Forms 2.4 or higher
- PHP 7.2 or higher
- MySQL 5.6 or higher

### Installation Steps

1. **Upload Plugin**
   - Download the `mycc-form-monitor.zip` file
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Select the zip file and click "Install Now"

2. **Activate Plugin**
   - Click "Activate" after installation
   - A new "Form Monitor" menu will appear in WordPress admin

3. **Initial Setup**
   - Navigate to Form Monitor → Settings
   - Configure default alert threshold (recommended: 60 minutes)
   - Add notification email addresses
   - Save settings

## Configuration Guide

### General Settings

Navigate to **Form Monitor → Settings** to configure:

| Setting | Description | Default |
|---------|-------------|---------|
| Default Alert Threshold | Minutes without submissions before alerting | 60 |
| Notification Emails | Comma-separated email addresses for alerts | Admin email |
| Dashboard API URL | External dashboard endpoint (optional) | Empty |
| API Key | Secure key for API authentication | Auto-generated |

### Alert Rules

Create custom alert rules at **Form Monitor → Alert Rules**:

1. **Select Form** - Choose which form to monitor
2. **Alert Type** - "No Submissions" or "Low Volume"
3. **Threshold** - Minutes before triggering alert (minimum: 5)
4. **Email Recipients** - Override default recipients
5. **Webhook URL** - Optional webhook for Slack/Discord/custom

### Recommended Thresholds

| Form Type | Recommended Threshold |
|-----------|----------------------|
| High-traffic forms (Request Info) | 30-60 minutes |
| Medium-traffic forms | 60-120 minutes |
| Low-traffic forms | 120-240 minutes |
| Internal/test forms | 480+ minutes |

## Usage Guide

### Dashboard Overview

The main dashboard (**Form Monitor → Dashboard**) displays:

- **Summary Cards**
  - Total Forms: All active Gravity Forms
  - Healthy Forms: Receiving regular submissions
  - Warning Forms: Approaching threshold
  - Critical Forms: No recent submissions

- **Form Health Table**
  - Form name and ID
  - Current status (Healthy/Warning/Critical/Offline)
  - Last submission time
  - Today's submission count
  - Average submissions per hour
  - Total submissions all-time

### Understanding Form Status

| Status | Indicator | Meaning |
|--------|-----------|---------|
| 🟢 **Healthy** | Green | Submissions received recently |
| 🟡 **Warning** | Yellow | Approaching alert threshold |
| 🔴 **Critical** | Red | No submissions beyond threshold |
| ⚫ **Offline** | Gray | No submissions ever recorded |

### Alert System

When a form stops receiving submissions:

1. **Detection** - System checks every 5 minutes
2. **Threshold Check** - Compares time since last submission
3. **Alert Trigger** - Sends notifications if threshold exceeded
4. **Multiple Channels** - Email + optional webhooks
5. **Auto-Resolution** - Sends "resolved" notice when submissions resume

### Email Alert Format

Alerts include:
- Form name and ID
- Time since last submission
- Severity level
- Direct link to WordPress dashboard
- Recommended troubleshooting steps

## Testing Guide

### Initial Testing

1. **Submit Test Entry**
   ```
   - Visit your form on the frontend
   - Submit a test entry
   - Return to Form Monitor dashboard
   - Verify "Last Submission" updates
   ```

2. **Test Alerts**
   ```
   - Create an alert rule
   - Click "Test Alert" button
   - Check email for test notification
   ```

3. **Verify Monitoring**
   ```
   - Check that forms show "Healthy" status
   - Confirm submission counts increase
   - Watch for status changes over time
   ```

### Troubleshooting Tests

**Form Shows "Offline"**
- Submit a test entry to initialize tracking
- Check if form is active in Gravity Forms

**Not Receiving Alerts**
- Verify email settings in WordPress
- Check spam folder
- Test with "Test Alert" button
- Confirm WordPress cron is running

**Incorrect Status**
- Check alert threshold settings
- Verify system time is correct
- Look at "Last Submission" time

## API Documentation

### REST Endpoints

Base URL: `https://yoursite.com/wp-json/mycc-form-monitor/v1`

#### Get All Forms Health
```
GET /forms-health
Headers: X-API-Key: your-api-key

Response:
{
  "forms": [...],
  "summary": {
    "totalForms": 12,
    "healthyForms": 10,
    "warningForms": 1,
    "criticalForms": 1
  },
  "lastUpdate": "2024-01-20T10:30:00Z"
}
```

#### Get Form Statistics
```
GET /form/{id}/stats
Headers: X-API-Key: your-api-key

Response:
{
  "form": {...},
  "stats": {...},
  "trends": [...],
  "performance": {...}
}
```

#### Get Recent Submissions
```
GET /submissions?limit=50&form_id=123
Headers: X-API-Key: your-api-key
```

### Webhook Integration

#### Slack Webhook Format
```json
{
  "text": "🚨 Form Alert: Contact Form",
  "attachments": [{
    "color": "danger",
    "fields": [
      {"title": "Form", "value": "Contact Form (ID: 5)"},
      {"title": "Time Since Last Submission", "value": "125 minutes"},
      {"title": "Severity", "value": "Critical"}
    ]
  }]
}
```

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review alert logs
   - Check for false positives
   - Adjust thresholds if needed

2. **Monthly**
   - Clear old alert logs
   - Review form performance trends
   - Update alert rules for new forms

3. **Quarterly**
   - Audit email recipients
   - Test webhook integrations
   - Review and optimize thresholds

### Database Management

The plugin creates two tables:
- `wp_mycc_form_submissions` - Stores all submissions
- `wp_mycc_form_alerts` - Stores alert configurations

Data retention:
- Submissions: Kept indefinitely
- Alert logs: Last 100 entries in options table

## Common Issues & Solutions

### Issue: All forms show as "Critical" or "Offline"
**Solution:** Submit test entries to initialize tracking. The plugin only tracks submissions that occur after activation.

### Issue: Too many alerts
**Solution:** Increase threshold times in Alert Rules. Consider time zones and business hours.

### Issue: Not receiving email alerts
**Solution:** 
1. Check WordPress email configuration
2. Verify SMTP settings if using external mail
3. Check spam folders
4. Test with "Test Alert" button

### Issue: WordPress cron not running
**Solution:** 
1. Install WP Crontrol plugin to verify
2. Add to wp-config.php: `define('DISABLE_WP_CRON', false);`
3. Set up real cron job if needed

## Support Information

For technical support:
1. Check this documentation first
2. Review alert logs for error messages
3. Enable WordPress debug mode for detailed errors
4. Contact development team with:
   - WordPress version
   - Gravity Forms version
   - Error messages
   - Steps to reproduce issue

## Security Considerations

- API keys are stored encrypted
- All inputs are sanitized
- Database queries use prepared statements
- CORS headers restrict API access
- Webhook URLs are validated

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Developer:** AppSuite - Custom Plugin for MyCC