import { GoogleGenerativeAI } from '@google/generative-ai';
import localforage from 'localforage';

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null;

// Default API key that will be used if no user-provided key is found
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const initializeGemini = async (apiKey?: string): Promise<boolean> => {
  try {
    let key: string | null = null;
    
    // Priority order: provided key > user stored key > default key
    if (apiKey) {
      key = apiKey;
      console.log('Using provided API key');
    } else {
      // Try to get user stored key
      const userKey = await localforage.getItem<string>('gemini_api_key');
      if (userKey) {
        key = userKey;
        console.log('Using user-stored API key');
      } else if (DEFAULT_API_KEY) {
        key = DEFAULT_API_KEY;
        console.log('Using default API key');
      }
    }
    
    if (!key) {
      console.log('No Gemini API key available');
      return false;
    }
    
    geminiClient = new GoogleGenerativeAI(key);
    
    // Save API key for future sessions if provided (and not the default)
    if (apiKey && apiKey !== DEFAULT_API_KEY) {
      await localforage.setItem('gemini_api_key', apiKey);
      console.log('Saved user API key to storage');
    }
    
    console.log('Gemini client initialized successfully with key type:', 
      key === DEFAULT_API_KEY ? 'default' : 'user-provided');
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
};

export const getGeminiClient = async (): Promise<GoogleGenerativeAI | null> => {
  if (!geminiClient) {
    const initialized = await initializeGemini();
    if (!initialized) {
      console.log('Failed to initialize Gemini client');
      return null;
    }
  }
  return geminiClient;
};

export const clearGeminiApiKey = async (): Promise<void> => {
  geminiClient = null;
  await localforage.removeItem('gemini_api_key');
  console.log('Gemini API key cleared, will fall back to default key');
};

export const checkAPIKeyValidity = async (apiKey: string): Promise<boolean> => {
  // For the demo key, always return true without making an API call
  if (apiKey === DEFAULT_API_KEY && DEFAULT_API_KEY) {
    console.log('Using default API key - skipping validation');
    return true;
  }
  
  try {
    console.log('Checking API key validity...');
    const tempClient = new GoogleGenerativeAI(apiKey);
    const model = tempClient.getGenerativeModel({ model: "gemini-2.5-pro-preview-06-05" });
    
    // Make a minimal API call to check if the key is valid
    const result = await model.generateContent("Test");
    console.log('API key validation successful');
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};

// Function to process large datasets in chunks for Gemini analysis
const processDataInChunks = (data: any[], headers: string[], maxChunkSize: number = 2000): any => {
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
      
      // Sort by frequency and get top 10 for better insights
      const topValues = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
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
      
      combined[header] = {
        ...combined[header],
        min,
        max,
        mean: weightedMean,
        median: "estimated from chunks",
        stdDev: "estimated from chunks",
        sum: validChunkStats.reduce((sum, cs) => sum + cs[header].sum, 0),
      };
    } else if (columnType === 'text') {
      // Combine top values across chunks
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

export const analyzeDataWithGemini = async (
  messages: Array<{ role: string; content: string }>,
  csvData: any[],
  headers: string[],
  model: string = 'gemini-2.5-pro-preview-06-05'
): Promise<string | null> => {
  try {
    console.log(`Analyzing ${csvData.length} rows of data with Gemini model: ${model}`);
    const client = await getGeminiClient();
    
    if (!client) {
      console.error('Gemini client not initialized');
      throw new Error('Gemini client not initialized. Please provide your API key.');
    }
    
    // Process large datasets in chunks - Gemini 2.5 Pro can handle larger contexts
    const chunkSize = 5000;
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
    
    // Create a comprehensive data representation
    let dataSample: string;
    let dataRepresentation: any = {
      sampleRows: {
        first5: processedData.data.slice(0, 5),
        last5: processedData.data.slice(-5),
        randomSamples: []
      },
      totalRowsAnalyzed: processedData.totalRows || csvData.length,
      uniqueValuesPerColumn: {}
    };
    
    // Add random samples from throughout the dataset
    if (processedData.data.length > 20) {
      const indices = [
        Math.floor(processedData.data.length * 0.25),
        Math.floor(processedData.data.length * 0.5),
        Math.floor(processedData.data.length * 0.75)
      ];
      indices.forEach(idx => {
        if (idx < processedData.data.length) {
          dataRepresentation.sampleRows.randomSamples.push(processedData.data[idx]);
        }
      });
    }
    
    // Extract unique values for categorical columns (limit to reasonable amount)
    headers.forEach(header => {
      if (processedData.statistics[header]?.type === 'text' && 
          processedData.statistics[header]?.uniqueCount <= 100) {
        const uniqueVals = [...new Set(csvData.map(row => row[header]))].slice(0, 50);
        dataRepresentation.uniqueValuesPerColumn[header] = uniqueVals;
      }
    });
    
    dataSample = JSON.stringify(dataRepresentation, null, 2);
    
    // Create statistics summary
    const statsJson = JSON.stringify(processedData.statistics, null, 2);
    
    // Create relationships summary
    const relationshipsJson = relationships.length > 0 
      ? JSON.stringify(relationships, null, 2)
      : "No significant relationships identified";
    
    // Build conversation history for Gemini
    const conversationHistory = messages.map(msg => {
      if (msg.role === 'user') {
        return `User: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}`;
      }
      return msg.content;
    }).join('\n\n');
    
    // Create comprehensive prompt for Gemini
    const prompt = `You are an experienced data analyst specializing in business intelligence for sales and marketing executives. Your task is to help executives understand their data by providing clear, actionable insights with properly formatted outputs.

CRITICAL INSTRUCTION: You MUST analyze and reference ONLY the actual data provided below. DO NOT use illustrative, example, or placeholder numbers. ALL statistics, values, and insights must be derived from the ACTUAL DATA shown below.

COLUMN-SPECIFIC QUERY HANDLING:
When users specify a column name with an equals sign (e.g., "DMA Name = Dallas" or "Product = iPhone"), you MUST:
1. Filter ONLY rows where that specific column exactly matches the value
2. IGNORE any other columns that might contain the same text
3. Be case-sensitive in your matching unless explicitly told otherwise
4. Count only the rows that meet this exact column criteria
5. If asked for breakdowns (by quarter, month, region, etc.), apply the filter first, then group the filtered results

EXAMPLE QUERY INTERPRETATION:
- "How many entries in DMA Name = Dallas" → Count rows where column "DMA Name" exactly equals "Dallas"
- "Sales in Product = iPhone by quarter" → Filter to rows where "Product" = "iPhone", then group by quarter
- "Revenue for Region = West Coast" → Sum revenue only for rows where "Region" exactly equals "West Coast"

DATASET INFORMATION:
- Columns (${headers.length}): ${headers.join(', ')}
- Total rows analyzed: ${processedData.totalRows || csvData.length} (ENTIRE DATASET)
${processedData.processedInChunks ? `- Data processed in ${processedData.numChunks} chunks of ${chunkSize} rows each for efficiency` : ''}
- Representative data samples from throughout the dataset:
${dataSample}

COMPREHENSIVE STATISTICS (calculated from ALL ${processedData.totalRows || csvData.length} rows):
${statsJson}

IDENTIFIED RELATIONSHIPS AND PATTERNS:
${relationshipsJson}

CRITICAL: The statistics above represent analysis of the COMPLETE dataset (all ${processedData.totalRows || csvData.length} rows), not just the sample rows shown. When providing insights about sales trends, top products, geographic patterns, or any metrics, use these comprehensive statistics that cover 100% of the uploaded data.

COMPLETE DATA DISCLOSURE REQUIREMENTS:
- NEVER limit results to "top X" unless explicitly requested (e.g., "top 5")
- When asked to "break down by [category]", show ALL categories with their specific numbers
- Do NOT group items as "other" or "remaining" - list every single category individually
- If there are 45 DMAs, show all 45 with their individual counts
- ALWAYS provide specific numbers for any location/category mentioned by the user
- Be accommodating and helpful - if user asks for specific data, provide it immediately

PRECISE DATA FILTERING INSTRUCTIONS:
- Always examine the exact column names available: ${headers.join(', ')}
- When filtering by column values, use exact string matching
- Show your filtering logic explicitly (e.g., "Filtering dataset where column 'DMA Name' equals 'Dallas'...")
- Always state how many rows matched your filter criteria
- If no exact matches found, suggest similar values that do exist in that column
- When user asks for "breakdown by DMA" or similar, show COMPLETE breakdown with every single value

BUSINESS CONTEXT:
The data will be analyzed by executives and sales/marketing leaders who want to:
1. Understand what products/services sell best and why
2. Identify geographic/demographic patterns
3. Evaluate marketing campaign effectiveness
4. Find opportunities for operational improvements
5. Discover correlations between different business metrics

COMMUNICATION STYLE REQUIREMENTS:
- Be helpful, accommodating, and never refuse reasonable data requests
- If user asks for specific data, provide it immediately without resistance
- Don't be defensive or "snippy" - be professional and solution-oriented
- When user asks for complete breakdowns, provide them enthusiastically
- If there's a lot of data, organize it clearly in tables but show ALL of it

OUTPUT FORMATTING REQUIREMENTS:
1. Always use markdown formatting
2. Format statistics, comparisons, and structured data as markdown tables
3. Use clear headings for main sections and subsections
4. Use bullet points for key insights and findings
5. Bold important conclusions or recommendations
6. Provide a concise summary at the beginning
7. Suggest specific actionable recommendations
8. NEVER include disclaimers about "illustrative" or "example" data - always work with the actual data provided
9. When showing breakdowns, include EVERY category/value with its count - never truncate or group as "other"

Your goal is to provide a professional, executive-ready analysis based on the ACTUAL DATA that helps decision-makers understand their data and take action. Focus on business implications of the real data rather than just statistics.

CONVERSATION HISTORY:
${conversationHistory}

Please respond to the latest user query while taking into account the full conversation context and the actual data provided above.`;
    
    // Get the Gemini model
    const geminiModel = client.getGenerativeModel({ model });
    
    console.log(`Using Gemini model: ${model}`);
    
    // Generate content with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || null;
  } catch (error: any) {
    console.error('Error analyzing data with Gemini:', error);
    throw error;
  }
};

export const isAPIKeyConfigured = async (): Promise<boolean> => {
  try {
    // Always prioritize having a working API key
    if (DEFAULT_API_KEY) {
      console.log('Default Gemini API key is available');
      // Initialize with default key to ensure it's ready
      await initializeGemini();
      return true;
    }
    
    // Check if there's a user-provided key as fallback
    const userKey = await localforage.getItem<string>('gemini_api_key');
    if (userKey) {
      console.log('User-provided Gemini API key found');
      return true;
    }
    
    console.log('No Gemini API key available');
    return false;
  } catch (error) {
    console.error('Error checking API key configuration:', error);
    // Return true if we have a default key, even if there was an error
    return !!DEFAULT_API_KEY;
  }
};