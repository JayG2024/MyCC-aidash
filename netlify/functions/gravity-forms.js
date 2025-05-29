const axios = require('axios');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { path, method, data } = JSON.parse(event.body || '{}');
    
    const WP_API_URL = process.env.WP_API_URL || 'https://www.mycomputercareer.edu/wp-json';
    const WP_CONSUMER_KEY = process.env.WP_CONSUMER_KEY;
    const WP_CONSUMER_SECRET = process.env.WP_CONSUMER_SECRET;

    if (!WP_CONSUMER_KEY || !WP_CONSUMER_SECRET) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'WordPress API credentials not configured' })
      };
    }

    const config = {
      method: method || 'GET',
      url: `${WP_API_URL}${path}`,
      auth: {
        username: WP_CONSUMER_KEY,
        password: WP_CONSUMER_SECRET
      }
    };

    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }

    const response = await axios(config);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error('WordPress API Error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: 'WordPress API request failed',
        details: error.response?.data || error.message
      })
    };
  }
};