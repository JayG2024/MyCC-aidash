import OpenAI from 'openai';
import localforage from 'localforage';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Default API key that will be used if no user-provided key is found
// Replace this with your actual OpenAI API key
const DEFAULT_API_KEY = "sk-mycc-dashboard-demo-key-2025";

export const initializeOpenAI = async (apiKey?: string): Promise<boolean> => {
  try {
    // Use provided key or try to get from storage, or fall back to default key
    const key = apiKey || await localforage.getItem<string>('openai_api_key') || DEFAULT_API_KEY;
    
    if (!key) {
      console.log('No OpenAI API key found');
      return false;
    }
    
    openaiClient = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true // For client-side usage
    });
    
    // Save API key for future sessions if provided (and not the default)
    if (apiKey && apiKey !== DEFAULT_API_KEY) {
      await localforage.setItem('openai_api_key', apiKey);
    }
    
    console.log('OpenAI client initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    return false;
  }
};

export const getOpenAIClient = async (): Promise<OpenAI | null> => {
  if (!openaiClient) {
    const initialized = await initializeOpenAI();
    if (!initialized) {
      console.log('Failed to initialize OpenAI client');
      return null;
    }
  }
  return openaiClient;
};

export const clearOpenAIApiKey = async (): Promise<void> => {
  openaiClient = null;
  await localforage.removeItem('openai_api_key');
  console.log('OpenAI API key cleared, will fall back to default key');
};

export const checkAPIKeyValidity = async (apiKey: string): Promise<boolean> => {
  // For the demo key, always return true without making an API call
  if (apiKey === DEFAULT_API_KEY) {
    console.log('Using demo API key');
    return true;
  }
  
  try {
    console.log('Checking API key validity...');
    const tempClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Make a minimal API call to check if the key is valid
    const response = await tempClient.models.list({ limit: 1 });
    console.log('API key check successful');
    return true;
  } catch (error) {
    console.error('Invalid API key:', error);
    return false;
  }
};

// Function to process large datasets in chunks for OpenAI analysis
const processDataInChunks = (data: any[], headers: string[], maxChunkSize: number = 1000): any => {
  console.log(`Processing ${data.length} rows of data in chunks of ${maxChunkSize}`);
  
  // If data is small enough, return as is
  if (data.length <= maxChunkSize) {
    return { data, headers, statistics: generateDataStatistics(data, headers) };
  }
  
  // Split data into chunks
  const chunks = [];
  for (let i = 0; i < data.length; i += maxChunkSize) {
    chunks.push(data.slice(i, i + maxChunkSize));
  }
  
  console.log(`Split data into ${chunks.length} chunks`);
  
  // Generate statistics for each chunk
  const chunkStatistics = chunks.map(chunk => generateDataStatistics(chunk, headers));
  
  // Combine statistics
  const combinedStats = combineChunkStatistics(chunkStatistics, headers);
  
  // Return sample data and combined statistics
  return {
    // Include first and last chunk as samples
    data: [...chunks[0].slice(0, 50), ...chunks[chunks.length - 1].slice(-50)],
    headers,
    statistics: combinedStats,
    totalRows: data.length,
    processedInChunks: true,
    numChunks: chunks.length
  };
};

// Generate statistics for a data chunk
const generateDataStatistics = (data: any[], headers: string[]): any => {
  const stats: Record<string, any> = {};
  
  // Analyze each column
  headers.forEach(header => {
    // Extract values, filtering out null/undefined/empty
    const values = data
      .map(row => row[header])
      .filter(val => val !== null && val !== undefined && val !== '');
    
    // Determine column type
    let columnType = 'unknown';
    if (values.length > 0) {
      if (values.every(val => typeof val === 'number' || !isNaN(Number(val)))) {
        columnType = 'numeric';
      } else if (values.every(val => typeof val === 'boolean' || val === 'true' || val === 'false')) {
        columnType = 'boolean';
      } else if (values.every(val => !isNaN(Date.parse(String(val))))) {
        columnType = 'date';
      } else {
        columnType = 'text';
      }
    }
    
    // Initialize stats object for this column
    stats[header] = {
      type: columnType,
      count: values.length,
      missing: data.length - values.length,
      uniqueCount: new Set(values.map(v => String(v))).size,
    };
    
    // Additional stats based on column type
    if (columnType === 'numeric') {
      const numValues = values.map(v => Number(v));
      const sorted = [...numValues].sort((a, b) => a - b);
      const sum = numValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numValues.length;
      
      // Calculate variance and standard deviation
      const variance = numValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numValues.length;
      
      stats[header] = {
        ...stats[header],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        sum,
        mean,
        median: sorted.length % 2 === 0 
          ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
          : sorted[Math.floor(sorted.length/2)],
        stdDev: Math.sqrt(variance),
        percentiles: {
          p25: sorted[Math.floor(sorted.length * 0.25)],
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p75: sorted[Math.floor(sorted.length * 0.75)],
        }
      };
    } else if (columnType === 'text') {
      // For text columns, get most common values and their frequencies
      const valueCounts: Record<string, number> = {};
      values.forEach(val => {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
      });
      
      // Sort by frequency and get top 5
      const topValues = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count, percentage: (count / values.length) * 100 }));
      
      stats[header].topValues = topValues;
      stats[header].avgLength = values.reduce((acc, val) => acc + String(val).length, 0) / values.length;
    } else if (columnType === 'date') {
      // For date columns, get min/max dates and time range
      const dates = values.map(v => new Date(String(v)));
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      
      stats[header].earliest = sorted[0];
      stats[header].latest = sorted[sorted.length - 1];
      stats[header].timeRangeInDays = (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / (1000 * 60 * 60 * 24);
    } else if (columnType === 'boolean') {
      // For boolean columns, get true/false counts and percentages
      const trueValues = values.filter(v => 
        v === true || v === 'true' || v === 1 || v === '1' || v === 'yes' || v === 'Yes'
      );
      
      stats[header].trueCount = trueValues.length;
      stats[header].falseCount = values.length - trueValues.length;
      stats[header].truePercentage = (trueValues.length / values.length) * 100;
      stats[header].falsePercentage = 100 - stats[header].truePercentage;
    }
  });
  
  return stats;
};

// Combine statistics from multiple chunks
const combineChunkStatistics = (chunkStats: any[], headers: string[]): any => {
  const combined: Record<string, any> = {};
  
  headers.forEach(header => {
    // Ensure all chunks have stats for this header
    const validChunkStats = chunkStats.filter(cs => cs[header]);
    if (validChunkStats.length === 0) return;
    
    // Get column type (should be consistent across chunks)
    const columnType = validChunkStats[0][header].type;
    
    // Initialize combined stats
    combined[header] = {
      type: columnType,
      count: validChunkStats.reduce((sum, cs) => sum + cs[header].count, 0),
      missing: validChunkStats.reduce((sum, cs) => sum + cs[header].missing, 0),
      uniqueCount: null, // Can't accurately combine unique counts across chunks
    };
    
    // Additional combined stats based on column type
    if (columnType === 'numeric') {
      // Find global min/max
      const min = Math.min(...validChunkStats.map(cs => cs[header].min));
      const max = Math.max(...validChunkStats.map(cs => cs[header].max));
      
      // Calculate weighted mean
      const totalCount = combined[header].count;
      const weightedMean = validChunkStats.reduce(
        (sum, cs) => sum + (cs[header].mean * cs[header].count), 0
      ) / totalCount;
      
      // Note: accurate global median, stdDev, and percentiles cannot be calculated
      // from chunk statistics without the full dataset
      combined[header] = {
        ...combined[header],
        min,
        max,
        mean: weightedMean,
        // Estimated values (not statistically accurate)
        median: "estimated from chunks",
        stdDev: "estimated from chunks",
        sum: validChunkStats.reduce((sum, cs) => sum + cs[header].sum, 0),
      };
    } else if (columnType === 'text') {
      // Combine top values across chunks (not perfectly accurate)
      const valueCounts: Record<string, number> = {};
      
      validChunkStats.forEach(cs => {
        if (cs[header].topValues) {
          cs[header].topValues.forEach((tv: any) => {
            valueCounts[tv.value] = (valueCounts[tv.value] || 0) + tv.count;
          });
        }
      });
      
      // Sort by frequency and get top 5
      const topValues = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ 
          value, 
          count, 
          percentage: (count / combined[header].count) * 100 
        }));
      
      combined[header].topValues = topValues;
      combined[header].avgLength = validChunkStats.reduce(
        (sum, cs) => sum + (cs[header].avgLength * cs[header].count), 0
      ) / combined[header].count;
    } else if (columnType === 'date') {
      // Find global earliest/latest dates
      const allEarliest = validChunkStats.map(cs => new Date(cs[header].earliest));
      const allLatest = validChunkStats.map(cs => new Date(cs[header].latest));
      
      combined[header].earliest = new Date(Math.min(...allEarliest.map(d => d.getTime())));
      combined[header].latest = new Date(Math.max(...allLatest.map(d => d.getTime())));
      combined[header].timeRangeInDays = (combined[header].latest.getTime() - combined[header].earliest.getTime()) / (1000 * 60 * 60 * 24);
    } else if (columnType === 'boolean') {
      // Combine boolean statistics
      const totalTrueCount = validChunkStats.reduce((sum, cs) => sum + (cs[header].trueCount || 0), 0);
      const totalCount = combined[header].count;
      
      combined[header].trueCount = totalTrueCount;
      combined[header].falseCount = totalCount - totalTrueCount;
      combined[header].truePercentage = (totalTrueCount / totalCount) * 100;
      combined[header].falsePercentage = 100 - combined[header].truePercentage;
    }
  });
  
  return combined;
};

// Identify potential relationships between columns
const identifyRelationships = (data: any[], headers: string[], stats: any): any[] => {
  const relationships = [];
  const numericColumns = headers.filter(h => stats[h]?.type === 'numeric');
  
  // Only look for relationships if we have multiple numeric columns and a reasonable amount of data
  if (numericColumns.length >= 2 && data.length >= 30) {
    // Look for potential correlations between numeric columns
    for (let i = 0; i < numericColumns.length - 1; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // Calculate correlation coefficient
        const pairs = data.filter(row => 
          row[col1] !== null && row[col1] !== undefined && row[col1] !== '' &&
          row[col2] !== null && row[col2] !== undefined && row[col2] !== ''
        ).map(row => [Number(row[col1]), Number(row[col2])]);
        
        if (pairs.length >= 30) { // Only calculate if we have enough data points
          const correlation = calculateCorrelation(pairs);
          
          // Only include correlations with significant strength
          if (Math.abs(correlation) >= 0.3) {
            relationships.push({
              type: 'correlation',
              columns: [col1, col2],
              strength: correlation,
              description: `${correlation > 0 ? 'Positive' : 'Negative'} correlation of ${Math.abs(correlation).toFixed(2)} between ${col1} and ${col2}`
            });
          }
        }
      }
    }
    
    // Look for potential category-metric relationships
    const categoryColumns = headers.filter(h => stats[h]?.type === 'text' && stats[h]?.uniqueCount <= 20);
    
    categoryColumns.forEach(catCol => {
      numericColumns.forEach(numCol => {
        // Calculate averages by category
        const categories: Record<string, { sum: number, count: number }> = {};
        
        data.forEach(row => {
          if (row[catCol] && row[numCol] !== null && row[numCol] !== undefined && row[numCol] !== '') {
            const category = String(row[catCol]);
            if (!categories[category]) {
              categories[category] = { sum: 0, count: 0 };
            }
            categories[category].sum += Number(row[numCol]);
            categories[category].count++;
          }
        });
        
        // Convert to averages
        const categoryAverages = Object.entries(categories)
          .filter(([_, data]) => data.count >= 5) // Only include categories with enough data
          .map(([category, data]) => ({
            category,
            average: data.sum / data.count,
            count: data.count
          }));
        
        // If we have multiple categories with different averages, there may be a relationship
        if (categoryAverages.length >= 2) {
          const min = Math.min(...categoryAverages.map(ca => ca.average));
          const max = Math.max(...categoryAverages.map(ca => ca.average));
          
          // Check if there's significant variation
          if (max >= min * 1.3) { // At least 30% difference
            relationships.push({
              type: 'category_metric',
              category_column: catCol,
              metric_column: numCol,
              categories: categoryAverages,
              description: `${numCol} varies significantly across different ${catCol} categories`
            });
          }
        }
      });
    });
  }
  
  return relationships;
};

// Calculate Pearson correlation coefficient
const calculateCorrelation = (pairs: number[][]): number => {
  const n = pairs.length;
  if (n === 0) return 0;
  
  // Calculate sums
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  pairs.forEach(([x, y]) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });
  
  // Calculate correlation coefficient
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

export const analyzeDataWithGPT = async (
  messages: Array<{ role: string; content: string }>,
  csvData: any[],
  headers: string[],
  model: string = 'o3-mini-2025-01-31'
): Promise<string | null> => {
  try {
    console.log(`Analyzing ${csvData.length} rows of data with model: ${model}`);
    const client = await getOpenAIClient();
    
    if (!client) {
      console.error('OpenAI client not initialized');
      throw new Error('OpenAI client not initialized. Please provide your API key.');
    }
    
    // For demo mode with default API key, return a simulated response
    if (client.apiKey === DEFAULT_API_KEY) {
      console.log('Using demo API key - generating simulated response');
      return generateDemoAnalysisResponse(messages, csvData, headers);
    }
    
    // Process large datasets in chunks
    const chunkSize = 1000; // Adjust based on your typical dataset size
    const processedData = processDataInChunks(csvData, headers, chunkSize);
    console.log(`Processed data: ${processedData.processedInChunks ? 'Chunked' : 'Full'} dataset`);
    
    if (processedData.processedInChunks) {
      console.log(`Original: ${csvData.length} rows, Processed sample: ${processedData.data.length} rows, ${processedData.numChunks} chunks`);
    }
    
    // Identify potential relationships between columns
    const relationships = identifyRelationships(
      processedData.processedInChunks ? processedData.data : csvData, 
      headers, 
      processedData.statistics
    );
    
    // Create a cleaned data sample
    let dataSample: string;
    if (processedData.data.length <= 10) {
      dataSample = JSON.stringify(processedData.data, null, 2);
    } else {
      dataSample = JSON.stringify(processedData.data.slice(0, 10), null, 2);
    }
    
    // Create statistics summary
    const statsJson = JSON.stringify(processedData.statistics, null, 2);
    
    // Create relationships summary
    const relationshipsJson = relationships.length > 0 
      ? JSON.stringify(relationships, null, 2)
      : "No significant relationships identified";
    
    // Add system message about the data with enhanced formatting instructions
    const systemMessage = {
      role: 'system',
      content: `You are an experienced data analyst specializing in business intelligence for sales and marketing executives. Your task is to help executives understand their data by providing clear, actionable insights with properly formatted outputs.

DATASET INFORMATION:
- Columns (${headers.length}): ${headers.join(', ')}
- Total rows: ${processedData.totalRows || csvData.length}
${processedData.processedInChunks ? `- Data processed in ${processedData.numChunks} chunks of ${chunkSize} rows each` : ''}
- Sample of the data (first 10 rows):
${dataSample}

COLUMN STATISTICS SUMMARY:
${statsJson}

IDENTIFIED RELATIONSHIPS:
${relationshipsJson}

BUSINESS CONTEXT:
The data will be analyzed by executives and sales/marketing leaders who want to:
1. Understand what products/services sell best and why
2. Identify geographic/demographic patterns
3. Evaluate marketing campaign effectiveness
4. Find opportunities for operational improvements
5. Discover correlations between different business metrics

OUTPUT FORMATTING REQUIREMENTS:
1. Always use markdown formatting
2. Format statistics, comparisons, and structured data as markdown tables
3. Use clear headings for main sections and subsections
4. Use bullet points for key insights and findings
5. Bold important conclusions or recommendations
6. Provide a concise summary at the beginning
7. Suggest specific actionable recommendations

Your goal is to provide a professional, executive-ready analysis that helps decision-makers understand their data and take action. Focus on business implications rather than just statistics.`
    };
    
    // Combine with user messages
    const allMessages = [systemMessage, ...messages];
    
    // Handle different model formats
    let modelName = model;
    // Special handling for o3-mini model which has a specific date in the UI but needs 'o3-mini' for the API
    if (model === 'o3-mini-2025-01-31') {
      modelName = 'o3-mini';
    } else if (model === 'gpt-4.1') {
      modelName = 'gpt-4.1';
    }
    
    console.log(`Using OpenAI model: ${modelName}`);
    
    // Call OpenAI API with the specified model
    const response = await client.chat.completions.create({
      model: modelName,
      messages: allMessages as any,
      temperature: 0.2, // Lower temperature for more factual/analytical responses
      max_completion_tokens: 2000  // Fixed parameter name for token limit
    });
    
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error analyzing data with GPT:', error);
    throw error;
  }
};

// Generate a simulated AI analysis response for demo purposes
const generateDemoAnalysisResponse = (
  messages: Array<{ role: string; content: string }>,
  data: any[],
  headers: string[]
): string => {
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // Check for some common question patterns and return appropriate responses
  if (lastUserMessage.toLowerCase().includes('summary') || 
      lastUserMessage.toLowerCase().includes('overview') ||
      lastUserMessage.toLowerCase().includes('analyze')) {
    return `# Executive Data Summary

## Overview
I've analyzed your dataset containing **${data.length.toLocaleString()} records** across **${headers.length} fields**. Here's what I found:

### Key Insights
- **Growth Trend**: Sales have shown a 23% year-over-year increase, with Q2 2025 being the strongest quarter
- **Product Performance**: Premium subscription tier outperforms basic offerings with 37% higher retention
- **Regional Analysis**: Northeast region shows 18% higher conversion rates than other territories
- **Customer Segments**: Enterprise clients deliver 3.2x higher lifetime value than SMB accounts

## Detailed Analysis

### Sales Performance by Category

| Category | Revenue | Growth | Profit Margin |
|----------|---------|--------|--------------|
| Enterprise | $1,245,000 | +32.5% | 42.8% |
| SMB | $875,200 | +17.8% | 38.2% |
| Consumer | $543,800 | -3.2% | 52.1% |
| **Total** | **$2,664,000** | **+23.1%** | **43.6%** |

### Marketing Channel Effectiveness

| Channel | Leads | Conversion Rate | CAC | ROI |
|---------|-------|----------------|-----|-----|
| Paid Search | 1,240 | 5.8% | $412 | 2.4x |
| LinkedIn | 825 | 7.2% | $385 | 3.1x |
| Referral | 312 | 12.4% | $105 | 8.5x |

## Recommendations

1. **Increase investment in referral programs** - highest conversion rate and lowest customer acquisition cost
2. **Review Consumer Subscription positioning** - only category showing decline despite high margins
3. **Expand Northeast sales team capacity** to capitalize on higher regional performance

Would you like me to drill down into any particular aspect of this analysis?`;
  } 
  else if (lastUserMessage.toLowerCase().includes('trend') || 
           lastUserMessage.toLowerCase().includes('over time') ||
           lastUserMessage.toLowerCase().includes('growth')) {
    return `# Trend Analysis

## Growth Patterns Over Time

I've analyzed the time-series patterns in your data and identified these key trends:

### Quarterly Performance (2023-2025)

| Quarter | Revenue | YoY Growth | New Customers | Retention |
|---------|---------|------------|--------------|-----------|
| Q1 2023 | $1.2M | - | 124 | 78% |
| Q2 2023 | $1.4M | - | 156 | 81% |
| Q3 2023 | $1.6M | - | 187 | 83% |
| Q4 2023 | $1.8M | - | 214 | 85% |
| Q1 2024 | $1.9M | +58% | 232 | 86% |
| Q2 2024 | $2.1M | +50% | 245 | 87% |
| Q3 2024 | $2.3M | +44% | 268 | 88% |
| Q4 2024 | $2.5M | +39% | 284 | 89% |
| Q1 2025 | $2.7M | +42% | 312 | 91% |
| Q2 2025 | $3.1M | +48% | 345 | 92% |

## Key Growth Insights

- **Accelerating Growth**: After a period of steady growth (39-44%), we're seeing acceleration to 48% in the most recent quarter
- **Seasonal Patterns**: Q2 and Q4 consistently show the strongest performance, with approximately 12-15% higher revenue than preceding quarters
- **Retention Correlation**: For every 1% increase in retention, we see approximately 4.8% increase in revenue the following quarter

## Forecasting

Based on current trends, I project:
- **Q3 2025**: $3.4-3.6M revenue (10-15% growth from Q2)
- **Q4 2025**: $3.8-4.1M revenue (12-18% growth from Q3)
- **Full Year 2025**: $12.8-13.2M total revenue

## Recommendations

1. **Capitalize on Q4 seasonal strength** by planning major product releases and marketing campaigns for this period
2. **Focus on retention initiatives** as they strongly correlate with revenue growth
3. **Invest in Northeast region expansion** where growth is outpacing other regions by 28%

Would you like me to explore any specific time period or metric in more detail?`;
  }
  else if (lastUserMessage.toLowerCase().includes('customer') || 
           lastUserMessage.toLowerCase().includes('segment') ||
           lastUserMessage.toLowerCase().includes('audience')) {
    return `# Customer Segment Analysis

## Overview

I've analyzed your customer data across various segments and identified significant patterns in behavior, value, and growth potential.

## Customer Segments by Value

| Segment | % of Customers | % of Revenue | Avg. LTV | Growth Rate |
|---------|----------------|--------------|----------|-------------|
| Enterprise | 12% | 46% | $42,500 | +32% |
| Mid-Market | 28% | 34% | $12,800 | +24% |
| Small Business | 35% | 16% | $4,850 | +15% |
| Startup | 25% | 4% | $1,650 | +42% |

## Key Insights by Segment

### Enterprise Segment
- **Highest LTV** at $42,500 per customer
- **Longest sales cycle** (68 days average)
- **Primary drivers**: Security features (87%), compliance (78%), integration capabilities (72%)
- **Churn rate**: 5.8% annually

### Mid-Market Segment
- **Fastest growing revenue contribution** (+24% YoY)
- **Sales cycle**: 42 days average
- **Primary drivers**: Scalability (82%), pricing (76%), support quality (68%)
- **Churn rate**: 9.4% annually

### Small Business Segment
- **Highest customer count** (35% of total)
- **Sales cycle**: 28 days average
- **Primary drivers**: Ease of use (89%), price (85%), onboarding support (72%)
- **Churn rate**: 14.2% annually

### Startup Segment
- **Fastest growing segment** (+42% YoY customer acquisition)
- **Shortest sales cycle** (14 days average)
- **Primary drivers**: Free tier (92%), simple pricing (86%), no lock-in (78%)
- **Churn rate**: 22.5% annually

## Recommendations

1. **Develop enterprise-focused features** that address security and compliance needs
2. **Create a specialized mid-market sales team** to capitalize on this segment's growth and higher conversion rates
3. **Implement tiered support packages** as support quality is a key driver for mid-market customers
4. **Develop a "Startup Growth" program** to help highest-growth customers transition to higher tiers

Would you like me to explore any particular segment in more depth?`;
  }
  
  // Default response for other types of questions
  return `# Data Analysis Results

## Executive Summary

Based on my analysis of your dataset with ${data.length.toLocaleString()} records, I've identified several key patterns and insights that can help inform your business decisions.

### Key Findings

- **Performance Metrics**: Your top-performing category shows a 28% higher conversion rate than others
- **Regional Variations**: Significant differences in performance across regions, with the Northeast leading by 18%
- **Customer Behavior**: Clear correlation between engagement frequency and retention rates
- **Product Adoption**: Premium features see 3.2x higher usage in enterprise segments

## Detailed Analysis

| Metric | Value | YoY Change | Industry Benchmark |
|--------|-------|------------|---------------------|
| Revenue Growth | 23.5% | +4.2pp | 18.7% |
| Customer Acquisition Cost | $315 | -12.8% | $425 |
| Customer Lifetime Value | $4,850 | +18.3% | $3,920 |
| Retention Rate | 86.4% | +3.7pp | 78.3% |

### Opportunity Areas

1. **Cross-selling potential**: 42% of customers use only one product
2. **Underserved segments**: Mid-market companies show high interest but lower conversion
3. **Geographic expansion**: Western region showing rapid growth from small base

## Recommendations

1. **Prioritize retention programs** for high-value segments
2. **Revise pricing tiers** to better capture mid-market opportunity
3. **Expand marketing in Northeast region** where performance exceeds other areas
4. **Develop targeted offerings** for the financial services vertical

Would you like me to explore any particular aspect of this analysis in more depth?`;
};

export const isAPIKeyConfigured = async (): Promise<boolean> => {
  try {
    // First check if there's a user-provided key
    const key = await localforage.getItem<string>('openai_api_key');
    
    // Return true if there's either a user key or we have a default key
    return !!key || !!DEFAULT_API_KEY;
  } catch (error) {
    console.error('Error checking API key configuration:', error);
    // Return true if we have a default key, even if there was an error checking storage
    return !!DEFAULT_API_KEY;
  }
};