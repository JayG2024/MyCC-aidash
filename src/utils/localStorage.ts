import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'mcc-ai-dashboard',
  storeName: 'csv_data'
});

export interface StoredCSVData {
  id: string;
  data: any[];
  headers: string[];
  fileName: string;
  timestamp: number;
  description?: string;
  tags?: string[];
}

// Save CSV data to local storage
export const saveCSVData = async (data: any[], headers: string[], fileName: string): Promise<void> => {
  try {
    const storedData: StoredCSVData = {
      id: `csv_${Date.now()}`,
      data,
      headers,
      fileName,
      timestamp: Date.now()
    };
    await localforage.setItem('current_csv_data', storedData);
    console.log('Data saved successfully');
    return;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

// Load CSV data from local storage
export const loadCSVData = async (): Promise<StoredCSVData | null> => {
  try {
    const storedData = await localforage.getItem<StoredCSVData>('current_csv_data');
    return storedData;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Save CSV data to the content library
export const saveToContentLibrary = async (data: any[], headers: string[], fileName: string, description: string = '', tags: string[] = []): Promise<string> => {
  try {
    // Get existing library
    const library = await getContentLibrary();
    
    // Create a new entry
    const id = `csv_${Date.now()}`;
    const newEntry: StoredCSVData = {
      id,
      data,
      headers,
      fileName,
      timestamp: Date.now(),
      description,
      tags
    };
    
    // Add to library
    library.push(newEntry);
    
    // Save updated library
    await localforage.setItem('content_library', library);
    
    return id;
  } catch (error) {
    console.error('Error saving to content library:', error);
    throw error;
  }
};

// Get all data sets from the content library
export const getContentLibrary = async (): Promise<StoredCSVData[]> => {
  try {
    const library = await localforage.getItem<StoredCSVData[]>('content_library');
    return library || [];
  } catch (error) {
    console.error('Error getting content library:', error);
    return [];
  }
};

// Get a specific dataset from the content library by ID
export const getDatasetById = async (id: string): Promise<StoredCSVData | null> => {
  try {
    const library = await getContentLibrary();
    const dataset = library.find(item => item.id === id);
    return dataset || null;
  } catch (error) {
    console.error('Error getting dataset:', error);
    return null;
  }
};

// Delete a dataset from the content library
export const deleteDataset = async (id: string): Promise<boolean> => {
  try {
    const library = await getContentLibrary();
    const newLibrary = library.filter(item => item.id !== id);
    await localforage.setItem('content_library', newLibrary);
    return true;
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return false;
  }
};

// Update a dataset's metadata (not the data itself)
export const updateDatasetMetadata = async (id: string, updates: Partial<Pick<StoredCSVData, 'fileName' | 'description' | 'tags'>>): Promise<boolean> => {
  try {
    const library = await getContentLibrary();
    const updatedLibrary = library.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    await localforage.setItem('content_library', updatedLibrary);
    return true;
  } catch (error) {
    console.error('Error updating dataset metadata:', error);
    return false;
  }
};

// Save chat history to local storage
export const saveChatHistory = async (chatHistory: any[]): Promise<void> => {
  try {
    await localforage.setItem('chat_history', chatHistory);
    return;
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
};

// Load chat history from local storage
export const loadChatHistory = async (): Promise<any[] | null> => {
  try {
    const chatHistory = await localforage.getItem<any[]>('chat_history');
    return chatHistory || [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

// Clear all stored data
export const clearStoredData = async (): Promise<void> => {
  try {
    await localforage.clear();
    return;
  } catch (error) {
    console.error('Error clearing stored data:', error);
    throw error;
  }
};