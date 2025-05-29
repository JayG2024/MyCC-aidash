import express from 'express';
import axios from 'axios';
const router = express.Router();

// WordPress API configuration
let WP_API_URL = process.env.WP_API_URL;
const WP_CONSUMER_KEY = process.env.WP_CONSUMER_KEY;
const WP_CONSUMER_SECRET = process.env.WP_CONSUMER_SECRET;

// Ensure API URL is properly formatted
if (WP_API_URL) {
  // Remove trailing slash if present
  WP_API_URL = WP_API_URL.replace(/\/$/, '');
  
  // Make sure we have "/wp-json" in the URL
  if (!WP_API_URL.endsWith('/wp-json')) {
    // If the URL doesn't already have "/wp-json", add it
    WP_API_URL = WP_API_URL + '/wp-json';
  }
}

// Debug info on startup
console.log('Gravity Forms Proxy Configuration:');
console.log('API URL:', WP_API_URL);
console.log('Consumer Key configured:', !!WP_CONSUMER_KEY);
console.log('Consumer Secret configured:', !!WP_CONSUMER_SECRET);

// Middleware to check if WordPress API is configured
const checkApiConfig = (req, res, next) => {
  if (!WP_API_URL) {
    return res.status(500).json({ 
      error: 'WordPress API URL not configured',
      details: { message: 'WP_API_URL environment variable is missing' }
    });
  }
  
  if (!WP_CONSUMER_KEY || !WP_CONSUMER_SECRET) {
    return res.status(500).json({ 
      error: 'WordPress API credentials not configured',
      details: { 
        message: 'API credentials missing', 
        consumer_key_set: !!WP_CONSUMER_KEY,
        consumer_secret_set: !!WP_CONSUMER_SECRET
      }
    });
  }
  
  next();
};

// Get all Gravity Forms
router.get('/gravity-forms', checkApiConfig, async (req, res) => {
  try {
    console.log('Fetching Gravity Forms from WordPress API');
    
    const credentials = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await axios({
        method: 'GET',
        url: `${WP_API_URL}/gf/v2/forms`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        timeout: 10000
      });
      
      // Transform the response to match our expected format if needed
      const forms = response.data.map(form => ({
        id: form.id.toString(),
        title: form.title,
        entry_count: form.entries || 0,
        is_active: form.is_active || true,
        date_created: form.date_created || new Date().toISOString().split('T')[0]
      }));
      
      res.json(forms);
    } catch (error) {
      console.error('Error fetching Gravity Forms:', error.message);
      
      // Provide detailed error information
      res.status(500).json({ 
        error: 'Failed to fetch forms from WordPress API',
        details: {
          message: error.message,
          response: error.response?.data || null,
          status: error.response?.status || null
        }
      });
    }
  } catch (error) {
    console.error('Error in Gravity Forms route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get entries for a specific form
router.get('/gravity-forms/:formId/entries', checkApiConfig, async (req, res) => {
  try {
    const { formId } = req.params;
    console.log(`Fetching entries for form ${formId} from WordPress API`);
    
    const credentials = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await axios({
        method: 'GET',
        url: `${WP_API_URL}/gf/v2/forms/${formId}/entries`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        timeout: 10000
      });
      
      // Return the entries from the API
      res.json(response.data);
    } catch (error) {
      console.error(`Error fetching entries for form ${formId}:`, error.message);
      
      // Provide detailed error information
      res.status(500).json({ 
        error: `Failed to fetch entries for form ${formId}`,
        details: {
          message: error.message,
          response: error.response?.data || null,
          status: error.response?.status || null
        }
      });
    }
  } catch (error) {
    console.error(`Error in form entries route:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;