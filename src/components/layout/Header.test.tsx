import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('renders the title correctly', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('contains a search input', () => {
    render(<Header title="Test Title" />);
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('contains notification bell', () => {
    render(<Header title="Test Title" />);
    // Look for the button containing the Bell icon
    const notificationButton = screen.getByRole('button', { name: '' });
    expect(notificationButton).toBeInTheDocument();
  });

  it('contains user profile', () => {
    render(<Header title="Test Title" />);
    // Look for the user profile element containing "JD"
    const userProfile = screen.getByText('JD');
    expect(userProfile).toBeInTheDocument();
  });
});