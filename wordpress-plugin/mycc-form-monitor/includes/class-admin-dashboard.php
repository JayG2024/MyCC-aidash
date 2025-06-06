<?php
/**
 * Admin Dashboard Class
 * Provides WordPress admin interface for form monitoring
 */

if (!defined('ABSPATH')) {
    exit;
}

class MYCC_Admin_Dashboard {
    
    public function __construct() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue admin scripts
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Handle AJAX requests
        add_action('wp_ajax_mycc_fm_save_alert', array($this, 'ajax_save_alert'));
        add_action('wp_ajax_mycc_fm_delete_alert', array($this, 'ajax_delete_alert'));
        add_action('wp_ajax_mycc_fm_get_form_stats', array($this, 'ajax_get_form_stats'));
        add_action('wp_ajax_mycc_fm_test_alert', array($this, 'ajax_test_alert'));
    }
    
    /**
     * Add admin menu items
     */
    public function add_admin_menu() {
        // Main menu
        add_menu_page(
            __('Form Monitor', 'mycc-form-monitor'),
            __('Form Monitor', 'mycc-form-monitor'),
            'manage_options',
            'mycc-form-monitor',
            array($this, 'render_dashboard_page'),
            'dashicons-shield-alt',
            30
        );
        
        // Submenu - Dashboard
        add_submenu_page(
            'mycc-form-monitor',
            __('Dashboard', 'mycc-form-monitor'),
            __('Dashboard', 'mycc-form-monitor'),
            'manage_options',
            'mycc-form-monitor',
            array($this, 'render_dashboard_page')
        );
        
        // Submenu - Alerts
        add_submenu_page(
            'mycc-form-monitor',
            __('Alert Rules', 'mycc-form-monitor'),
            __('Alert Rules', 'mycc-form-monitor'),
            'manage_options',
            'mycc-form-monitor-alerts',
            array($this, 'render_alerts_page')
        );
        
        // Submenu - Settings
        add_submenu_page(
            'mycc-form-monitor',
            __('Settings', 'mycc-form-monitor'),
            __('Settings', 'mycc-form-monitor'),
            'manage_options',
            'mycc-form-monitor-settings',
            array($this, 'render_settings_page')
        );
        
        // Submenu - Logs
        add_submenu_page(
            'mycc-form-monitor',
            __('Alert Logs', 'mycc-form-monitor'),
            __('Alert Logs', 'mycc-form-monitor'),
            'manage_options',
            'mycc-form-monitor-logs',
            array($this, 'render_logs_page')
        );
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'mycc-form-monitor') === false) {
            return;
        }
        
        // Enqueue styles
        wp_enqueue_style(
            'mycc-fm-admin',
            MYCC_FM_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            MYCC_FM_VERSION
        );
        
        // Enqueue scripts
        wp_enqueue_script(
            'mycc-fm-admin',
            MYCC_FM_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'wp-util'),
            MYCC_FM_VERSION,
            true
        );
        
        // Localize script
        wp_localize_script('mycc-fm-admin', 'mycc_fm', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('mycc_fm_nonce'),
            'strings' => array(
                'confirm_delete' => __('Are you sure you want to delete this alert rule?', 'mycc-form-monitor'),
                'test_sent' => __('Test alert sent successfully!', 'mycc-form-monitor'),
                'error' => __('An error occurred. Please try again.', 'mycc-form-monitor')
            )
        ));
    }
    
    /**
     * Render main dashboard page
     */
    public function render_dashboard_page() {
        global $wpdb;
        
        // Get all forms
        $forms = array();
        if (class_exists('GFAPI')) {
            $forms = GFAPI::get_forms();
        }
        
        // Get form statistics
        $form_stats = array();
        foreach ($forms as $form) {
            if ($form['is_active'] != '1') continue;
            
            $stats = $this->get_form_statistics($form['id']);
            $form_stats[$form['id']] = array_merge($stats, array(
                'title' => $form['title'],
                'id' => $form['id']
            ));
        }
        
        ?>
        <div class="wrap mycc-fm-dashboard">
            <h1><?php _e('Form Monitor Dashboard', 'mycc-form-monitor'); ?></h1>
            
            <!-- Summary Cards -->
            <div class="mycc-fm-summary-cards">
                <div class="card">
                    <h3><?php _e('Total Forms', 'mycc-form-monitor'); ?></h3>
                    <p class="number"><?php echo count($forms); ?></p>
                </div>
                
                <div class="card healthy">
                    <h3><?php _e('Healthy Forms', 'mycc-form-monitor'); ?></h3>
                    <p class="number"><?php echo $this->count_healthy_forms($form_stats); ?></p>
                </div>
                
                <div class="card warning">
                    <h3><?php _e('Warning', 'mycc-form-monitor'); ?></h3>
                    <p class="number"><?php echo $this->count_warning_forms($form_stats); ?></p>
                </div>
                
                <div class="card critical">
                    <h3><?php _e('Critical', 'mycc-form-monitor'); ?></h3>
                    <p class="number"><?php echo $this->count_critical_forms($form_stats); ?></p>
                </div>
            </div>
            
            <!-- Forms Table -->
            <h2><?php _e('Form Health Status', 'mycc-form-monitor'); ?></h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('Form', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Status', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Last Submission', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Today', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Avg/Hour (24h)', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Total', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Actions', 'mycc-form-monitor'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($form_stats as $stats): ?>
                    <tr>
                        <td>
                            <strong><?php echo esc_html($stats['title']); ?></strong>
                            <br><small>ID: <?php echo esc_html($stats['id']); ?></small>
                        </td>
                        <td>
                            <span class="status-badge status-<?php echo esc_attr($stats['status']); ?>">
                                <?php echo ucfirst($stats['status']); ?>
                            </span>
                        </td>
                        <td><?php echo $stats['last_submission_formatted']; ?></td>
                        <td><?php echo number_format($stats['submissions_today']); ?></td>
                        <td><?php echo number_format($stats['avg_per_hour'], 1); ?></td>
                        <td><?php echo number_format($stats['total_submissions']); ?></td>
                        <td>
                            <a href="#" class="button button-small view-details" data-form-id="<?php echo esc_attr($stats['id']); ?>">
                                <?php _e('View Details', 'mycc-form-monitor'); ?>
                            </a>
                            <a href="<?php echo admin_url('admin.php?page=mycc-form-monitor-alerts&form_id=' . $stats['id']); ?>" class="button button-small">
                                <?php _e('Configure Alerts', 'mycc-form-monitor'); ?>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <!-- Auto-refresh notice -->
            <p class="description">
                <?php _e('This dashboard auto-refreshes every 60 seconds.', 'mycc-form-monitor'); ?>
                <span id="last-refresh"><?php _e('Last refresh:', 'mycc-form-monitor'); ?> <span><?php echo current_time('g:i:s a'); ?></span></span>
            </p>
        </div>
        
        <style>
        .mycc-fm-summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .mycc-fm-summary-cards .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            padding: 20px;
            text-align: center;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .mycc-fm-summary-cards .card h3 {
            margin: 0 0 10px;
            font-size: 14px;
            color: #555;
        }
        .mycc-fm-summary-cards .card .number {
            font-size: 32px;
            font-weight: 600;
            margin: 0;
            color: #23282d;
        }
        .mycc-fm-summary-cards .card.healthy .number { color: #46b450; }
        .mycc-fm-summary-cards .card.warning .number { color: #ffb900; }
        .mycc-fm-summary-cards .card.critical .number { color: #dc3232; }
        
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-healthy { background: #d4f4d4; color: #46b450; }
        .status-warning { background: #fff3cd; color: #996800; }
        .status-critical { background: #f8d7da; color: #a00; }
        .status-offline { background: #e7e8ea; color: #555; }
        </style>
        <?php
    }
    
    /**
     * Render alerts configuration page
     */
    public function render_alerts_page() {
        global $wpdb;
        
        $forms = array();
        if (class_exists('GFAPI')) {
            $forms = GFAPI::get_forms();
        }
        
        // Get existing alert rules
        $alerts = $wpdb->get_results("SELECT * FROM " . MYCC_FM_ALERTS_TABLE . " ORDER BY form_id");
        
        ?>
        <div class="wrap">
            <h1><?php _e('Alert Rules', 'mycc-form-monitor'); ?></h1>
            
            <div class="card">
                <h2><?php _e('Add New Alert Rule', 'mycc-form-monitor'); ?></h2>
                <form id="add-alert-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="form_id"><?php _e('Form', 'mycc-form-monitor'); ?></label></th>
                            <td>
                                <select name="form_id" id="form_id" required>
                                    <option value=""><?php _e('Select a form', 'mycc-form-monitor'); ?></option>
                                    <?php foreach ($forms as $form): ?>
                                        <?php if ($form['is_active'] == '1'): ?>
                                        <option value="<?php echo esc_attr($form['id']); ?>">
                                            <?php echo esc_html($form['title']); ?>
                                        </option>
                                        <?php endif; ?>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="alert_type"><?php _e('Alert Type', 'mycc-form-monitor'); ?></label></th>
                            <td>
                                <select name="alert_type" id="alert_type" required>
                                    <option value="no_submissions"><?php _e('No Submissions', 'mycc-form-monitor'); ?></option>
                                    <option value="low_volume"><?php _e('Low Submission Volume', 'mycc-form-monitor'); ?></option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="threshold_minutes"><?php _e('Threshold (minutes)', 'mycc-form-monitor'); ?></label></th>
                            <td>
                                <input type="number" name="threshold_minutes" id="threshold_minutes" min="5" value="60" required>
                                <p class="description"><?php _e('Alert if no submissions received within this time period', 'mycc-form-monitor'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="email_recipients"><?php _e('Email Recipients', 'mycc-form-monitor'); ?></label></th>
                            <td>
                                <input type="text" name="email_recipients" id="email_recipients" class="regular-text" 
                                       value="<?php echo esc_attr(get_option('admin_email')); ?>">
                                <p class="description"><?php _e('Comma-separated email addresses', 'mycc-form-monitor'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="webhook_url"><?php _e('Webhook URL', 'mycc-form-monitor'); ?></label></th>
                            <td>
                                <input type="url" name="webhook_url" id="webhook_url" class="regular-text">
                                <p class="description"><?php _e('Optional: Slack, Discord, or custom webhook URL', 'mycc-form-monitor'); ?></p>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" class="button button-primary"><?php _e('Add Alert Rule', 'mycc-form-monitor'); ?></button>
                        <button type="button" class="button test-alert" style="display:none;"><?php _e('Test Alert', 'mycc-form-monitor'); ?></button>
                    </p>
                </form>
            </div>
            
            <h2><?php _e('Existing Alert Rules', 'mycc-form-monitor'); ?></h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('Form', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Alert Type', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Threshold', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Recipients', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Status', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Last Alert', 'mycc-form-monitor'); ?></th>
                        <th><?php _e('Actions', 'mycc-form-monitor'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($alerts as $alert): ?>
                    <?php 
                        $form_title = 'Unknown Form';
                        foreach ($forms as $form) {
                            if ($form['id'] == $alert->form_id) {
                                $form_title = $form['title'];
                                break;
                            }
                        }
                    ?>
                    <tr>
                        <td><?php echo esc_html($form_title); ?></td>
                        <td><?php echo esc_html(ucwords(str_replace('_', ' ', $alert->alert_type))); ?></td>
                        <td><?php echo esc_html($alert->threshold_minutes); ?> minutes</td>
                        <td><?php echo esc_html(substr($alert->email_recipients, 0, 30)) . (strlen($alert->email_recipients) > 30 ? '...' : ''); ?></td>
                        <td>
                            <?php if ($alert->enabled): ?>
                                <span class="status-badge status-healthy">Active</span>
                            <?php else: ?>
                                <span class="status-badge status-offline">Disabled</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php 
                            if ($alert->last_alert_sent) {
                                echo human_time_diff(strtotime($alert->last_alert_sent)) . ' ago';
                            } else {
                                echo 'Never';
                            }
                            ?>
                        </td>
                        <td>
                            <button class="button button-small toggle-alert" data-alert-id="<?php echo esc_attr($alert->id); ?>" 
                                    data-enabled="<?php echo esc_attr($alert->enabled); ?>">
                                <?php echo $alert->enabled ? __('Disable', 'mycc-form-monitor') : __('Enable', 'mycc-form-monitor'); ?>
                            </button>
                            <button class="button button-small delete-alert" data-alert-id="<?php echo esc_attr($alert->id); ?>">
                                <?php _e('Delete', 'mycc-form-monitor'); ?>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (isset($_POST['submit'])) {
            update_option('mycc_fm_default_threshold', intval($_POST['default_threshold']));
            update_option('mycc_fm_notification_emails', sanitize_text_field($_POST['notification_emails']));
            update_option('mycc_fm_dashboard_api_url', esc_url_raw($_POST['dashboard_api_url']));
            update_option('mycc_fm_api_key', sanitize_text_field($_POST['api_key']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved!', 'mycc-form-monitor') . '</p></div>';
        }
        
        ?>
        <div class="wrap">
            <h1><?php _e('Form Monitor Settings', 'mycc-form-monitor'); ?></h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="default_threshold"><?php _e('Default Alert Threshold', 'mycc-form-monitor'); ?></label>
                        </th>
                        <td>
                            <input type="number" name="default_threshold" id="default_threshold" 
                                   value="<?php echo esc_attr(get_option('mycc_fm_default_threshold', 60)); ?>" min="5">
                            <p class="description"><?php _e('Default time in minutes before alerting (for forms without custom rules)', 'mycc-form-monitor'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="notification_emails"><?php _e('Default Notification Emails', 'mycc-form-monitor'); ?></label>
                        </th>
                        <td>
                            <input type="text" name="notification_emails" id="notification_emails" class="regular-text"
                                   value="<?php echo esc_attr(get_option('mycc_fm_notification_emails', get_option('admin_email'))); ?>">
                            <p class="description"><?php _e('Comma-separated list of email addresses', 'mycc-form-monitor'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="dashboard_api_url"><?php _e('Dashboard API URL', 'mycc-form-monitor'); ?></label>
                        </th>
                        <td>
                            <input type="url" name="dashboard_api_url" id="dashboard_api_url" class="regular-text"
                                   value="<?php echo esc_attr(get_option('mycc_fm_dashboard_api_url', '')); ?>">
                            <p class="description"><?php _e('MyCC AI Dashboard API endpoint for real-time updates', 'mycc-form-monitor'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="api_key"><?php _e('API Key', 'mycc-form-monitor'); ?></label>
                        </th>
                        <td>
                            <input type="text" name="api_key" id="api_key" class="regular-text"
                                   value="<?php echo esc_attr(get_option('mycc_fm_api_key', '')); ?>">
                            <p class="description"><?php _e('API key for authenticating with the dashboard', 'mycc-form-monitor'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * Render logs page
     */
    public function render_logs_page() {
        $alert_log = get_option('mycc_fm_alert_log', array());
        
        ?>
        <div class="wrap">
            <h1><?php _e('Alert Logs', 'mycc-form-monitor'); ?></h1>
            
            <?php if (empty($alert_log)): ?>
                <p><?php _e('No alerts have been triggered yet.', 'mycc-form-monitor'); ?></p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('Time', 'mycc-form-monitor'); ?></th>
                            <th><?php _e('Form', 'mycc-form-monitor'); ?></th>
                            <th><?php _e('Alert Type', 'mycc-form-monitor'); ?></th>
                            <th><?php _e('Severity', 'mycc-form-monitor'); ?></th>
                            <th><?php _e('Details', 'mycc-form-monitor'); ?></th>
                            <th><?php _e('Status', 'mycc-form-monitor'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($alert_log as $log): ?>
                        <tr>
                            <td><?php echo date('Y-m-d H:i:s', strtotime($log['timestamp'])); ?></td>
                            <td><?php echo esc_html($log['alert']['form_title']); ?></td>
                            <td><?php echo esc_html(ucwords(str_replace('_', ' ', $log['alert']['alert_type']))); ?></td>
                            <td>
                                <span class="status-badge status-<?php echo esc_attr($log['alert']['severity']); ?>">
                                    <?php echo ucfirst($log['alert']['severity']); ?>
                                </span>
                            </td>
                            <td>
                                <?php if (isset($log['alert']['time_since_submission'])): ?>
                                    No submissions for <?php echo esc_html($log['alert']['time_since_submission']); ?> minutes
                                <?php else: ?>
                                    No submissions recorded
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (isset($log['alert']['resolved']) && $log['alert']['resolved']): ?>
                                    <span class="status-badge status-healthy">Resolved</span>
                                <?php else: ?>
                                    <span class="status-badge status-warning">Active</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Get form statistics
     */
    private function get_form_statistics($form_id) {
        global $wpdb;
        
        $monitor = new MYCC_Form_Monitor();
        $stats = $monitor->calculate_form_statistics($form_id);
        $last_submission = $monitor->get_last_submission_time($form_id);
        $status = $monitor->determine_health_status($last_submission);
        
        return array_merge($stats, array(
            'status' => $status,
            'last_submission' => $last_submission,
            'last_submission_formatted' => $last_submission ? 
                human_time_diff(strtotime($last_submission)) . ' ago' : 'No data yet'
        ));
    }
    
    /**
     * Count forms by status
     */
    private function count_healthy_forms($form_stats) {
        return count(array_filter($form_stats, function($stats) {
            return $stats['status'] === 'healthy';
        }));
    }
    
    private function count_warning_forms($form_stats) {
        return count(array_filter($form_stats, function($stats) {
            return $stats['status'] === 'warning';
        }));
    }
    
    private function count_critical_forms($form_stats) {
        return count(array_filter($form_stats, function($stats) {
            return $stats['status'] === 'critical' || $stats['status'] === 'offline';
        }));
    }
    
    /**
     * AJAX handler for saving alerts
     */
    public function ajax_save_alert() {
        check_ajax_referer('mycc_fm_nonce', 'nonce');
        
        global $wpdb;
        
        $data = array(
            'form_id' => intval($_POST['form_id']),
            'alert_type' => sanitize_text_field($_POST['alert_type']),
            'threshold_minutes' => intval($_POST['threshold_minutes']),
            'email_recipients' => sanitize_text_field($_POST['email_recipients']),
            'webhook_url' => esc_url_raw($_POST['webhook_url']),
            'enabled' => 1
        );
        
        $result = $wpdb->insert(MYCC_FM_ALERTS_TABLE, $data);
        
        if ($result) {
            wp_send_json_success(array('message' => __('Alert rule saved successfully!', 'mycc-form-monitor')));
        } else {
            wp_send_json_error(array('message' => __('Failed to save alert rule.', 'mycc-form-monitor')));
        }
    }
    
    /**
     * AJAX handler for deleting alerts
     */
    public function ajax_delete_alert() {
        check_ajax_referer('mycc_fm_nonce', 'nonce');
        
        global $wpdb;
        
        $alert_id = intval($_POST['alert_id']);
        $result = $wpdb->delete(MYCC_FM_ALERTS_TABLE, array('id' => $alert_id));
        
        if ($result) {
            wp_send_json_success();
        } else {
            wp_send_json_error();
        }
    }
    
    /**
     * AJAX handler for getting form stats
     */
    public function ajax_get_form_stats() {
        check_ajax_referer('mycc_fm_nonce', 'nonce');
        
        $form_id = intval($_POST['form_id']);
        $stats = $this->get_form_statistics($form_id);
        
        wp_send_json_success($stats);
    }
    
    /**
     * AJAX handler for testing alerts
     */
    public function ajax_test_alert() {
        check_ajax_referer('mycc_fm_nonce', 'nonce');
        
        $form_id = intval($_POST['form_id']);
        $form = GFAPI::get_form($form_id);
        
        $alert_manager = new MYCC_Alert_Manager();
        $alert_manager->trigger_default_alert($form, 0);
        
        wp_send_json_success(array('message' => __('Test alert sent!', 'mycc-form-monitor')));
    }
}