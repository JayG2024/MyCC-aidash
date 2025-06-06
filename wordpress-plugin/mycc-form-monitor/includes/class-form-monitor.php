<?php
/**
 * Form Monitor Class
 * Handles tracking of form submissions and monitoring form health
 */

if (!defined('ABSPATH')) {
    exit;
}

class MYCC_Form_Monitor {
    
    public function __construct() {
        // Hook into Gravity Forms submission
        add_action('gform_after_submission', array($this, 'track_submission'), 10, 2);
        
        // Hook into cron job for health checks
        add_action('mycc_fm_check_form_health', array($this, 'check_form_health'));
        
        // Add AJAX endpoint for real-time updates
        add_action('wp_ajax_mycc_fm_get_form_status', array($this, 'ajax_get_form_status'));
        add_action('wp_ajax_nopriv_mycc_fm_get_form_status', array($this, 'ajax_get_form_status'));
    }
    
    /**
     * Track form submission
     */
    public function track_submission($entry, $form) {
        global $wpdb;
        
        $start_time = microtime(true);
        
        // Record submission in database
        $data = array(
            'form_id' => $form['id'],
            'form_title' => $form['title'],
            'entry_id' => $entry['id'],
            'submission_time' => current_time('mysql'),
            'user_ip' => $entry['ip'],
            'user_agent' => $entry['user_agent'],
            'status' => $entry['status'],
            'processing_time' => microtime(true) - $start_time
        );
        
        $wpdb->insert(MYCC_FM_TABLE_NAME, $data);
        
        // Send real-time update to dashboard API if configured
        $this->send_dashboard_update($form['id'], $form['title'], 'submission');
        
        // Check if this resolves any alerts
        $this->check_and_resolve_alerts($form['id']);
        
        // Log for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('MYCC Form Monitor: Tracked submission for form ' . $form['id']);
        }
    }
    
    /**
     * Check form health (runs via WP Cron)
     */
    public function check_form_health() {
        global $wpdb;
        
        // Get all active Gravity Forms
        if (!class_exists('GFAPI')) {
            return;
        }
        
        $forms = GFAPI::get_forms();
        $current_time = current_time('mysql');
        $alert_manager = new MYCC_Alert_Manager();
        
        foreach ($forms as $form) {
            if ($form['is_active'] != '1') {
                continue;
            }
            
            // Get last submission time for this form
            $last_submission = $wpdb->get_var($wpdb->prepare(
                "SELECT submission_time FROM " . MYCC_FM_TABLE_NAME . " 
                WHERE form_id = %d 
                ORDER BY submission_time DESC 
                LIMIT 1",
                $form['id']
            ));
            
            if ($last_submission) {
                $time_diff = strtotime($current_time) - strtotime($last_submission);
                $minutes_since_submission = $time_diff / 60;
                
                // Check against configured thresholds
                $alerts = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM " . MYCC_FM_ALERTS_TABLE . " 
                    WHERE form_id = %d AND enabled = 1",
                    $form['id']
                ));
                
                foreach ($alerts as $alert_config) {
                    if ($minutes_since_submission > $alert_config->threshold_minutes) {
                        $alert_manager->trigger_alert($form, $alert_config, $minutes_since_submission);
                    }
                }
                
                // Check default threshold if no specific alerts configured
                if (empty($alerts)) {
                    $default_threshold = get_option('mycc_fm_default_threshold', 60);
                    if ($minutes_since_submission > $default_threshold) {
                        $alert_manager->trigger_default_alert($form, $minutes_since_submission);
                    }
                }
            } else {
                // No submissions ever recorded for this form
                // Don't alert for forms that have never had submissions
                // Only alert if form previously had submissions and stopped
                continue;
            }
            
            // Update dashboard with current status
            $this->send_health_status_update($form, $last_submission);
        }
    }
    
    /**
     * Send update to dashboard API
     */
    private function send_dashboard_update($form_id, $form_title, $event_type) {
        $api_url = get_option('mycc_fm_dashboard_api_url');
        
        if (!empty($api_url)) {
            $data = array(
                'form_id' => $form_id,
                'form_title' => $form_title,
                'timestamp' => current_time('mysql'),
                'event_type' => $event_type,
                'status' => 'active'
            );
            
            wp_remote_post($api_url . '/api/form-health', array(
                'body' => json_encode($data),
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-API-Key' => get_option('mycc_fm_api_key', '')
                ),
                'timeout' => 5
            ));
        }
    }
    
    /**
     * Send health status update
     */
    private function send_health_status_update($form, $last_submission) {
        global $wpdb;
        
        // Calculate statistics
        $stats = $this->calculate_form_statistics($form['id']);
        
        $api_url = get_option('mycc_fm_dashboard_api_url');
        if (!empty($api_url)) {
            $data = array(
                'form_id' => $form['id'],
                'form_title' => $form['title'],
                'last_submission' => $last_submission,
                'submissions_today' => $stats['submissions_today'],
                'avg_per_hour' => $stats['avg_per_hour'],
                'status' => $this->determine_health_status($last_submission)
            );
            
            wp_remote_post($api_url . '/api/forms-health', array(
                'body' => json_encode($data),
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-API-Key' => get_option('mycc_fm_api_key', '')
                ),
                'timeout' => 5
            ));
        }
    }
    
    /**
     * Calculate form statistics
     */
    public function calculate_form_statistics($form_id) {
        global $wpdb;
        
        // Submissions today
        $today_start = date('Y-m-d 00:00:00');
        $submissions_today = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM " . MYCC_FM_TABLE_NAME . " 
            WHERE form_id = %d AND submission_time >= %s",
            $form_id, $today_start
        ));
        
        // Average per hour (last 24 hours)
        $yesterday = date('Y-m-d H:i:s', strtotime('-24 hours'));
        $last_24h_count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM " . MYCC_FM_TABLE_NAME . " 
            WHERE form_id = %d AND submission_time >= %s",
            $form_id, $yesterday
        ));
        
        return array(
            'submissions_today' => $submissions_today,
            'avg_per_hour' => round($last_24h_count / 24, 2),
            'total_submissions' => $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM " . MYCC_FM_TABLE_NAME . " WHERE form_id = %d",
                $form_id
            ))
        );
    }
    
    /**
     * Determine health status based on last submission time
     */
    public function determine_health_status($last_submission) {
        if (!$last_submission) {
            // Forms with no recorded submissions are considered healthy by default
            return 'healthy';
        }
        
        $time_diff = time() - strtotime($last_submission);
        $hours_since = $time_diff / 3600;
        
        if ($hours_since > 24) {
            return 'critical';
        } elseif ($hours_since > 6) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }
    
    /**
     * Check and resolve alerts when form receives submission
     */
    private function check_and_resolve_alerts($form_id) {
        $alert_manager = new MYCC_Alert_Manager();
        $alert_manager->resolve_alerts($form_id);
    }
    
    /**
     * AJAX handler for real-time status updates
     */
    public function ajax_get_form_status() {
        check_ajax_referer('mycc_fm_nonce', 'nonce');
        
        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        
        if ($form_id) {
            $stats = $this->calculate_form_statistics($form_id);
            $last_submission = $this->get_last_submission_time($form_id);
            
            wp_send_json_success(array(
                'stats' => $stats,
                'last_submission' => $last_submission,
                'status' => $this->determine_health_status($last_submission)
            ));
        } else {
            wp_send_json_error('Invalid form ID');
        }
    }
    
    /**
     * Get last submission time for a form
     */
    public function get_last_submission_time($form_id) {
        global $wpdb;
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT submission_time FROM " . MYCC_FM_TABLE_NAME . " 
            WHERE form_id = %d 
            ORDER BY submission_time DESC 
            LIMIT 1",
            $form_id
        ));
    }
}