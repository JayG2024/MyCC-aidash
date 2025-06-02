interface FormBackupEntry {
  id: string;
  formId: string;
  formTitle: string;
  sessionId: string;
  timestamp: string;
  lastUpdated: string;
  fieldData: Record<string, any>;
  isSubmitted: boolean;
  submissionAttempted: boolean;
  userAgent: string;
  ip: string;
  referrer: string;
  timeOnPage: number;
  completionPercentage: number;
  status: 'active' | 'abandoned' | 'submitted' | 'failed';
}

interface FormFieldInfo {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  value: any;
  isEmpty: boolean;
}

class FormBackupService {
  private backupEntries: FormBackupEntry[] = [];
  private activeTracking: Map<string, FormBackupEntry> = new Map();
  private saveInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'mycc_form_backups';
  private readonly SAVE_INTERVAL = 10000; // Save every 10 seconds

  constructor() {
    this.loadFromStorage();
    this.startPeriodicSave();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.backupEntries = JSON.parse(stored);
        console.log(`📦 Loaded ${this.backupEntries.length} form backup entries`);
      }
    } catch (error) {
      console.error('Error loading form backups from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.backupEntries));
    } catch (error) {
      console.error('Error saving form backups to storage:', error);
    }
  }

  private startPeriodicSave() {
    this.saveInterval = setInterval(() => {
      this.saveToStorage();
      this.cleanupOldEntries();
    }, this.SAVE_INTERVAL);
  }

  private cleanupOldEntries() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const initialCount = this.backupEntries.length;
    
    this.backupEntries = this.backupEntries.filter(entry => 
      new Date(entry.timestamp).getTime() > sevenDaysAgo
    );

    if (this.backupEntries.length < initialCount) {
      console.log(`🧹 Cleaned up ${initialCount - this.backupEntries.length} old form backup entries`);
    }
  }

  // Generate the JavaScript code to be embedded on MyComputerCareer website
  generateTrackingScript(config: {
    dashboardUrl: string;
    apiKey: string;
    formsToTrack: string[];
  }): string {
    return `
<!-- MyComputerCareer Form Backup System -->
<script>
(function() {
  const MYCC_FORM_BACKUP = {
    config: ${JSON.stringify(config)},
    sessionId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    trackedForms: new Map(),
    lastDashboardSave: 0,
    saveTimeout: null,
    pendingChanges: false,
    
    init: function() {
      console.log('🔐 MyCC Form Backup System initialized');
      this.trackAllForms();
      this.setupBeforeUnloadHandler();
    },
    
    trackAllForms: function() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const formId = this.getFormId(form);
        if (this.config.formsToTrack.includes(formId) || this.config.formsToTrack.includes('*')) {
          this.trackForm(form, formId);
        }
      });
    },
    
    getFormId: function(form) {
      return form.id || 
             form.getAttribute('data-form-id') ||
             form.className.match(/gform_wrapper_([0-9]+)/)?.[1] ||
             'unknown';
    },
    
    trackForm: function(form, formId) {
      console.log(\`📝 Tracking form: \${formId}\`);
      
      const entry = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        formId: formId,
        formTitle: this.getFormTitle(form),
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        fieldData: {},
        isSubmitted: false,
        submissionAttempted: false,
        userAgent: navigator.userAgent,
        ip: 'unknown', // Will be determined server-side
        referrer: document.referrer,
        timeOnPage: 0,
        completionPercentage: 0,
        status: 'active'
      };
      
      this.trackedForms.set(formId, entry);
      
      // Track all form fields
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        this.trackField(field, entry);
      });
      
      // Track form submission
      form.addEventListener('submit', (e) => {
        entry.submissionAttempted = true;
        entry.status = 'submitted';
        entry.lastUpdated = new Date().toISOString();
        this.saveEntry(entry);
        console.log(\`✅ Form \${formId} submitted\`);
      });
      
      // Initial save
      this.saveEntry(entry);
    },
    
    trackField: function(field, entry) {
      const fieldInfo = this.getFieldInfo(field);
      
      // Save initial state
      entry.fieldData[fieldInfo.name] = {
        ...fieldInfo,
        firstFilled: null,
        lastModified: null,
        changeCount: 0
      };
      
      // Track field changes
      const updateField = () => {
        const updatedInfo = this.getFieldInfo(field);
        const fieldData = entry.fieldData[fieldInfo.name];
        
        if (updatedInfo.value !== fieldData.value) {
          fieldData.value = updatedInfo.value;
          fieldData.isEmpty = updatedInfo.isEmpty;
          fieldData.lastModified = new Date().toISOString();
          fieldData.changeCount++;
          
          if (!fieldData.firstFilled && !updatedInfo.isEmpty) {
            fieldData.firstFilled = new Date().toISOString();
          }
          
          entry.lastUpdated = new Date().toISOString();
          entry.completionPercentage = this.calculateCompletion(entry);
          
          // Smart save: Only backup when we have valuable contact data
          if (this.hasValuableData(entry)) {
            this.pendingChanges = true;
            
            // Debounced save after contact info is entered
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
              this.saveEntryLocal(entry);
              console.log(\`💾 Smart backup: \${entry.formTitle} (has contact info)\`);
            }, 3000); // Save 3 seconds after contact info entered
          }
        }
      };
      
      field.addEventListener('input', updateField);
      field.addEventListener('change', updateField);
      field.addEventListener('blur', updateField);
    },
    
    getFieldInfo: function(field) {
      const value = field.type === 'checkbox' ? field.checked : field.value;
      return {
        id: field.id,
        name: field.name || field.id,
        type: field.type,
        label: this.getFieldLabel(field),
        required: field.required,
        value: value,
        isEmpty: !value || value === ''
      };
    },
    
    getFieldLabel: function(field) {
      const label = document.querySelector(\`label[for="\${field.id}"]\`);
      return label ? label.textContent.trim() : field.placeholder || field.name;
    },
    
    getFormTitle: function(form) {
      const title = form.querySelector('h1, h2, h3, .gform_title, .form-title');
      return title ? title.textContent.trim() : \`Form \${this.getFormId(form)}\`;
    },
    
    calculateCompletion: function(entry) {
      const fields = Object.values(entry.fieldData);
      if (fields.length === 0) return 0;
      
      const filledFields = fields.filter(field => !field.isEmpty);
      return Math.round((filledFields.length / fields.length) * 100);
    },
    
    // Smart backup trigger: Only save when we have valuable contact information
    hasValuableData: function(entry) {
      const fields = entry.fieldData;
      let hasEmail = false;
      let hasName = false;
      let hasOtherInfo = false;
      
      for (const [key, field] of Object.entries(fields)) {
        if (!field.isEmpty) {
          // Check for email
          if (field.type === 'email' || 
              key.toLowerCase().includes('email') ||
              (typeof field.value === 'string' && field.value.includes('@'))) {
            hasEmail = true;
          }
          
          // Check for name
          if (key.toLowerCase().includes('name') || 
              key.toLowerCase().includes('first') || 
              key.toLowerCase().includes('last')) {
            hasName = true;
          }
          
          // Check for other valuable info (phone, company, etc.)
          if (field.type === 'tel' || 
              key.toLowerCase().includes('phone') ||
              key.toLowerCase().includes('company') ||
              key.toLowerCase().includes('organization')) {
            hasOtherInfo = true;
          }
        }
      }
      
      // Only backup if we have email + (name OR other contact info)
      return hasEmail && (hasName || hasOtherInfo);
    },
    
    saveEntry: function(entry) {
      // Save locally first
      try {
        const stored = JSON.parse(localStorage.getItem('mycc_form_backups') || '[]');
        const existingIndex = stored.findIndex(e => e.id === entry.id);
        
        if (existingIndex >= 0) {
          stored[existingIndex] = entry;
        } else {
          stored.push(entry);
        }
        
        localStorage.setItem('mycc_form_backups', JSON.stringify(stored));
        console.log(\`💾 Saved form backup: \${entry.formTitle} (\${entry.completionPercentage}% complete)\`);
      } catch (error) {
        console.error('Error saving form backup locally:', error);
      }
      
      // Send to dashboard API (when available)
      this.sendToDashboard(entry);
    },
    
    sendToDashboard: function(entry) {
      // This would send the backup to the monitoring dashboard
      fetch(\`\${this.config.dashboardUrl}/api/form-backup\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.config.apiKey}\`
        },
        body: JSON.stringify(entry)
      }).catch(error => {
        console.log('Dashboard not available, backup saved locally only');
      });
    },
    
    // Lightweight local-only save (no network requests)
    saveEntryLocal: function(entry) {
      try {
        const stored = JSON.parse(localStorage.getItem('mycc_form_backups') || '[]');
        const existingIndex = stored.findIndex(e => e.id === entry.id);
        
        if (existingIndex >= 0) {
          stored[existingIndex] = entry;
        } else {
          stored.push(entry);
        }
        
        // Limit local storage to last 50 entries to prevent bloat
        if (stored.length > 50) {
          stored.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
          stored.splice(50);
        }
        
        localStorage.setItem('mycc_form_backups', JSON.stringify(stored));
        this.pendingChanges = false;
      } catch (error) {
        console.warn('Local backup failed (storage full?):', error);
      }
    },
    
    // Throttled dashboard sync (max once per 30 seconds)
    syncToDashboard: function() {
      if (!this.pendingChanges || Date.now() - this.lastDashboardSave < 30000) {
        return;
      }
      
      this.trackedForms.forEach(entry => {
        if (entry.status === 'active' && this.pendingChanges) {
          this.sendToDashboard(entry);
        }
      });
      
      this.lastDashboardSave = Date.now();
    },
    
    setupBeforeUnloadHandler: function() {
      window.addEventListener('beforeunload', () => {
        // Mark incomplete forms as abandoned
        this.trackedForms.forEach(entry => {
          if (!entry.isSubmitted && !entry.submissionAttempted) {
            entry.status = 'abandoned';
            entry.timeOnPage = Date.now() - new Date(entry.timestamp).getTime();
            this.saveEntry(entry);
          }
        });
      });
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      MYCC_FORM_BACKUP.init();
      // Sync to dashboard every 60 seconds (low frequency)
      setInterval(() => MYCC_FORM_BACKUP.syncToDashboard(), 60000);
    });
  } else {
    MYCC_FORM_BACKUP.init();
    // Sync to dashboard every 60 seconds (low frequency)
    setInterval(() => MYCC_FORM_BACKUP.syncToDashboard(), 60000);
  }
  
  // Expose for debugging
  window.MYCC_FORM_BACKUP = MYCC_FORM_BACKUP;
})();
</script>`;
  }

  // Methods for the dashboard to manage backup data
  getAllBackups(): FormBackupEntry[] {
    return [...this.backupEntries].sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  getBackupsByForm(formId: string): FormBackupEntry[] {
    return this.backupEntries.filter(entry => entry.formId === formId);
  }

  getAbandonedForms(hoursBack: number = 24): FormBackupEntry[] {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    return this.backupEntries.filter(entry => 
      entry.status === 'abandoned' && 
      new Date(entry.timestamp).getTime() > cutoff &&
      entry.completionPercentage > 20 // Only include partially filled forms
    );
  }

  getFailedSubmissions(hoursBack: number = 24): FormBackupEntry[] {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    return this.backupEntries.filter(entry => 
      entry.status === 'failed' &&
      new Date(entry.timestamp).getTime() > cutoff
    );
  }

  exportBackupData(formId?: string, format: 'json' | 'csv' = 'json'): string {
    const data = formId ? this.getBackupsByForm(formId) : this.getAllBackups();
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return JSON.stringify(data, null, 2);
  }

  private convertToCSV(data: FormBackupEntry[]): string {
    if (data.length === 0) return '';
    
    const headers = [
      'ID', 'Form ID', 'Form Title', 'Timestamp', 'Status', 
      'Completion %', 'Email', 'Name', 'Phone', 'Submitted'
    ];
    
    const rows = data.map(entry => {
      const email = this.extractEmail(entry.fieldData);
      const name = this.extractName(entry.fieldData);
      const phone = this.extractPhone(entry.fieldData);
      
      return [
        entry.id,
        entry.formId,
        entry.formTitle,
        entry.timestamp,
        entry.status,
        entry.completionPercentage,
        email,
        name,
        phone,
        entry.isSubmitted
      ];
    });
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  private extractEmail(fieldData: Record<string, any>): string {
    for (const [key, field] of Object.entries(fieldData)) {
      if (field.type === 'email' || 
          key.toLowerCase().includes('email') ||
          (typeof field.value === 'string' && field.value.includes('@'))) {
        return field.value || '';
      }
    }
    return '';
  }

  private extractName(fieldData: Record<string, any>): string {
    const nameFields = [];
    for (const [key, field] of Object.entries(fieldData)) {
      if (key.toLowerCase().includes('name') && field.value) {
        nameFields.push(field.value);
      }
    }
    return nameFields.join(' ');
  }

  private extractPhone(fieldData: Record<string, any>): string {
    for (const [key, field] of Object.entries(fieldData)) {
      if (field.type === 'tel' || 
          key.toLowerCase().includes('phone') ||
          key.toLowerCase().includes('tel')) {
        return field.value || '';
      }
    }
    return '';
  }

  // Receive backup data from website tracking script
  receiveBackupData(entry: FormBackupEntry): void {
    const existingIndex = this.backupEntries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      this.backupEntries[existingIndex] = entry;
    } else {
      this.backupEntries.push(entry);
    }
    
    this.saveToStorage();
    console.log(`📥 Received form backup: ${entry.formTitle} (${entry.completionPercentage}% complete)`);
  }

  getBackupStats() {
    const total = this.backupEntries.length;
    const abandoned = this.backupEntries.filter(e => e.status === 'abandoned').length;
    const submitted = this.backupEntries.filter(e => e.status === 'submitted').length;
    const failed = this.backupEntries.filter(e => e.status === 'failed').length;
    
    return {
      total,
      abandoned,
      submitted,
      failed,
      recoverable: this.backupEntries.filter(e => 
        e.status === 'abandoned' && e.completionPercentage > 50
      ).length
    };
  }
}

export const formBackupService = new FormBackupService();
export type { FormBackupEntry, FormFieldInfo };