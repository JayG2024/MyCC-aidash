# MyCC Form Monitor Plugin

A comprehensive WordPress plugin for real-time monitoring and alerting of Gravity Forms submissions.

## Features

- **Real-time Submission Tracking** - Captures every form submission using `gform_after_submission` hook
- **Automated Health Monitoring** - WP Cron job checks form health every 5 minutes
- **Smart Alerting System** - Email and webhook notifications when forms stop receiving submissions
- **Admin Dashboard** - Visual interface showing form health status at a glance
- **REST API Integration** - Connects with external dashboards (MyCC AI Dashboard)
- **Customizable Alert Rules** - Set different thresholds for different forms
- **Alert History** - Track all triggered alerts and resolutions

## Installation

1. Upload the `mycc-form-monitor` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to 'Form Monitor' in the WordPress admin menu
4. Configure your alert settings and notification preferences

## Configuration

### Basic Settings
- **Default Alert Threshold**: Time in minutes before alerting (default: 60)
- **Notification Emails**: Comma-separated list of email addresses
- **Dashboard API URL**: External dashboard endpoint for real-time updates
- **API Key**: Secure key for API authentication

### Alert Rules
Create custom alert rules for specific forms:
1. Go to Form Monitor > Alert Rules
2. Select a form
3. Choose alert type (No Submissions, Low Volume)
4. Set threshold in minutes
5. Configure email recipients and/or webhook URL

### Webhook Support
The plugin supports webhooks for:
- Slack (automatic formatting)
- Discord
- Custom endpoints

## API Endpoints

The plugin provides REST API endpoints for external integration:

- `GET /wp-json/mycc-form-monitor/v1/forms-health` - All forms status
- `GET /wp-json/mycc-form-monitor/v1/form/{id}/stats` - Specific form statistics
- `GET /wp-json/mycc-form-monitor/v1/submissions` - Recent submissions
- `GET /wp-json/mycc-form-monitor/v1/alerts` - Alert configurations
- `POST /wp-json/mycc-form-monitor/v1/alerts` - Create/update alerts

## Dashboard Integration

To integrate with MyCC AI Dashboard:

1. Set the Dashboard API URL in settings
2. Configure API key for authentication
3. The plugin will automatically send real-time updates

## Database Tables

The plugin creates two custom tables:
- `{prefix}_mycc_form_submissions` - Tracks all form submissions
- `{prefix}_mycc_form_alerts` - Stores alert configurations

## Hooks and Filters

### Actions
- `mycc_fm_form_submitted` - Fired after form submission is tracked
- `mycc_fm_alert_triggered` - Fired when an alert is triggered
- `mycc_fm_alert_resolved` - Fired when an alert is resolved

### Filters
- `mycc_fm_alert_throttle_period` - Modify alert throttle period (default: 3600 seconds)
- `mycc_fm_health_check_interval` - Modify health check interval (default: 300 seconds)

## Troubleshooting

### Forms Not Being Tracked
- Ensure Gravity Forms is installed and activated
- Check that forms are set to 'Active' status
- Verify WordPress cron is running (`wp cron event list`)

### Alerts Not Sending
- Check email configuration in WordPress
- Verify SMTP settings if using external mail service
- Check webhook URLs are accessible
- Review alert logs in Form Monitor > Alert Logs

### API Connection Issues
- Verify API key matches between plugin and dashboard
- Check CORS settings allow dashboard domain
- Ensure REST API is enabled on WordPress site

## Requirements

- WordPress 5.0 or higher
- Gravity Forms 2.4 or higher
- PHP 7.2 or higher
- MySQL 5.6 or higher

## Support

For issues or questions, contact the MyComputerCareer development team or create an issue in the project repository.