interface GravityFormEntry {
  id: string;
  form_id: string;
  date_created: string;
  date_updated: string;
  is_starred: string;
  is_read: string;
  ip: string;
  source_url: string;
  post_id: string;
  created_by: string;
  user_agent: string;
  status: 'active' | 'trash' | 'spam';
  [key: string]: any; // Dynamic form fields
}

interface GravityForm {
  id: string;
  title: string;
  description: string;
  labelPlacement: string;
  descriptionPlacement: string;
  button: {
    type: string;
    text: string;
  };
  fields: Array<{
    id: string;
    type: string;
    label: string;
    isRequired: boolean;
  }>;
  confirmations: any[];
  notifications: any[];
  is_active: string;
  date_created: string;
  is_trash: string;
  totalEntries?: number; // Custom field for MyCC format
}

interface GravityFormsConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

class GravityFormsAPI {
  protected config: GravityFormsConfig;
  protected baseApiUrl: string;

  constructor(config: GravityFormsConfig) {
    this.config = config;
    this.baseApiUrl = `${config.baseUrl}/wp-json/gf/v2`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseApiUrl}${endpoint}`;
    
    const credentials = btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);
    
    const defaultHeaders = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gravity Forms API Error:', error);
      throw error;
    }
  }

  async getForms(): Promise<GravityForm[]> {
    const response = await this.makeRequest('/forms');
    
    // Handle custom format from MyComputerCareer site
    if (typeof response === 'object' && !Array.isArray(response)) {
      // Convert custom object format to standard array format
      return Object.values(response).map((form: any) => ({
        id: form.id,
        title: form.title,
        description: '',
        labelPlacement: 'top_label',
        descriptionPlacement: 'below',
        button: { type: 'text', text: 'Submit' },
        fields: [],
        confirmations: [],
        notifications: [],
        is_active: '1',
        date_created: new Date().toISOString(),
        is_trash: '0',
        totalEntries: parseInt(form.entries) || 0
      }));
    }
    
    // Standard format (array)
    return response;
  }

  async getForm(formId: string): Promise<GravityForm> {
    return this.makeRequest(`/forms/${formId}`);
  }

  async getFormEntries(formId: string, params: {
    page?: number;
    page_size?: number;
    sorting?: {
      key: string;
      direction: 'ASC' | 'DESC';
    };
    search?: {
      field_filters: Array<{
        key: string;
        value: string;
        operator?: string;
      }>;
    };
  } = {}): Promise<{
    total_count: number;
    entries: GravityFormEntry[];
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('paging[page_size]', params.page_size?.toString() || '20');
    if (params.page) queryParams.append('paging[current_page]', params.page.toString());
    if (params.sorting) {
      queryParams.append('sorting[key]', params.sorting.key);
      queryParams.append('sorting[direction]', params.sorting.direction);
    }

    const endpoint = `/forms/${formId}/entries${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getAllRecentEntries(hoursBack: number = 24): Promise<GravityFormEntry[]> {
    const forms = await this.getForms();
    const allEntries: GravityFormEntry[] = [];
    const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    for (const form of forms) {
      try {
        const response = await this.getFormEntries(form.id, {
          page: 1,
          page_size: 100,
          sorting: {
            key: 'date_created',
            direction: 'DESC'
          }
        });

        // Filter entries by date
        const recentEntries = response.entries.filter(entry => 
          new Date(entry.date_created) >= cutoffDate
        );

        allEntries.push(...recentEntries);
      } catch (error) {
        console.error(`Error fetching entries for form ${form.id}:`, error);
      }
    }

    return allEntries.sort((a, b) => 
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  }

  async getFormStats(formId: string, hoursBack: number = 24) {
    const response = await this.getFormEntries(formId, {
      page: 1,
      page_size: 1000,
      sorting: {
        key: 'date_created',
        direction: 'DESC'
      }
    });

    const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const recentEntries = response.entries.filter(entry => 
      new Date(entry.date_created) >= cutoffDate
    );

    const stats = {
      total: recentEntries.length,
      successful: recentEntries.filter(e => e.status === 'active').length,
      spam: recentEntries.filter(e => e.status === 'spam').length,
      lastSubmission: recentEntries.length > 0 ? recentEntries[0].date_created : null,
      avgPerHour: recentEntries.length / hoursBack,
      entries: recentEntries
    };

    return stats;
  }
}

// Configuration manager that checks localStorage first, then environment variables
function getAPIConfig(): GravityFormsConfig {
  try {
    const savedConfig = localStorage.getItem('gravityFormsConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.baseUrl && parsed.consumerKey && parsed.consumerSecret) {
        console.log('📋 Using saved API configuration from localStorage');
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error loading saved API config:', error);
  }

  // Fallback to environment variables
  const envConfig = {
    baseUrl: process.env.REACT_APP_WORDPRESS_URL || 'https://www.mycomputercareer.edu',
    consumerKey: process.env.REACT_APP_GF_CONSUMER_KEY || '',
    consumerSecret: process.env.REACT_APP_GF_CONSUMER_SECRET || ''
  };

  console.log('🔧 Using environment configuration:', {
    baseUrl: envConfig.baseUrl,
    hasConsumerKey: !!envConfig.consumerKey,
    hasConsumerSecret: !!envConfig.consumerSecret
  });

  return envConfig;
}

// Function to update API configuration
export function updateAPIConfig(config: GravityFormsConfig) {
  localStorage.setItem('gravityFormsConfig', JSON.stringify(config));
  // Recreate the API instance with new config
  gravityFormsAPI.updateConfig(config);
}

class GravityFormsAPIManager extends GravityFormsAPI {
  updateConfig(config: GravityFormsConfig) {
    this.config = config;
    this.baseApiUrl = `${config.baseUrl}/wp-json/gf/v2`;
  }
}

export const gravityFormsAPI = new GravityFormsAPIManager(getAPIConfig());
export type { GravityForm, GravityFormEntry, GravityFormsConfig };