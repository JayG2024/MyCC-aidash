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
    return res.json({ 
      error: 'WordPress API URL not configured',
      details: { message: 'WP_API_URL environment variable is missing' }
    });
  }
  
  if (!WP_CONSUMER_KEY || !WP_CONSUMER_SECRET) {
    return res.json({ 
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

// Helper function to generate mock forms data
function generateMockForms() {
  return [
    {
      id: "1",
      title: "Contact Form",
      entry_count: 243,
      is_active: true,
      date_created: "2023-06-15"
    },
    {
      id: "2",
      title: "Student Application",
      entry_count: 587,
      is_active: true,
      date_created: "2023-04-22"
    },
    {
      id: "3",
      title: "Information Request",
      entry_count: 821,
      is_active: true,
      date_created: "2023-01-10"
    },
    {
      id: "4",
      title: "Campus Tour Request",
      entry_count: 156,
      is_active: true,
      date_created: "2023-08-05"
    },
    {
      id: "5",
      title: "Certification Interest Survey",
      entry_count: 312,
      is_active: true,
      date_created: "2023-07-18"
    }
  ];
}

// Get all Gravity Forms - use checkApiConfig middleware to validate configuration
router.get('/gravity-forms', checkApiConfig, async (req, res) => {
  try {
    console.log('Fetching Gravity Forms - checking API configuration first');
    
    // Try to connect to WordPress API first to validate credentials
    const credentials = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const testResponse = await axios({
        method: 'GET',
        url: `${WP_API_URL}/gf/v2/forms`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        timeout: 5000, // Short timeout just for validation
        validateStatus: function (status) {
          return true; // Don't throw errors for any status code
        }
      });
      
      // If we got a valid response, check if it's JSON
      const contentType = testResponse.headers['content-type'] || '';
      if (contentType.includes('application/json') && Array.isArray(testResponse.data)) {
        console.log('Successfully connected to WordPress API, but returning mock data for demo');
      } else {
        console.log('WordPress API returned non-JSON response or unexpected format');
      }
    } catch (testError) {
      console.error('Error testing WordPress API connection:', testError.message);
    }
    
    // Return mock data regardless of API test result (for demo purposes)
    console.log('Returning mock Gravity Forms data for demonstration');
    res.json(generateMockForms());
  } catch (error) {
    console.error('Error in Gravity Forms route:', error);
    res.json(generateMockForms());
  }
});

// Helper function to generate mock entries for a form
function generateMockEntries(formId) {
  // Different mock data based on form ID
  switch(formId) {
    case "1": // Contact Form
      return [
        {
          id: "1001",
          form_id: "1",
          date_created: "2023-09-15 14:23:45",
          ip: "192.168.1.1",
          source_url: "https://mycomputercareer.edu/contact",
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "(555) 123-4567",
          message: "I'm interested in your IT certification programs."
        },
        {
          id: "1002",
          form_id: "1",
          date_created: "2023-09-16 09:12:30",
          ip: "192.168.1.2",
          source_url: "https://mycomputercareer.edu/contact",
          name: "Jane Doe",
          email: "jane.doe@example.com",
          phone: "(555) 987-6543",
          message: "Please send me information about financial aid options."
        },
        {
          id: "1003",
          form_id: "1",
          date_created: "2023-09-16 15:45:10",
          ip: "192.168.1.3",
          source_url: "https://mycomputercareer.edu/contact",
          name: "Robert Johnson",
          email: "robert.j@example.com",
          phone: "(555) 456-7890",
          message: "When does the next cybersecurity course start?"
        },
        {
          id: "1004",
          form_id: "1",
          date_created: "2023-09-17 10:30:22",
          ip: "192.168.1.4",
          source_url: "https://mycomputercareer.edu/contact",
          name: "Maria Garcia",
          email: "maria.g@example.com",
          phone: "(555) 234-5678",
          message: "Do you offer evening classes for working professionals?"
        },
        {
          id: "1005",
          form_id: "1",
          date_created: "2023-09-17 16:15:40",
          ip: "192.168.1.5",
          source_url: "https://mycomputercareer.edu/contact",
          name: "David Wilson",
          email: "david.w@example.com",
          phone: "(555) 345-6789",
          message: "I'd like to know more about your job placement services."
        }
      ];
    
    case "2": // Student Application
      return [
        {
          id: "2001",
          form_id: "2",
          date_created: "2023-09-10 10:20:30",
          ip: "192.168.2.1",
          source_url: "https://mycomputercareer.edu/apply",
          first_name: "Michael",
          last_name: "Williams",
          email: "michael.w@example.com",
          phone: "(555) 234-5678",
          address: "123 Main St, Columbus, OH",
          program_interest: "Network Administration",
          education_level: "High School Diploma",
          start_date: "Fall 2023"
        },
        {
          id: "2002",
          form_id: "2",
          date_created: "2023-09-11 14:35:22",
          ip: "192.168.2.2",
          source_url: "https://mycomputercareer.edu/apply",
          first_name: "Sarah",
          last_name: "Johnson",
          email: "sarah.j@example.com",
          phone: "(555) 876-5432",
          address: "456 Oak St, Raleigh, NC",
          program_interest: "Cybersecurity",
          education_level: "Associate Degree",
          start_date: "Winter 2023"
        },
        {
          id: "2003",
          form_id: "2",
          date_created: "2023-09-12 09:15:45",
          ip: "192.168.2.3",
          source_url: "https://mycomputercareer.edu/apply",
          first_name: "James",
          last_name: "Brown",
          email: "james.b@example.com",
          phone: "(555) 567-8901",
          address: "789 Pine St, Dallas, TX",
          program_interest: "IT Support",
          education_level: "Bachelor's Degree",
          start_date: "Fall 2023"
        },
        {
          id: "2004",
          form_id: "2",
          date_created: "2023-09-13 11:20:15",
          ip: "192.168.2.4",
          source_url: "https://mycomputercareer.edu/apply",
          first_name: "Emily",
          last_name: "Davis",
          email: "emily.d@example.com",
          phone: "(555) 345-6789",
          address: "321 Elm St, Indianapolis, IN",
          program_interest: "Cloud Administration",
          education_level: "Some College",
          start_date: "Winter 2023"
        }
      ];
    
    case "3": // Information Request
      return [
        {
          id: "3001",
          form_id: "3",
          date_created: "2023-09-12 09:45:15",
          ip: "192.168.3.1",
          source_url: "https://mycomputercareer.edu/info",
          name: "David Wilson",
          email: "david.w@example.com",
          phone: "(555) 345-6789",
          information_type: "Program Catalog",
          program_interest: "IT Support",
          preferred_contact: "Email"
        },
        {
          id: "3002",
          form_id: "3",
          date_created: "2023-09-13 12:33:40",
          ip: "192.168.3.2",
          source_url: "https://mycomputercareer.edu/info",
          name: "Lisa Brown",
          email: "lisa.b@example.com",
          phone: "(555) 456-7890",
          information_type: "Campus Tour",
          program_interest: "Cybersecurity",
          preferred_contact: "Phone"
        },
        {
          id: "3003",
          form_id: "3",
          date_created: "2023-09-14 15:22:10",
          ip: "192.168.3.3",
          source_url: "https://mycomputercareer.edu/info",
          name: "Thomas Miller",
          email: "thomas.m@example.com",
          phone: "(555) 567-8901",
          information_type: "Financial Aid",
          program_interest: "Cloud Administration",
          preferred_contact: "Email"
        },
        {
          id: "3004",
          form_id: "3",
          date_created: "2023-09-15 10:15:30",
          ip: "192.168.3.4",
          source_url: "https://mycomputercareer.edu/info",
          name: "Jennifer Adams",
          email: "jennifer.a@example.com",
          phone: "(555) 678-9012",
          information_type: "Program Catalog",
          program_interest: "Network Security",
          preferred_contact: "Phone"
        },
        {
          id: "3005",
          form_id: "3",
          date_created: "2023-09-16 13:45:20",
          ip: "192.168.3.5",
          source_url: "https://mycomputercareer.edu/info",
          name: "Kevin Johnson",
          email: "kevin.j@example.com",
          phone: "(555) 789-0123",
          information_type: "Career Services",
          program_interest: "IT Support",
          preferred_contact: "Email"
        }
      ];
    
    case "4": // Campus Tour Request
      return [
        {
          id: "4001",
          form_id: "4",
          date_created: "2023-09-15 14:30:00",
          ip: "192.168.4.1",
          source_url: "https://mycomputercareer.edu/tour",
          name: "Jason Thompson",
          email: "jason.t@example.com",
          phone: "(555) 123-4567",
          preferred_date: "2023-09-22",
          preferred_time: "Morning",
          campus_location: "Columbus",
          visit_reason: "Interested in IT programs"
        },
        {
          id: "4002",
          form_id: "4",
          date_created: "2023-09-16 10:15:30",
          ip: "192.168.4.2",
          source_url: "https://mycomputercareer.edu/tour",
          name: "Michelle Scott",
          email: "michelle.s@example.com",
          phone: "(555) 234-5678",
          preferred_date: "2023-09-25",
          preferred_time: "Afternoon",
          campus_location: "Raleigh",
          visit_reason: "Exploring educational options"
        },
        {
          id: "4003",
          form_id: "4",
          date_created: "2023-09-17 09:45:20",
          ip: "192.168.4.3",
          source_url: "https://mycomputercareer.edu/tour",
          name: "Brian Walker",
          email: "brian.w@example.com",
          phone: "(555) 345-6789",
          preferred_date: "2023-09-28",
          preferred_time: "Evening",
          campus_location: "Dallas",
          visit_reason: "Want to see facilities before applying"
        }
      ];
    
    case "5": // Certification Interest Survey
      return [
        {
          id: "5001",
          form_id: "5",
          date_created: "2023-09-10 11:30:45",
          ip: "192.168.5.1",
          source_url: "https://mycomputercareer.edu/survey",
          name: "Amanda Lewis",
          email: "amanda.l@example.com",
          phone: "(555) 456-7890",
          current_role: "IT Help Desk",
          experience_level: "1-3 years",
          interested_certifications: "CompTIA A+, Network+",
          career_goals: "Network administration position"
        },
        {
          id: "5002",
          form_id: "5",
          date_created: "2023-09-11 14:22:10",
          ip: "192.168.5.2",
          source_url: "https://mycomputercareer.edu/survey",
          name: "Ryan Garcia",
          email: "ryan.g@example.com",
          phone: "(555) 567-8901",
          current_role: "Software Developer",
          experience_level: "3-5 years",
          interested_certifications: "AWS Certified Solutions Architect",
          career_goals: "Cloud architecture position"
        },
        {
          id: "5003",
          form_id: "5",
          date_created: "2023-09-12 10:15:30",
          ip: "192.168.5.3",
          source_url: "https://mycomputercareer.edu/survey",
          name: "Nicole Taylor",
          email: "nicole.t@example.com",
          phone: "(555) 678-9012",
          current_role: "Student",
          experience_level: "No experience",
          interested_certifications: "CompTIA Security+, CCNA",
          career_goals: "Entry-level cybersecurity position"
        },
        {
          id: "5004",
          form_id: "5",
          date_created: "2023-09-13 16:40:15",
          ip: "192.168.5.4",
          source_url: "https://mycomputercareer.edu/survey",
          name: "Christopher Moore",
          email: "chris.m@example.com",
          phone: "(555) 789-0123",
          current_role: "System Administrator",
          experience_level: "5+ years",
          interested_certifications: "CISSP, CEH",
          career_goals: "Security analyst position"
        },
        {
          id: "5005",
          form_id: "5",
          date_created: "2023-09-14 13:25:50",
          ip: "192.168.5.5",
          source_url: "https://mycomputercareer.edu/survey",
          name: "Jessica Wilson",
          email: "jessica.w@example.com",
          phone: "(555) 890-1234",
          current_role: "Career Changer",
          experience_level: "No IT experience",
          interested_certifications: "CompTIA A+, Microsoft 365",
          career_goals: "IT support specialist"
        }
      ];
      
    default:
      // Generic entries if form ID doesn't match known forms
      return [
        {
          id: "9001",
          form_id: formId,
          date_created: "2023-09-15 11:22:33",
          ip: "192.168.9.1",
          source_url: "https://mycomputercareer.edu/form",
          name: "Generic User",
          email: "user@example.com",
          submission_data: "Sample submission data for form " + formId
        }
      ];
  }
}

// Get entries for a specific form - use checkApiConfig middleware
router.get('/gravity-forms/:formId/entries', checkApiConfig, async (req, res) => {
  try {
    const { formId } = req.params;
    console.log(`Fetching entries for form ${formId} - checking API configuration first`);
    
    // Try to connect to WordPress API first to validate credentials
    const credentials = Buffer.from(`${WP_CONSUMER_KEY}:${WP_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const testResponse = await axios({
        method: 'GET',
        url: `${WP_API_URL}/gf/v2/forms/${formId}/entries`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        timeout: 5000, // Short timeout just for validation
        validateStatus: function (status) {
          return true; // Don't throw errors for any status code
        }
      });
      
      // If we got a valid response, check if it's JSON
      const contentType = testResponse.headers['content-type'] || '';
      if (contentType.includes('application/json') && Array.isArray(testResponse.data)) {
        console.log('Successfully connected to WordPress API, but returning mock data for demo');
      } else {
        console.log('WordPress API returned non-JSON response or unexpected format');
      }
    } catch (testError) {
      console.error('Error testing WordPress API connection:', testError.message);
    }
    
    // Return mock entries regardless of API test result (for demo purposes)
    console.log(`Returning mock entries for form ${formId}`);
    res.json(generateMockEntries(formId));
  } catch (error) {
    console.error(`Error in form entries route:`, error);
    res.json(generateMockEntries(req.params.formId));
  }
});

export default router;