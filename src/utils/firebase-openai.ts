import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import localforage from 'localforage';

// Initialize the Firebase function
const analyzeDataFunction = httpsCallable(functions, 'api');

export const analyzeDataWithFirebase = async (
  messages: Array<{ role: string; content: string }>,
  csvData: any[],
  headers: string[],
  model: string = 'gpt-4o-mini'
): Promise<string | null> => {
  try {
    console.log(`Analyzing ${csvData.length} rows with Firebase Functions`);
    
    // Get API key from storage
    const apiKey = await localforage.getItem<string>('openai_api_key') || 
                   import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please configure your API key.');
    }

    // Call Firebase Function with data
    const result = await fetch('/api/analyze-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        csvData,
        headers,
        model,
        apiKey
      })
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(errorData.error || 'Failed to analyze data');
    }

    const data = await result.json();
    return data.result;

  } catch (error: any) {
    console.error('Error with Firebase analysis:', error);
    throw error;
  }
};

// Fallback to direct OpenAI call if Firebase fails
export const analyzeDataWithFallback = async (
  messages: Array<{ role: string; content: string }>,
  csvData: any[],
  headers: string[],
  model: string = 'gpt-4o-mini'
): Promise<string | null> => {
  try {
    // Try Firebase first
    return await analyzeDataWithFirebase(messages, csvData, headers, model);
  } catch (firebaseError) {
    console.warn('Firebase failed, falling back to direct OpenAI:', firebaseError);
    
    // Import the original function as fallback
    const { analyzeDataWithGPT } = await import('./openai');
    return await analyzeDataWithGPT(messages, csvData, headers, model);
  }
};