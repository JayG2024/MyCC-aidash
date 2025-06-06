<?php
/**
 * Alert Manager Class
 * Handles alert configuration and notifications for form monitoring
 */

if (!defined('ABSPATH')) {
    exit;
}

class MYCC_Alert_Manager {
    
    private $active_alerts = array();
    
    public function __construct() {
        // Load active alerts on init
        add_action('init', array($this, 'load_active_alerts'));
    }
    
    /**
     * Trigger alert based on configuration
     */
    public function trigger_alert($form, $alert_config, $minutes_since_submission) {
        // Check if we've already sent an alert recently
        if ($this->should_throttle_alert($alert_config)) {
            return;
        }
        
        $alert_data = array(
            'form_id' => $form['id'],
            'form_title' => $form['title'],
            'alert_type' => $alert_config->alert_type,
            'threshold' => $alert_config->threshold_minutes,
            'time_since_submission' => round($minutes_since_submission),
            'severity' => $this->determine_severity($minutes_since_submission, $alert_config->threshold_minutes)
        );
        
        // Send notifications
        $this->send_email_notification($alert_data, $alert_config->email_recipients);
        
        if (!empty($alert_config->webhook_url)) {
            $this->send_webhook_notification($alert_data, $alert_config->webhook_url);
        }
        
        // Update last alert sent time
        $this->update_last_alert_time($alert_config->id);
        
        // Mark this as an active alert incident
        $active_alert_key = 'mycc_fm_active_alert_' . $alert_data['form_id'];
        set_transient($active_alert_key, array(
            'form_id' => $alert_data['form_id'],
            'alert_time' => current_time('mysql'),
            'alert_type' => $alert_data['alert_type']
        ), WEEK_IN_SECONDS); // Keep for a week max
        
        // Log alert
        $this->log_alert($alert_data);
    }
    
    /**
     * Trigger default alert when no specific configuration exists
     */
    public function trigger_default_alert($form, $minutes_since_submission) {
        // Check if there's already an active alert for this form
        $active_alert_key = 'mycc_fm_active_alert_' . $form['id'];
        $active_alert = get_transient($active_alert_key);
        
        if ($active_alert) {
            // Alert already sent for this downtime event
            return;
        }
        
        $default_emails = get_option('mycc_fm_notification_emails');
        
        $alert_data = array(
            'form_id' => $form['id'],
            'form_title' => $form['title'],
            'alert_type' => 'no_submissions',
            'threshold' => get_option('mycc_fm_default_threshold', 60),
            'time_since_submission' => round($minutes_since_submission),
            'severity' => 'warning'
        );
        
        $this->send_email_notification($alert_data, $default_emails);
        
        // Mark this as an active alert incident
        set_transient($active_alert_key, array(
            'form_id' => $alert_data['form_id'],
            'alert_time' => current_time('mysql'),
            'alert_type' => $alert_data['alert_type']
        ), WEEK_IN_SECONDS);
        
        $this->log_alert($alert_data);
    }
    
    /**
     * Trigger alert for forms with no submissions ever
     */
    public function trigger_no_submissions_alert($form) {
        // Only alert once per day for forms with no submissions
        $alert_key = 'no_submissions_' . $form['id'];
        $last_alert = get_transient($alert_key);
        
        if ($last_alert) {
            return;
        }
        
        $alert_data = array(
            'form_id' => $form['id'],
            'form_title' => $form['title'],
            'alert_type' => 'never_submitted',
            'severity' => 'info'
        );
        
        $this->send_email_notification($alert_data, get_option('mycc_fm_notification_emails'));
        set_transient($alert_key, true, DAY_IN_SECONDS);
    }
    
    /**
     * Send email notification
     */
    private function send_email_notification($alert_data, $recipients) {
        if (empty($recipients)) {
            return;
        }
        
        $to = is_array($recipients) ? $recipients : explode(',', $recipients);
        $subject = $this->generate_email_subject($alert_data);
        $message = $this->generate_email_body($alert_data);
        
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: MyCC Form Monitor <noreply@' . parse_url(home_url(), PHP_URL_HOST) . '>'
        );
        
        wp_mail($to, $subject, $message, $headers);
    }
    
    /**
     * Send webhook notification
     */
    private function send_webhook_notification($alert_data, $webhook_url) {
        $payload = array(
            'timestamp' => current_time('c'),
            'alert' => $alert_data,
            'site_url' => home_url(),
            'dashboard_url' => admin_url('admin.php?page=mycc-form-monitor')
        );
        
        // Support for Slack webhooks
        if (strpos($webhook_url, 'hooks.slack.com') !== false) {
            $payload = $this->format_slack_payload($alert_data);
        }
        
        wp_remote_post($webhook_url, array(
            'body' => json_encode($payload),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 10
        ));
    }
    
    /**
     * Format payload for Slack
     */
    private function format_slack_payload($alert_data) {
        $severity_emoji = array(
            'critical' => '🚨',
            'warning' => '⚠️',
            'info' => 'ℹ️'
        );
        
        $emoji = isset($severity_emoji[$alert_data['severity']]) ? 
                 $severity_emoji[$alert_data['severity']] : '📋';
        
        return array(
            'text' => sprintf(
                '%s Form Alert: %s',
                $emoji,
                $alert_data['form_title']
            ),
            'attachments' => array(
                array(
                    'color' => $this->get_severity_color($alert_data['severity']),
                    'fields' => array(
                        array(
                            'title' => 'Form',
                            'value' => $alert_data['form_title'] . ' (ID: ' . $alert_data['form_id'] . ')',
                            'short' => true
                        ),
                        array(
                            'title' => 'Time Since Last Submission',
                            'value' => $alert_data['time_since_submission'] . ' minutes',
                            'short' => true
                        ),
                        array(
                            'title' => 'Alert Type',
                            'value' => ucwords(str_replace('_', ' ', $alert_data['alert_type'])),
                            'short' => true
                        ),
                        array(
                            'title' => 'Severity',
                            'value' => ucfirst($alert_data['severity']),
                            'short' => true
                        )
                    ),
                    'footer' => 'MyCC Form Monitor',
                    'ts' => time()
                )
            )
        );
    }
    
    /**
     * Generate email subject
     */
    private function generate_email_subject($alert_data) {
        $severity_prefix = strtoupper($alert_data['severity']);
        return sprintf(
            '[%s] Form Monitor Alert: %s',
            $severity_prefix,
            $alert_data['form_title']
        );
    }
    
    /**
     * Generate email body
     */
    private function generate_email_body($alert_data) {
        ob_start();
        ?>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: <?php echo $this->get_severity_color($alert_data['severity']); ?>;">
                    Form Monitoring Alert
                </h2>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Form:</strong> <?php echo esc_html($alert_data['form_title']); ?> (ID: <?php echo esc_html($alert_data['form_id']); ?>)</p>
                    <p><strong>Alert Type:</strong> <?php echo esc_html(ucwords(str_replace('_', ' ', $alert_data['alert_type']))); ?></p>
                    <p><strong>Time Since Last Submission:</strong> <?php echo isset($alert_data['time_since_submission']) ? esc_html($alert_data['time_since_submission']) . ' minutes' : 'No submissions recorded'; ?></p>
                    <p><strong>Severity:</strong> <?php echo esc_html(ucfirst($alert_data['severity'])); ?></p>
                </div>
                
                <h3>Recommended Actions:</h3>
                <ul>
                    <li>Check if the form is displaying correctly on the website</li>
                    <li>Test form submission to ensure it's working</li>
                    <li>Review recent error logs for any issues</li>
                    <li>Check if any recent updates may have affected the form</li>
                </ul>
                
                <p style="margin-top: 30px;">
                    <a href="<?php echo admin_url('admin.php?page=mycc-form-monitor'); ?>" 
                       style="background-color: #0073aa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px;">
                        View Dashboard
                    </a>
                </p>
                
                <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">
                    This alert was sent by MyCC Form Monitor. 
                    <a href="<?php echo admin_url('admin.php?page=mycc-form-monitor-settings'); ?>">Manage alert settings</a>
                </p>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Determine severity based on time threshold
     */
    private function determine_severity($minutes_since, $threshold) {
        $ratio = $minutes_since / $threshold;
        
        if ($ratio > 3) {
            return 'critical';
        } elseif ($ratio > 1.5) {
            return 'warning';
        } else {
            return 'info';
        }
    }
    
    /**
     * Get color for severity level
     */
    private function get_severity_color($severity) {
        $colors = array(
            'critical' => '#dc3545',
            'warning' => '#ffc107',
            'info' => '#17a2b8'
        );
        
        return isset($colors[$severity]) ? $colors[$severity] : '#6c757d';
    }
    
    /**
     * Check if alert should be throttled
     */
    private function should_throttle_alert($alert_config) {
        // Check if there's an active unresolved alert for this form
        $active_alert_key = 'mycc_fm_active_alert_' . $alert_config->form_id;
        $active_alert = get_transient($active_alert_key);
        
        if ($active_alert) {
            // Alert already sent for this downtime event
            return true;
        }
        
        return false;
    }
    
    /**
     * Update last alert sent time
     */
    private function update_last_alert_time($alert_id) {
        global $wpdb;
        
        $wpdb->update(
            MYCC_FM_ALERTS_TABLE,
            array('last_alert_sent' => current_time('mysql')),
            array('id' => $alert_id)
        );
    }
    
    /**
     * Log alert for history
     */
    private function log_alert($alert_data) {
        // Store in options for quick access (limited to last 100)
        $alert_log = get_option('mycc_fm_alert_log', array());
        
        array_unshift($alert_log, array(
            'timestamp' => current_time('c'),
            'alert' => $alert_data
        ));
        
        $alert_log = array_slice($alert_log, 0, 100);
        update_option('mycc_fm_alert_log', $alert_log);
        
        // Also store active alert
        $this->active_alerts[$alert_data['form_id']] = $alert_data;
    }
    
    /**
     * Resolve alerts when form receives submission
     */
    public function resolve_alerts($form_id) {
        // Check if there's an active alert to resolve
        $active_alert_key = 'mycc_fm_active_alert_' . $form_id;
        $active_alert = get_transient($active_alert_key);
        
        if ($active_alert) {
            // Send resolution notification
            $this->send_resolution_notification($active_alert);
            
            // Clear the active alert
            delete_transient($active_alert_key);
        }
        
        // Also check legacy active alerts array
        if (isset($this->active_alerts[$form_id])) {
            $alert_data = $this->active_alerts[$form_id];
            $alert_data['resolved'] = true;
            $alert_data['resolved_time'] = current_time('c');
            
            // Send resolution notification
            $this->send_resolution_notification($alert_data);
            
            // Remove from active alerts
            unset($this->active_alerts[$form_id]);
        }
    }
    
    /**
     * Send resolution notification
     */
    private function send_resolution_notification($alert_data) {
        $recipients = get_option('mycc_fm_notification_emails');
        
        $form_title = isset($alert_data['form_title']) ? $alert_data['form_title'] : 'Form ID ' . $alert_data['form_id'];
        
        $subject = sprintf('[RESOLVED] Form Monitor Alert: %s', $form_title);
        $message = sprintf(
            '<p>✅ Good news! The form "%s" is now receiving submissions again.</p>
            <p>The alert has been automatically resolved at %s.</p>
            <p>Form is now operating normally.</p>',
            esc_html($form_title),
            current_time('F j, Y g:i a')
        );
        
        wp_mail($recipients, $subject, $message, array('Content-Type: text/html; charset=UTF-8'));
    }
    
    /**
     * Load active alerts on init
     */
    public function load_active_alerts() {
        $alert_log = get_option('mycc_fm_alert_log', array());
        
        foreach ($alert_log as $log_entry) {
            if (!isset($log_entry['alert']['resolved']) || !$log_entry['alert']['resolved']) {
                $this->active_alerts[$log_entry['alert']['form_id']] = $log_entry['alert'];
            }
        }
    }
}