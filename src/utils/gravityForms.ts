import { useState, useEffect } from 'react';

interface WordPressAuth {
  restUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

interface GravityForm {
  id: string;
  title: string;
  entry_count: number;
}

interface GravityFormEntry {
  id: string;
  [key: string]: any;
}

const API_CONFIG: WordPressAuth = {
  restUrl: import.meta.env.VITE_WP_API_URL || '',
  consumerKey: import.meta.env.VITE_WP_CONSUMER_KEY || '',
  consumerSecret: import.meta.env.VITE_WP_CONSUMER_SECRET || '',
};

export const useGravityForms = () => {
  const [forms, setForms] = useState<GravityForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    if (!API_CONFIG.restUrl) {
      setError('WordPress API URL not configured');
      return;
    }

    setLoading(true);
    try {
      // For OAuth1.0a authentication with WordPress
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = generateNonce();
      
      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      });

      // Add OAuth parameters
      if (API_CONFIG.consumerKey && API_CONFIG.consumerSecret) {
        headers.append('Authorization', `Basic ${btoa(`${API_CONFIG.consumerKey}:${API_CONFIG.consumerSecret}`)}`);
      }

      const response = await fetch(`${API_CONFIG.restUrl}/gf/v2/forms`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setForms(data.map((form: any) => ({
        id: form.id,
        title: form.title,
        entry_count: form.entries || 0,
      })));
    } catch (err) {
      console.error('Error fetching Gravity Forms:', err);
      setError('Failed to fetch forms from WordPress');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormEntries = async (formId: string) => {
    if (!API_CONFIG.restUrl) {
      setError('WordPress API URL not configured');
      return [];
    }

    setLoading(true);
    try {
      const nonce = generateNonce();
      
      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      });

      // Add OAuth parameters
      if (API_CONFIG.consumerKey && API_CONFIG.consumerSecret) {
        headers.append('Authorization', `Basic ${btoa(`${API_CONFIG.consumerKey}:${API_CONFIG.consumerSecret}`)}`);
      }

      const response = await fetch(`${API_CONFIG.restUrl}/gf/v2/forms/${formId}/entries`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.entries || [];
    } catch (err) {
      console.error(`Error fetching entries for form ${formId}:`, err);
      setError(`Failed to fetch entries for form ${formId}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate a random nonce for WordPress REST API
  const generateNonce = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  return {
    forms,
    loading,
    error,
    fetchForms,
    fetchFormEntries,
  };
};