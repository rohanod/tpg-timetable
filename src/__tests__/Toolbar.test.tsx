import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toolbar } from '../components/Toolbar';
import { searchStops, fetchStationboard } from '../services/api';
import { ProjectService } from '../services/projects';
import { AppProvider } from '../contexts/AppContext';

// Mock the services
vi.mock('../services/api');
vi.mock('../services/projects');
vi.mock('react-hot-toast');

describe('Toolbar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(ProjectService.getUserPermissions).mockResolvedValue({
      data: { id: 'test-user', is_premium: false, created_at: new Date().toISOString() }
    });
    vi.mocked(searchStops).mockResolvedValue([]);
  });

  it('should render with basic controls', () => {
    render(
      <AppProvider>
        <Toolbar />
      </AppProvider>
    );
    
    expect(screen.getByPlaceholderText(/search for stop/i)).toBeInTheDocument();
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/new timetable/i)).toBeInTheDocument();
    expect(screen.getByText(/export pdf/i)).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    vi.mocked(searchStops).mockResolvedValue([
      { label: 'Test Stop 1', id: 'stop-1' },
      { label: 'Test Stop 2', id: 'stop-2' }
    ]);
    
    render(
      <AppProvider>
        <Toolbar />
      </AppProvider>
    );
    
    const searchInput = screen.getByPlaceholderText(/search for stop/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for suggestions to load
    await waitFor(() => {
      expect(searchStops).toHaveBeenCalledWith('test');
    });
  });

  it('should show filter panel when Filters button is clicked', () => {
    render(
      <AppProvider>
        <Toolbar />
      </AppProvider>
    );
    
    // Filter panel should not be visible initially
    expect(screen.queryByText(/bus\/tram filters/i)).not.toBeInTheDocument();
    
    // Click the Filters button
    fireEvent.click(screen.getByText(/filters/i));
    
    // Filter panel should now be visible
    expect(screen.getByText(/bus\/tram filters/i)).toBeInTheDocument();
  });

  it('should add new bus filter', () => {
    render(
      <AppProvider>
        <Toolbar />
      </AppProvider>
    );
    
    // Show filter panel
    fireEvent.click(screen.getByText(/filters/i));
    
    // Enter bus number
    const busInput = screen.getByPlaceholderText(/add bus\/tram number/i);
    fireEvent.change(busInput, { target: { value: '10' } });
    
    // Click add button
    fireEvent.click(screen.getByText('Add'));
    
    // Bus filter should be added
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should handle time filter changes', () => {
    render(
      <AppProvider>
        <Toolbar />
      </AppProvider>
    );
    
    // Show filter panel
    fireEvent.click(screen.getByText(/filters/i));
    
    // Find time input
    const timeInput = screen.getByLabelText(/time filter/i);
    
    // Change time
    fireEvent.change(timeInput, { target: { value: '12:00' } });
    
    // Time filter should be updated
    expect(timeInput).toHaveValue('12:00');
  });
});