import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../components/Dashboard';
import { ProjectService } from '../services/projects';
import { AuthService } from '../services/auth';

// Mock the services
vi.mock('../services/projects');
vi.mock('../services/auth');
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation
    vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
    vi.mocked(AuthService.getUserProfile).mockResolvedValue({ 
      id: 'test-user', 
      is_premium: false,
      created_at: new Date().toISOString()
    });
    vi.mocked(ProjectService.getProjects).mockResolvedValue([]);
  });

  it('should render loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByRole('status') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should redirect to home if user is not authenticated', async () => {
    vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);
    
    // Mock window.location
    const mockLocation = vi.spyOn(window, 'location', 'get');
    mockLocation.mockImplementation(() => ({
      href: '',
      assign: vi.fn()
    } as unknown as Location));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(AuthService.isAuthenticated).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
  });

  it('should display projects when loaded successfully', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', created_at: new Date().toISOString(), user_id: 'test-user' },
      { id: '2', name: 'Project 2', created_at: new Date().toISOString(), user_id: 'test-user' }
    ];
    
    vi.mocked(ProjectService.getProjects).mockResolvedValue(mockProjects);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  it('should display error state when loading fails', async () => {
    vi.mocked(ProjectService.getProjects).mockRejectedValue(new Error('Failed to load projects'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });
  });

  it('should handle retry loading data', async () => {
    // First fail, then succeed
    vi.mocked(ProjectService.getProjects)
      .mockRejectedValueOnce(new Error('Failed to load projects'))
      .mockResolvedValueOnce([]);
    
    render(<Dashboard />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });
    
    // Click retry
    const retryButton = screen.getByText('Retry');
    await userEvent.click(retryButton);
    
    // Should show loading again
    expect(screen.getByRole('status') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Then should show empty projects state
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });
});