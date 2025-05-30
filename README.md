# MyCC AI Dashboard

A comprehensive AI-powered dashboard for MyComputerCareer that provides data analysis, student insights, and business intelligence capabilities.

## Features

- 📊 **Data Upload & Analysis** - Support for CSV and Excel files (.csv, .xlsx, .xls)
- 🤖 **AI-Powered Insights** - OpenAI integration for intelligent data analysis
- 📈 **Visual Analytics** - Interactive charts and data visualization
- 👥 **Lead Management** - Student enrollment and lead tracking
- 📋 **Gravity Forms Integration** - WordPress form data integration
- 📱 **Responsive Design** - Mobile-friendly interface

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment

This project is configured for **Netlify** deployment:

```bash
# Deploy to Netlify (production)
npm run deploy

# Deploy preview
npm run deploy:preview
```

## Environment Variables

Create a `.env` file with:

```env
WP_API_URL=https://www.mycomputercareer.edu/wp-json
WP_CONSUMER_KEY=your_consumer_key
WP_CONSUMER_SECRET=your_consumer_secret
```

## Recent Updates

✅ **Excel File Support Added** - Now supports .xlsx and .xls files in addition to CSV  
✅ **Enhanced Error Handling** - Better user feedback for file processing  
✅ **Type Safety Improvements** - Upgraded TypeScript types  
✅ **Netlify Deployment Ready** - Full deployment configuration included  

## Deployment Instructions

### Option 1: Netlify (Recommended)

1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Set Environment Variables** in Netlify dashboard:
   - `WP_API_URL`: `https://www.mycomputercareer.edu/wp-json`
   - `WP_CONSUMER_KEY`: Your WordPress consumer key
   - `WP_CONSUMER_SECRET`: Your WordPress consumer secret
3. **Deploy**: Netlify will auto-deploy from your main branch

### Option 2: Manual Deployment

```bash
# Login to Netlify CLI
npx netlify login

# Initialize site
npx netlify init

# Deploy
npm run deploy
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **File Processing**: Papa Parse (CSV), XLSX (Excel)
- **AI Integration**: OpenAI API
- **Backend**: Netlify Functions
- **Deployment**: Netlify

## Support

For issues or questions, contact the development team.
# Cache bust
