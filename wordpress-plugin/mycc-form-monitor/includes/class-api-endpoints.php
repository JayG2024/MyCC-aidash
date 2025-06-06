<?php
/**
 * API Endpoints Class
 * Provides REST API endpoints for external dashboard integration
 */

if (!defined('ABSPATH')) {
    exit;
}

class MYCC_API_Endpoints {
    
    public function __construct() {
        // Register REST API endpoints
        add_action('rest_api_init', array($this, 'register_endpoints'));
        
        // Add CORS headers for dashboard access
        add_action('rest_api_init', array($this, 'add_cors_headers'), 15);
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_endpoints() {
        // Get all forms health status
        register_rest_route('mycc-form-monitor/v1', '/forms-health', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_forms_health'),
            'permission_callback' => array($this, 'check_api_key')
        ));
        
        // Get specific form statistics
        register_rest_route('mycc-form-monitor/v1', '/form/(?P<id>\d+)/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_form_stats'),
            'permission_callback' => array($this, 'check_api_key'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));
        
        // Get recent submissions
        register_rest_route('mycc-form-monitor/v1', '/submissions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_recent_submissions'),
            'permission_callback' => array($this, 'check_api_key')
        ));
        
        // Get alert configurations
        register_rest_route('mycc-form-monitor/v1', '/alerts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_alerts'),
            'permission_callback' => array($this, 'check_api_key')
        ));
        
        // Create/update alert
        register_rest_route('mycc-form-monitor/v1', '/alerts', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_alert'),
            'permission_callback' => array($this, 'check_api_key')
        ));
        
        // Test webhook endpoint for dashboard
        register_rest_route('mycc-form-monitor/v1', '/webhook/test', array(
            'methods' => 'POST',
            'callback' => array($this, 'test_webhook'),
            'permission_callback' => '__return_true'
        ));
    }
    
    /**
     * Add CORS headers for API access
     */
    public function add_cors_headers() {
        // Get allowed origins from settings
        $allowed_origins = array(
            'https://mycc-ai-dashboard.web.app',
            'https://mycc-ai-dashboard.firebaseapp.com',
            'http://localhost:3000', // For development
            'http://localhost:5173'  // Vite dev server
        );
        
        $origin = get_http_origin();
        
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: " . $origin);
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
            header("Access-Control-Allow-Credentials: true");
            header("Access-Control-Allow-Headers: Authorization, Content-Type, X-API-Key");
            header("Access-Control-Max-Age: 3600");
        }
        
        // Handle preflight requests
        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
    }
    
    /**
     * Check API key for authentication
     */
    public function check_api_key($request) {
        $api_key = $request->get_header('X-API-Key');
        $stored_key = get_option('mycc_fm_api_key');
        
        // Allow access if no API key is set (for initial setup)
        if (empty($stored_key)) {
            return true;
        }
        
        return $api_key === $stored_key;
    }
    
    /**
     * Get all forms health status
     */
    public function get_forms_health($request) {
        global $wpdb;
        
        $forms = array();
        if (class_exists('GFAPI')) {
            $forms = GFAPI::get_forms();
        }
        
        $forms_health = array();
        $monitor = new MYCC_Form_Monitor();
        
        foreach ($forms as $form) {
            if ($form['is_active'] != '1') continue;
            
            $stats = $monitor->calculate_form_statistics($form['id']);
            $last_submission = $monitor->get_last_submission_time($form['id']);
            $status = $monitor->determine_health_status($last_submission);
            
            // Calculate response time (mock for now - would need real monitoring)
            $response_time = $this->calculate_response_time($form['id']);
            
            $forms_health[] = array(
                'id' => $form['id'],
                'title' => $form['title'],
                'status' => $status,
                'lastSubmission' => $last_submission ? 
                    date('Y-m-d H:i:s', strtotime($last_submission)) : null,
                'submissionsToday' => $stats['submissions_today'],
                'avgSubmissionsPerHour' => $stats['avg_per_hour'],
                'totalEntries' => $stats['total_submissions'],
                'errorRate' => $this->calculate_error_rate($form['id']),
                'responseTime' => $response_time,
                'successRate' => 95.5 // Mock data - would calculate from real submissions
            );
        }
        
        // Calculate summary
        $summary = array(
            'totalForms' => count($forms_health),
            'healthyForms' => count(array_filter($forms_health, function($f) { 
                return $f['status'] === 'healthy'; 
            })),
            'warningForms' => count(array_filter($forms_health, function($f) { 
                return $f['status'] === 'warning'; 
            })),
            'criticalForms' => count(array_filter($forms_health, function($f) { 
                return $f['status'] === 'critical' || $f['status'] === 'offline'; 
            }))
        );
        
        return new WP_REST_Response(array(
            'forms' => $forms_health,
            'summary' => $summary,
            'lastUpdate' => current_time('c')
        ), 200);
    }
    
    /**
     * Get specific form statistics
     */
    public function get_form_stats($request) {
        $form_id = $request['id'];
        
        if (!class_exists('GFAPI')) {
            return new WP_Error('no_gravity_forms', 'Gravity Forms not installed', array('status' => 404));
        }
        
        $form = GFAPI::get_form($form_id);
        if (!$form) {
            return new WP_Error('form_not_found', 'Form not found', array('status' => 404));
        }
        
        $monitor = new MYCC_Form_Monitor();
        $stats = $monitor->calculate_form_statistics($form_id);
        $last_submission = $monitor->get_last_submission_time($form_id);
        
        // Get submission trends (last 7 days)
        $trends = $this->get_submission_trends($form_id, 7);
        
        return new WP_REST_Response(array(
            'form' => array(
                'id' => $form['id'],
                'title' => $form['title']
            ),
            'stats' => array(
                'total' => $stats['total_submissions'],
                'today' => $stats['submissions_today'],
                'avgPerHour' => $stats['avg_per_hour'],
                'lastSubmission' => $last_submission
            ),
            'trends' => $trends,
            'performance' => array(
                'avgResponseTime' => $this->calculate_response_time($form_id),
                'errorRate' => $this->calculate_error_rate($form_id),
                'successRate' => 95.5
            )
        ), 200);
    }
    
    /**
     * Get recent submissions
     */
    public function get_recent_submissions($request) {
        global $wpdb;
        
        $limit = $request->get_param('limit') ?: 50;
        $form_id = $request->get_param('form_id');
        
        $query = "SELECT * FROM " . MYCC_FM_TABLE_NAME;
        $params = array();
        
        if ($form_id) {
            $query .= " WHERE form_id = %d";
            $params[] = $form_id;
        }
        
        $query .= " ORDER BY submission_time DESC LIMIT %d";
        $params[] = $limit;
        
        $submissions = $wpdb->get_results(
            $wpdb->prepare($query, $params)
        );
        
        // Format submissions for dashboard
        $formatted = array_map(function($submission) {
            return array(
                'id' => 'submission_' . $submission->id,
                'formId' => $submission->form_id,
                'formTitle' => $submission->form_title,
                'timestamp' => $submission->submission_time,
                'status' => $submission->status === 'active' ? 'success' : 'failed',
                'processingTime' => floatval($submission->processing_time) * 1000, // Convert to ms
                'ip' => $submission->user_ip,
                'userAgent' => $submission->user_agent
            );
        }, $submissions);
        
        return new WP_REST_Response($formatted, 200);
    }
    
    /**
     * Get alert configurations
     */
    public function get_alerts($request) {
        global $wpdb;
        
        $alerts = $wpdb->get_results("SELECT * FROM " . MYCC_FM_ALERTS_TABLE);
        
        return new WP_REST_Response($alerts, 200);
    }
    
    /**
     * Create or update alert
     */
    public function create_alert($request) {
        global $wpdb;
        
        $data = array(
            'form_id' => intval($request->get_param('form_id')),
            'alert_type' => sanitize_text_field($request->get_param('alert_type')),
            'threshold_minutes' => intval($request->get_param('threshold_minutes')),
            'email_recipients' => sanitize_text_field($request->get_param('email_recipients')),
            'webhook_url' => esc_url_raw($request->get_param('webhook_url')),
            'enabled' => $request->get_param('enabled') ? 1 : 0
        );
        
        $alert_id = $request->get_param('id');
        
        if ($alert_id) {
            // Update existing
            $result = $wpdb->update(MYCC_FM_ALERTS_TABLE, $data, array('id' => $alert_id));
        } else {
            // Create new
            $result = $wpdb->insert(MYCC_FM_ALERTS_TABLE, $data);
            $alert_id = $wpdb->insert_id;
        }
        
        if ($result !== false) {
            return new WP_REST_Response(array(
                'id' => $alert_id,
                'message' => 'Alert saved successfully'
            ), 200);
        } else {
            return new WP_Error('save_failed', 'Failed to save alert', array('status' => 500));
        }
    }
    
    /**
     * Test webhook endpoint
     */
    public function test_webhook($request) {
        // Log the webhook data
        $data = $request->get_json_params();
        
        error_log('MyCC Form Monitor Webhook Test: ' . print_r($data, true));
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Webhook received',
            'data' => $data
        ), 200);
    }
    
    /**
     * Calculate response time (mock implementation)
     */
    private function calculate_response_time($form_id) {
        // In a real implementation, this would track actual form load/submit times
        return rand(800, 2000);
    }
    
    /**
     * Calculate error rate (mock implementation)
     */
    private function calculate_error_rate($form_id) {
        // In a real implementation, this would track failed submissions
        return rand(0, 5) / 10;
    }
    
    /**
     * Get submission trends
     */
    private function get_submission_trends($form_id, $days) {
        global $wpdb;
        
        $trends = array();
        
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            
            $count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM " . MYCC_FM_TABLE_NAME . " 
                WHERE form_id = %d 
                AND DATE(submission_time) = %s",
                $form_id, $date
            ));
            
            $trends[] = array(
                'date' => $date,
                'submissions' => intval($count)
            );
        }
        
        return $trends;
    }
}