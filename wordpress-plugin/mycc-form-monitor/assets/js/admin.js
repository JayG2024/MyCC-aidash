jQuery(document).ready(function($) {
    // Auto-refresh dashboard every 60 seconds
    if ($('.mycc-fm-dashboard').length) {
        setInterval(function() {
            location.reload();
        }, 60000);
    }
    
    // Handle alert form submission
    $('#add-alert-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        formData += '&action=mycc_fm_save_alert&nonce=' + mycc_fm.nonce;
        
        $.post(mycc_fm.ajax_url, formData, function(response) {
            if (response.success) {
                alert(response.data.message);
                location.reload();
            } else {
                alert(response.data.message || mycc_fm.strings.error);
            }
        });
    });
    
    // Handle alert deletion
    $('.delete-alert').on('click', function() {
        if (!confirm(mycc_fm.strings.confirm_delete)) {
            return;
        }
        
        var alertId = $(this).data('alert-id');
        
        $.post(mycc_fm.ajax_url, {
            action: 'mycc_fm_delete_alert',
            alert_id: alertId,
            nonce: mycc_fm.nonce
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert(mycc_fm.strings.error);
            }
        });
    });
    
    // Handle alert toggle
    $('.toggle-alert').on('click', function() {
        var $button = $(this);
        var alertId = $button.data('alert-id');
        var currentlyEnabled = $button.data('enabled') == '1';
        
        // For now, just reload the page
        // In a full implementation, this would update via AJAX
        alert('Toggle functionality would be implemented here');
    });
    
    // Handle test alert
    $('.test-alert').on('click', function() {
        var formId = $('#form_id').val();
        
        if (!formId) {
            alert('Please select a form first');
            return;
        }
        
        $.post(mycc_fm.ajax_url, {
            action: 'mycc_fm_test_alert',
            form_id: formId,
            nonce: mycc_fm.nonce
        }, function(response) {
            if (response.success) {
                alert(mycc_fm.strings.test_sent);
            } else {
                alert(mycc_fm.strings.error);
            }
        });
    });
    
    // Show test button when form is selected
    $('#form_id').on('change', function() {
        if ($(this).val()) {
            $('.test-alert').show();
        } else {
            $('.test-alert').hide();
        }
    });
    
    // Handle view details
    $('.view-details').on('click', function(e) {
        e.preventDefault();
        
        var formId = $(this).data('form-id');
        var $button = $(this);
        var originalText = $button.text();
        
        // Show loading state
        $button.text('Loading...').prop('disabled', true);
        
        $.post(mycc_fm.ajax_url, {
            action: 'mycc_fm_get_form_stats',
            form_id: formId,
            nonce: mycc_fm.nonce
        }, function(response) {
            $button.text(originalText).prop('disabled', false);
            
            if (response.success) {
                showFormDetailsModal(response.data, formId);
            } else {
                alert('Error loading form details. Please try again.');
            }
        }).fail(function() {
            $button.text(originalText).prop('disabled', false);
            alert('Error loading form details. Please try again.');
        });
    });
    
    // Function to show form details modal
    function showFormDetailsModal(stats, formId) {
        // Remove any existing modal
        $('#mycc-fm-modal').remove();
        
        var statusIcon = getStatusIcon(stats.status);
        var statusClass = 'status-' + stats.status;
        
        var modalHtml = `
            <div id="mycc-fm-modal" class="mycc-fm-modal-overlay">
                <div class="mycc-fm-modal-content">
                    <div class="mycc-fm-modal-header">
                        <h2><span class="dashicons dashicons-forms"></span> ${escapeHtml(stats.title || 'Form ' + formId)}</h2>
                        <button class="mycc-fm-modal-close" type="button">
                            <span class="dashicons dashicons-no-alt"></span>
                        </button>
                    </div>
                    
                    <div class="mycc-fm-modal-body">
                        <div class="mycc-fm-stats-overview">
                            <div class="mycc-fm-status-badge ${statusClass}">
                                ${statusIcon} ${stats.status.toUpperCase()}
                            </div>
                            <div class="mycc-fm-form-id">Form ID: ${formId}</div>
                        </div>
                        
                        <div class="mycc-fm-stats-grid">
                            <div class="mycc-fm-stat-card">
                                <div class="mycc-fm-stat-icon">
                                    <span class="dashicons dashicons-clock"></span>
                                </div>
                                <div class="mycc-fm-stat-content">
                                    <h4>Last Submission</h4>
                                    <p class="mycc-fm-stat-value">${stats.last_submission_formatted || 'No data yet'}</p>
                                </div>
                            </div>
                            
                            <div class="mycc-fm-stat-card">
                                <div class="mycc-fm-stat-icon today">
                                    <span class="dashicons dashicons-calendar-alt"></span>
                                </div>
                                <div class="mycc-fm-stat-content">
                                    <h4>Today's Submissions</h4>
                                    <p class="mycc-fm-stat-value">${stats.submissions_today}</p>
                                </div>
                            </div>
                            
                            <div class="mycc-fm-stat-card">
                                <div class="mycc-fm-stat-icon">
                                    <span class="dashicons dashicons-chart-line"></span>
                                </div>
                                <div class="mycc-fm-stat-content">
                                    <h4>Avg Per Hour (24h)</h4>
                                    <p class="mycc-fm-stat-value">${stats.avg_per_hour}</p>
                                </div>
                            </div>
                            
                            <div class="mycc-fm-stat-card">
                                <div class="mycc-fm-stat-icon total">
                                    <span class="dashicons dashicons-chart-bar"></span>
                                </div>
                                <div class="mycc-fm-stat-content">
                                    <h4>Total All Time</h4>
                                    <p class="mycc-fm-stat-value">${stats.total_submissions}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mycc-fm-modal-footer">
                        <a href="admin.php?page=mycc-form-monitor-alerts&form_id=${formId}" class="button button-primary">
                            <span class="dashicons dashicons-bell"></span> Configure Alerts
                        </a>
                        <button class="button mycc-fm-modal-close">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        $('body').append(modalHtml);
        
        // Show modal with animation
        $('#mycc-fm-modal').hide().fadeIn(300);
        
        // Close modal handlers
        $('.mycc-fm-modal-close, .mycc-fm-modal-overlay').on('click', function(e) {
            if (e.target === this) {
                $('#mycc-fm-modal').fadeOut(300, function() {
                    $(this).remove();
                });
            }
        });
        
        // ESC key to close
        $(document).on('keyup.mycc-fm-modal', function(e) {
            if (e.keyCode === 27) {
                $('#mycc-fm-modal').fadeOut(300, function() {
                    $(this).remove();
                });
                $(document).off('keyup.mycc-fm-modal');
            }
        });
    }
    
    // Helper functions
    function getStatusIcon(status) {
        var icons = {
            'healthy': '<span class="dashicons dashicons-yes-alt"></span>',
            'warning': '<span class="dashicons dashicons-warning"></span>',
            'critical': '<span class="dashicons dashicons-dismiss"></span>',
            'offline': '<span class="dashicons dashicons-clock"></span>'
        };
        return icons[status] || icons['offline'];
    }
    
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Real-time status updates via AJAX
    function updateFormStatuses() {
        $('.mycc-fm-dashboard tbody tr').each(function() {
            var $row = $(this);
            var formId = $row.find('.view-details').data('form-id');
            
            if (formId) {
                $.post(mycc_fm.ajax_url, {
                    action: 'mycc_fm_get_form_status',
                    form_id: formId,
                    nonce: mycc_fm.nonce
                }, function(response) {
                    if (response.success) {
                        // Update status badge
                        var statusClass = 'status-' + response.data.status;
                        $row.find('.status-badge')
                            .removeClass('status-healthy status-warning status-critical status-offline')
                            .addClass(statusClass)
                            .text(response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1));
                        
                        // Update other stats
                        // This would update the row data in a real implementation
                    }
                });
            }
        });
    }
    
    // Update form statuses every 30 seconds
    if ($('.mycc-fm-dashboard').length) {
        setInterval(updateFormStatuses, 30000);
    }
});