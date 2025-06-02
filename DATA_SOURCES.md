# Form Monitoring Data Sources & Architecture

## **Where We'll Pull All Monitoring Data From**

### **1. WordPress/Gravity Forms Data Sources**

#### **A. Gravity Forms Database Tables**
```sql
-- Main forms table
wp_gf_form

-- Form entries (submissions)
wp_gf_entry
wp_gf_entry_meta

-- Form views and analytics
wp_gf_view
wp_gf_analytics
```

#### **B. Gravity Forms REST API v2**
```bash
# Base endpoint
https://www.mycomputercareer.edu/wp-json/gf/v2/

# Get all forms
GET /forms

# Get form entries
GET /forms/{form_id}/entries

# Get form settings
GET /forms/{form_id}
```

#### **C. WordPress Action Hooks (Real-time)**
```php
// Hook into form submissions
add_action('gform_after_submission', 'monitor_submission', 10, 2);

// Hook into form validation
add_action('gform_validation', 'monitor_validation', 10, 1);

// Hook into entry creation
add_action('gform_entry_created', 'monitor_entry_created', 10, 2);
```

### **2. Server-Level Monitoring**

#### **A. WordPress Error Logs**
```bash
# WordPress debug log
/wp-content/debug.log

# Server error logs (Kinsta)
/var/log/nginx/error.log
/var/log/php/error.log
```

#### **B. Database Performance**
```sql
-- Monitor slow queries
SHOW PROCESSLIST;

-- Check table locks
SHOW OPEN TABLES WHERE In_use > 0;

-- Monitor connection count
SHOW STATUS LIKE 'Threads_connected';
```

### **3. Integration Monitoring**

#### **A. HubSpot API**
```javascript
// Monitor HubSpot form submissions
POST https://api.hubapi.com/form-integrations/v1/submissions/forms/{form_id}

// Track API response times and errors
GET https://api.hubapi.com/crm/v3/objects/contacts
```

#### **B. Email Delivery (SMTP)**
```javascript
// Monitor email sending via WordPress
wp_mail() success/failure tracking

// SMTP server response codes
250 - Success
421 - Service not available
550 - Mailbox unavailable
```

#### **C. reCAPTCHA v3**
```javascript
// Monitor CAPTCHA verification
POST https://www.google.com/recaptcha/api/siteverify

// Track scores and failure rates
{
  "success": true,
  "score": 0.9,
  "action": "submit"
}
```

### **4. Client-Side Monitoring**

#### **A. JavaScript Error Tracking**
```javascript
// Monitor form JavaScript errors
window.addEventListener('error', function(e) {
  // Track form-related JS errors
  if (e.target.closest('.gform_wrapper')) {
    sendErrorToMonitor(e);
  }
});
```

#### **B. Form Performance Metrics**
```javascript
// Track form load times
const formLoadTime = performance.now();

// Monitor form submission times
const submissionStart = performance.now();
// ... submission logic
const submissionTime = performance.now() - submissionStart;
```

### **5. Our Custom Dashboard Database**

#### **A. Submission Tracking Table**
```sql
CREATE TABLE form_submissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  form_id VARCHAR(50) NOT NULL,
  form_title VARCHAR(255) NOT NULL,
  submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'failed', 'blocked', 'spam') NOT NULL,
  user_ip VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(100),
  processing_time INT, -- milliseconds
  error_message TEXT,
  spam_score DECIMAL(5,2),
  
  -- Integration status
  hubspot_synced BOOLEAN DEFAULT FALSE,
  hubspot_response TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_response TEXT,
  captcha_score DECIMAL(3,2),
  
  INDEX idx_form_id (form_id),
  INDEX idx_submission_time (submission_time),
  INDEX idx_status (status)
);
```

#### **B. Form Health Status Table**
```sql
CREATE TABLE form_health_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  form_id VARCHAR(50) NOT NULL,
  check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('healthy', 'warning', 'critical', 'offline') NOT NULL,
  response_time INT, -- milliseconds
  error_rate DECIMAL(5,2),
  last_submission TIMESTAMP,
  submissions_today INT DEFAULT 0,
  submissions_hour INT DEFAULT 0,
  
  UNIQUE KEY unique_form_check (form_id, check_time)
);
```

#### **C. Alert Rules Table**
```sql
CREATE TABLE notification_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  form_id VARCHAR(50),
  rule_type ENUM('submission_stopped', 'high_error_rate', 'spam_detected', 'integration_failed', 'slow_response') NOT NULL,
  threshold_value DECIMAL(10,2) NOT NULL,
  time_window INT NOT NULL, -- minutes
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Notification channels
  email_enabled BOOLEAN DEFAULT FALSE,
  slack_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  dashboard_enabled BOOLEAN DEFAULT TRUE,
  
  -- Recipients
  email_recipients JSON,
  phone_recipients JSON,
  slack_channels JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **6. Real-Time Data Collection Methods**

#### **A. WordPress Plugin (Minimal Impact)**
```php
<?php
/**
 * MyCC Form Monitor Plugin
 * Lightweight monitoring with minimal performance impact
 */

class MyCC_Form_Monitor {
    
    public function __construct() {
        add_action('gform_after_submission', [$this, 'track_submission'], 10, 2);
        add_action('gform_validation', [$this, 'track_validation'], 10, 1);
        add_action('wp_ajax_nopriv_form_heartbeat', [$this, 'record_heartbeat']);
        add_action('wp_ajax_form_heartbeat', [$this, 'record_heartbeat']);
    }
    
    public function track_submission($entry, $form) {
        $start_time = microtime(true);
        
        $data = [
            'form_id' => $form['id'],
            'form_title' => $form['title'],
            'submission_time' => current_time('mysql'),
            'user_ip' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'processing_time' => round((microtime(true) - $start_time) * 1000)
        ];
        
        // Send to monitoring dashboard (async)
        wp_remote_post('https://mycc-ai-dashboard.web.app/api/form-submission', [
            'body' => json_encode($data),
            'headers' => ['Content-Type' => 'application/json'],
            'timeout' => 5,
            'blocking' => false // Don't wait for response
        ]);
    }
}

new MyCC_Form_Monitor();
```

#### **B. JavaScript Form Monitoring**
```javascript
// Lightweight form monitoring script (< 5KB)
(function() {
    const monitor = {
        init() {
            this.trackFormLoads();
            this.trackSubmissions();
            this.trackErrors();
            this.sendHeartbeat();
        },
        
        trackFormLoads() {
            document.querySelectorAll('.gform_wrapper').forEach(form => {
                const loadTime = performance.now();
                this.logMetric('form_load', {
                    form_id: form.id,
                    load_time: loadTime
                });
            });
        },
        
        trackSubmissions() {
            document.addEventListener('submit', (e) => {
                if (e.target.closest('.gform_wrapper')) {
                    const startTime = performance.now();
                    this.logMetric('form_submit_start', {
                        form_id: e.target.id,
                        start_time: startTime
                    });
                }
            });
        },
        
        sendHeartbeat() {
            const data = {
                total_forms: document.querySelectorAll('.gform_wrapper').length,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
            };
            
            fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: new URLSearchParams({
                    action: 'form_heartbeat',
                    data: JSON.stringify(data)
                })
            });
            
            // Send heartbeat every 5 minutes
            setTimeout(() => this.sendHeartbeat(), 300000);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => monitor.init());
    } else {
        monitor.init();
    }
})();
```

### **7. Performance Optimization**

#### **A. Caching Strategy**
```javascript
// Redis cache for form health data
const cache = {
    set: (key, data, ttl = 300) => {
        redis.setex(`form_monitor:${key}`, ttl, JSON.stringify(data));
    },
    
    get: (key) => {
        return redis.get(`form_monitor:${key}`).then(JSON.parse);
    }
};
```

#### **B. Batch Processing**
```javascript
// Collect metrics in batches to reduce server load
const metricsBuffer = [];

function batchSendMetrics() {
    if (metricsBuffer.length > 0) {
        fetch('/api/metrics/batch', {
            method: 'POST',
            body: JSON.stringify(metricsBuffer)
        });
        metricsBuffer.length = 0;
    }
}

// Send every 30 seconds or when buffer reaches 50 items
setInterval(batchSendMetrics, 30000);
```

## **Implementation Priority**

### **Phase 1: Basic Monitoring (Week 1)**
1. WordPress webhook for form submissions
2. Simple health status tracking
3. Dashboard integration

### **Phase 2: Advanced Features (Week 2-3)**
1. Integration monitoring (HubSpot, email)
2. Spam/security tracking
3. Performance metrics

### **Phase 3: AI & Optimization (Week 4+)**
1. Predictive failure detection
2. Automated issue resolution
3. Performance optimization

## **Minimal Performance Impact**

- **Async requests**: All monitoring calls are non-blocking
- **Lightweight scripts**: < 5KB monitoring JavaScript
- **Efficient database**: Optimized tables with proper indexing
- **Caching**: Redis for frequently accessed data
- **Batch processing**: Reduce server requests by collecting metrics in batches

This architecture ensures comprehensive monitoring while maintaining website performance.