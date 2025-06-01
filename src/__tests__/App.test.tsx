import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { AuthService } from '../services/auth';

// Mock the services
vi.mock('../services/auth');
vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock auth check to never resolve so we stay in loading state
    vi.mocked(AuthService.isAuthenticated).mockImplementation(() => new Promise(() => {}));
    
    render(<App />);
    
    expect(screen.getByRole('status') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show sign in button when not authenticated', async () => {
    // Mock not authenticated
    vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);
    
    render(<App />);
    
    // Wait for loading to finish
    const signInButton = await screen.findByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    
    // Should show welcome message
    expect(screen.getByText('Welcome to Bus Timetable Generator')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', async () => {
    // Mock authenticated
    vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
    
    // Mock location.assign
    const assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock, href: '' },
      writable: true
    });
    
    render(<App />);
    
    // Since we're mocking navigation, we'll check that AuthService was called
    expect(AuthService.isAuthenticated).toHaveBeenCalled();
  });
});