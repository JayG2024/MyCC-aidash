<?php
/**
 * Plugin Name: MyCC Form Monitor
 * Plugin URI: https://www.mycomputercareer.edu
 * Description: Real-time monitoring and alerting system for Gravity Forms submissions
 * Version: 1.0.0
 * Author: AppSuite - Custom Plugin for MyCC
 * License: GPL v2 or later
 * Text Domain: mycc-form-monitor
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MYCC_FM_VERSION', '1.0.0');
define('MYCC_FM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MYCC_FM_PLUGIN_URL', plugin_dir_url(__FILE__));

// Define table names after WordPress is loaded
function mycc_fm_define_tables() {
    global $wpdb;
    if (!defined('MYCC_FM_TABLE_NAME')) {
        define('MYCC_FM_TABLE_NAME', $wpdb->prefix . 'mycc_form_submissions');
        define('MYCC_FM_ALERTS_TABLE', $wpdb->prefix . 'mycc_form_alerts');
    }
}
add_action('init', 'mycc_fm_define_tables', 1);

// Include required files
require_once MYCC_FM_PLUGIN_DIR . 'includes/class-form-monitor.php';
require_once MYCC_FM_PLUGIN_DIR . 'includes/class-alert-manager.php';
require_once MYCC_FM_PLUGIN_DIR . 'includes/class-admin-dashboard.php';
require_once MYCC_FM_PLUGIN_DIR . 'includes/class-api-endpoints.php';

// Activation hook
register_activation_hook(__FILE__, 'mycc_fm_activate');
function mycc_fm_activate() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    $table_name = $wpdb->prefix . 'mycc_form_submissions';
    $alerts_table = $wpdb->prefix . 'mycc_form_alerts';
    
    // Create submissions tracking table
    $sql = "CREATE TABLE IF NOT EXISTS " . $table_name . " (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        form_id bigint(20) NOT NULL,
        form_title varchar(255) NOT NULL,
        entry_id bigint(20) NOT NULL,
        submission_time datetime DEFAULT CURRENT_TIMESTAMP,
        user_ip varchar(45),
        user_agent text,
        status varchar(50) DEFAULT 'success',
        processing_time float,
        PRIMARY KEY (id),
        KEY form_id (form_id),
        KEY submission_time (submission_time)
    ) $charset_collate;";
    
    // Create alerts configuration table
    $sql2 = "CREATE TABLE IF NOT EXISTS " . $alerts_table . " (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        form_id bigint(20) NOT NULL,
        alert_type varchar(50) NOT NULL,
        threshold_minutes int NOT NULL,
        email_recipients text,
        webhook_url text,
        enabled tinyint(1) DEFAULT 1,
        last_alert_sent datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY form_id (form_id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    dbDelta($sql2);
    
    // Schedule cron job for monitoring
    if (!wp_next_scheduled('mycc_fm_check_form_health')) {
        wp_schedule_event(time(), 'five_minutes', 'mycc_fm_check_form_health');
    }
    
    // Add default options
    add_option('mycc_fm_default_threshold', 60); // 60 minutes default
    add_option('mycc_fm_notification_emails', get_option('admin_email'));
    add_option('mycc_fm_dashboard_api_url', '');
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'mycc_fm_deactivate');
function mycc_fm_deactivate() {
    wp_clear_scheduled_hook('mycc_fm_check_form_health');
}

// Add custom cron interval
add_filter('cron_schedules', 'mycc_fm_cron_intervals');
function mycc_fm_cron_intervals($schedules) {
    $schedules['five_minutes'] = array(
        'interval' => 300,
        'display' => __('Every Five Minutes', 'mycc-form-monitor')
    );
    return $schedules;
}

// Initialize plugin
add_action('plugins_loaded', 'mycc_fm_init');
function mycc_fm_init() {
    new MYCC_Form_Monitor();
    new MYCC_Alert_Manager();
    new MYCC_Admin_Dashboard();
    new MYCC_API_Endpoints();
}