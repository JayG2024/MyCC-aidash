import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Helper component that throws an error
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console errors during these tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('renders error UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check that the error UI is displayed
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    
    // Check that technical details section exists
    expect(screen.getByText('View technical details')).toBeInTheDocument();
  });
  
  it('recovers from errors when props change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // First, we should see the error
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    
    // Now, update the props so it doesn't throw anymore
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // We should now see the component rendering normally
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong!')).not.toBeInTheDocument();
  });
});