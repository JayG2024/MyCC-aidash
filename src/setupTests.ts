// Add custom jest matchers for DOM elements
import '@testing-library/jest-dom';

// Mock the localforage module since we don't need actual storage in tests
jest.mock('localforage', () => ({
  config: jest.fn(),
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null)
}));

// Create a mock for the window.matchMedia function that Jest doesn't provide
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console errors during tests
// Uncomment if needed
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (/Warning.*not wrapped in act/.test(args[0])) {
//     return;
//   }
//   originalConsoleError(...args);
// };