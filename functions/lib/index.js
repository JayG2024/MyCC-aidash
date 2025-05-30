"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const openai_1 = require("openai");
// Set global options for all functions
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    region: 'us-central1'
});
// Initialize Firebase Admin
admin.initializeApp();
const app = express();
// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' })); // Support large datasets
// OpenAI API endpoint - with 15 minute timeout for large datasets
app.post('/analyze-data', async (req, res) => {
    var _a, _b;
    try {
        const { messages, csvData, headers, model = 'gpt-4o-mini', apiKey } = req.body;
        if (!apiKey) {
            res.status(400).json({ error: 'OpenAI API key is required' });
            return;
        }
        if (!csvData || !headers) {
            res.status(400).json({ error: 'CSV data and headers are required' });
            return;
        }
        console.log(`Analyzing ${csvData.length} rows with model: ${model}`);
        // Initialize OpenAI client
        const openai = new openai_1.default({
            apiKey: apiKey
        });
        // Process data and generate statistics (same logic as current implementation)
        const processedData = processDataInChunks(csvData, headers, 5000);
        // Create comprehensive data representation
        const dataRepresentation = {
            sampleRows: {
                first5: processedData.data.slice(0, 5),
                last5: processedData.data.slice(-5),
                randomSamples: getRandomSamples(processedData.data)
            },
            totalRowsAnalyzed: processedData.totalRows || csvData.length,
            uniqueValuesPerColumn: extractUniqueValues(csvData, headers)
        };
        const dataSample = JSON.stringify(dataRepresentation, null, 2);
        const statsJson = JSON.stringify(processedData.statistics, null, 2);
        // Identify relationships
        const relationships = identifyRelationships(processedData.processedInChunks ? processedData.data : csvData, headers, processedData.statistics);
        const relationshipsJson = relationships.length > 0
            ? JSON.stringify(relationships, null, 2)
            : "No significant relationships identified";
        // Create system message
        const systemMessage = {
            role: 'system',
            content: `You are an experienced data analyst specializing in business intelligence for sales and marketing executives. Your task is to help executives understand their data by providing clear, actionable insights with properly formatted outputs.

CRITICAL INSTRUCTION: You MUST analyze and reference ONLY the actual data provided below. DO NOT use illustrative, example, or placeholder numbers. ALL statistics, values, and insights must be derived from the ACTUAL DATA shown below.

DATASET INFORMATION:
- Columns (${headers.length}): ${headers.join(', ')}
- Total rows analyzed: ${processedData.totalRows || csvData.length} (ENTIRE DATASET)
${processedData.processedInChunks ? `- Data processed in ${processedData.numChunks} chunks of 5000 rows each for efficiency` : ''}
- Representative data samples from throughout the dataset:
${dataSample}

COMPREHENSIVE STATISTICS (calculated from ALL ${processedData.totalRows || csvData.length} rows):
${statsJson}

IDENTIFIED RELATIONSHIPS AND PATTERNS:
${relationshipsJson}

CRITICAL: The statistics above represent analysis of the COMPLETE dataset (all ${processedData.totalRows || csvData.length} rows), not just the sample rows shown. When providing insights about sales trends, top products, geographic patterns, or any metrics, use these comprehensive statistics that cover 100% of the uploaded data.

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
8. NEVER include disclaimers about "illustrative" or "example" data - always work with the actual data provided

Your goal is to provide a professional, executive-ready analysis based on the ACTUAL DATA that helps decision-makers understand their data and take action. Focus on business implications of the real data rather than just statistics.`
        };
        const allMessages = [systemMessage, ...messages];
        // Call OpenAI API with longer timeout
        const response = await openai.chat.completions.create({
            model: model,
            messages: allMessages,
            temperature: 0.2,
            max_completion_tokens: 2000
        });
        const result = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || null;
        console.log(`Analysis completed for ${csvData.length} rows`);
        res.json({ result });
    }
    catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({
            error: 'Failed to analyze data',
            details: error.message
        });
    }
});
// Helper functions (copied from your current implementation)
function processDataInChunks(data, headers, maxChunkSize = 5000) {
    console.log(`Processing ${data.length} rows of data in chunks of ${maxChunkSize}`);
    if (data.length <= maxChunkSize) {
        return { data, headers, statistics: generateDataStatistics(data, headers) };
    }
    const chunks = [];
    for (let i = 0; i < data.length; i += maxChunkSize) {
        chunks.push(data.slice(i, i + maxChunkSize));
    }
    console.log(`Split data into ${chunks.length} chunks`);
    const chunkStatistics = chunks.map(chunk => generateDataStatistics(chunk, headers));
    const combinedStats = combineChunkStatistics(chunkStatistics, headers);
    return {
        data: [...chunks[0].slice(0, 50), ...chunks[chunks.length - 1].slice(-50)],
        headers,
        statistics: combinedStats,
        totalRows: data.length,
        processedInChunks: true,
        numChunks: chunks.length
    };
}
function generateDataStatistics(data, headers) {
    const stats = {};
    headers.forEach(header => {
        const values = data
            .map(row => row[header])
            .filter(val => val !== null && val !== undefined && val !== '');
        let columnType = 'unknown';
        if (values.length > 0) {
            if (values.every(val => typeof val === 'number' || !isNaN(Number(val)))) {
                columnType = 'numeric';
            }
            else if (values.every(val => typeof val === 'boolean' || val === 'true' || val === 'false')) {
                columnType = 'boolean';
            }
            else if (values.every(val => !isNaN(Date.parse(String(val))))) {
                columnType = 'date';
            }
            else {
                columnType = 'text';
            }
        }
        stats[header] = {
            type: columnType,
            count: values.length,
            missing: data.length - values.length,
            uniqueCount: new Set(values.map(v => String(v))).size,
        };
        if (columnType === 'numeric') {
            const numValues = values.map(v => Number(v));
            const sorted = [...numValues].sort((a, b) => a - b);
            const sum = numValues.reduce((acc, val) => acc + val, 0);
            const mean = sum / numValues.length;
            const variance = numValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numValues.length;
            stats[header] = Object.assign(Object.assign({}, stats[header]), { min: sorted[0], max: sorted[sorted.length - 1], sum,
                mean, median: sorted.length % 2 === 0
                    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                    : sorted[Math.floor(sorted.length / 2)], stdDev: Math.sqrt(variance), percentiles: {
                    p25: sorted[Math.floor(sorted.length * 0.25)],
                    p50: sorted[Math.floor(sorted.length * 0.5)],
                    p75: sorted[Math.floor(sorted.length * 0.75)],
                } });
        }
        else if (columnType === 'text') {
            const valueCounts = {};
            values.forEach(val => {
                const strVal = String(val);
                valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
            });
            const topValues = Object.entries(valueCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([value, count]) => ({ value, count, percentage: (count / values.length) * 100 }));
            stats[header].topValues = topValues;
            stats[header].avgLength = values.reduce((acc, val) => acc + String(val).length, 0) / values.length;
        }
    });
    return stats;
}
function combineChunkStatistics(chunkStats, headers) {
    const combined = {};
    headers.forEach(header => {
        const validChunkStats = chunkStats.filter(cs => cs[header]);
        if (validChunkStats.length === 0)
            return;
        const columnType = validChunkStats[0][header].type;
        combined[header] = {
            type: columnType,
            count: validChunkStats.reduce((sum, cs) => sum + cs[header].count, 0),
            missing: validChunkStats.reduce((sum, cs) => sum + cs[header].missing, 0),
            uniqueCount: null,
        };
        if (columnType === 'numeric') {
            const min = Math.min(...validChunkStats.map(cs => cs[header].min));
            const max = Math.max(...validChunkStats.map(cs => cs[header].max));
            const totalCount = combined[header].count;
            const weightedMean = validChunkStats.reduce((sum, cs) => sum + (cs[header].mean * cs[header].count), 0) / totalCount;
            combined[header] = Object.assign(Object.assign({}, combined[header]), { min,
                max, mean: weightedMean, median: "estimated from chunks", stdDev: "estimated from chunks", sum: validChunkStats.reduce((sum, cs) => sum + cs[header].sum, 0) });
        }
        else if (columnType === 'text') {
            const valueCounts = {};
            validChunkStats.forEach(cs => {
                if (cs[header].topValues) {
                    cs[header].topValues.forEach((tv) => {
                        valueCounts[tv.value] = (valueCounts[tv.value] || 0) + tv.count;
                    });
                }
            });
            const topValues = Object.entries(valueCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([value, count]) => ({
                value,
                count,
                percentage: (count / combined[header].count) * 100
            }));
            combined[header].topValues = topValues;
            combined[header].avgLength = validChunkStats.reduce((sum, cs) => sum + (cs[header].avgLength * cs[header].count), 0) / combined[header].count;
        }
    });
    return combined;
}
function getRandomSamples(data) {
    if (data.length <= 20)
        return [];
    const samples = [];
    const indices = [
        Math.floor(data.length * 0.25),
        Math.floor(data.length * 0.5),
        Math.floor(data.length * 0.75)
    ];
    indices.forEach(idx => {
        if (idx < data.length) {
            samples.push(data[idx]);
        }
    });
    return samples;
}
function extractUniqueValues(csvData, headers) {
    const uniqueValues = {};
    headers.forEach(header => {
        const uniqueCount = new Set(csvData.map(row => row[header])).size;
        if (uniqueCount <= 100) {
            const uniqueVals = [...new Set(csvData.map(row => row[header]))].slice(0, 50);
            uniqueValues[header] = uniqueVals;
        }
    });
    return uniqueValues;
}
function identifyRelationships(data, headers, stats) {
    const relationships = [];
    const numericColumns = headers.filter(h => { var _a; return ((_a = stats[h]) === null || _a === void 0 ? void 0 : _a.type) === 'numeric'; });
    if (numericColumns.length >= 2 && data.length >= 30) {
        for (let i = 0; i < numericColumns.length - 1; i++) {
            for (let j = i + 1; j < numericColumns.length; j++) {
                const col1 = numericColumns[i];
                const col2 = numericColumns[j];
                const pairs = data.filter(row => row[col1] !== null && row[col1] !== undefined && row[col1] !== '' &&
                    row[col2] !== null && row[col2] !== undefined && row[col2] !== '').map(row => [Number(row[col1]), Number(row[col2])]);
                if (pairs.length >= 30) {
                    const correlation = calculateCorrelation(pairs);
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
    }
    return relationships;
}
function calculateCorrelation(pairs) {
    const n = pairs.length;
    if (n === 0)
        return 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    pairs.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    });
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? 0 : numerator / denominator;
}
// Export the Express app as a Firebase Function with extended timeout
exports.api = (0, https_1.onRequest)({
    timeoutSeconds: 540,
    memory: '2GiB',
    cors: true
}, app);
//# sourceMappingURL=index.js.map