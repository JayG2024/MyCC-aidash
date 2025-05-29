import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataUpload from './DataUpload';

// Mock the Papa Parse library
jest.mock('papaparse', () => ({
  parse: jest.fn((file, config) => {
    // Simulate successful parsing
    setTimeout(() => {
      config.complete({
        data: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ],
        meta: {
          fields: ['name', 'age'],
          cursor: 100
        },
        errors: []
      });
    }, 10);
  })
}));

// Mock File object since it's not available in Jest DOM environment
global.File = class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(parts: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = options.size || 1024;
    this.type = options.type || '';
  }
};

describe('DataUpload Component', () => {
  const mockProps = {
    onDataParsed: jest.fn(),
    onBrowseLibrary: jest.fn(),
    onSaveToLibrary: jest.fn(),
    hasActiveData: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload area correctly', () => {
    render(<DataUpload {...mockProps} />);
    
    expect(screen.getByText('Drop your CSV file here')).toBeInTheDocument();
    expect(screen.getByText('Browse Library')).toBeInTheDocument();
    expect(screen.queryByText('Save to Library')).not.toBeInTheDocument(); // Should not be visible when hasActiveData is false
  });

  it('shows the Save to Library button when hasActiveData is true', () => {
    render(<DataUpload {...mockProps} hasActiveData={true} />);
    expect(screen.getAllByText('Save to Library')[0]).toBeInTheDocument();
  });

  it('calls onBrowseLibrary when Browse Library button is clicked', () => {
    render(<DataUpload {...mockProps} />);
    fireEvent.click(screen.getByText('Browse Library'));
    expect(mockProps.onBrowseLibrary).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveToLibrary when Save to Library button is clicked', () => {
    render(<DataUpload {...mockProps} hasActiveData={true} />);
    fireEvent.click(screen.getByText('Save to Library'));
    expect(mockProps.onSaveToLibrary).toHaveBeenCalledTimes(1);
  });

  it('processes file upload correctly', async () => {
    render(<DataUpload {...mockProps} />);
    
    // Create a mock CSV file
    const file = new File([], 'test.csv', { type: 'text/csv' });
    
    // Get the hidden file input and simulate file selection
    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Wait for processing to complete
    await waitFor(() => {
      expect(mockProps.onDataParsed).toHaveBeenCalledWith(
        [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ], 
        ['name', 'age']
      );
    });
    
    // Check success UI elements
    expect(screen.getByText('File processed successfully!')).toBeInTheDocument();
  });
});