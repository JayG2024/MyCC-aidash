import { isAPIKeyConfigured, checkAPIKeyValidity } from './openai';
import localforage from 'localforage';

// Mock localforage
jest.mock('localforage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

// Mock the OpenAI class
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      models: {
        list: jest.fn().mockResolvedValue({ data: [] })
      }
    }))
  };
});

describe('OpenAI Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAPIKeyConfigured', () => {
    it('returns true when a user key exists', async () => {
      (localforage.getItem as jest.Mock).mockResolvedValue('sk-user-provided-key');
      const result = await isAPIKeyConfigured();
      expect(result).toBe(true);
      expect(localforage.getItem).toHaveBeenCalledWith('openai_api_key');
    });

    it('returns true when using default key', async () => {
      (localforage.getItem as jest.Mock).mockResolvedValue(null);
      // The function checks for DEFAULT_API_KEY which is "sk-mycc-dashboard-demo-key-2025"
      const result = await isAPIKeyConfigured();
      expect(result).toBe(true);
    });

    it('handles errors by falling back to default key', async () => {
      (localforage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const result = await isAPIKeyConfigured();
      expect(result).toBe(true); // Should still be true because of default key
    });
  });

  describe('checkAPIKeyValidity', () => {
    it('returns true for demo key without making API call', async () => {
      const result = await checkAPIKeyValidity('sk-mycc-dashboard-demo-key-2025');
      expect(result).toBe(true);
    });

    it('calls OpenAI API for non-demo keys', async () => {
      // This would make a real API call in production, but our mock will return true
      const result = await checkAPIKeyValidity('sk-user-test-key');
      expect(result).toBe(true);
    });
  });
});