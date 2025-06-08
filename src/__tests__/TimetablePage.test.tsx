import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimetablePage } from '../components/TimetablePage';
import { AppProvider } from '../contexts/AppContext';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,fake')
  })
}));

describe('TimetablePage', () => {
  const mockProps = {
    id: 'test-page-1',
    stopName: 'Test Stop',
    theme: 'color' as const,
    data: [
      { time: '10:00', busNumber: '10', destination: 'City Center' },
      { time: '10:15', busNumber: '20', destination: 'Airport' }
    ],
    onRemove: vi.fn(),
    onPrint: vi.fn(),
    onThemeChange: vi.fn()
  };
  
  const mockLink = {
    href: '',
    download: '',
    click: vi.fn()
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock createElement to return our mockLink when creating an 'a' element
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'a') return mockLink;
      return document.createElement(tagName);
    });
  });

  it('should render timetable page with correct data', () => {
    render(
      <AppProvider>
        <TimetablePage {...mockProps} />
      </AppProvider>
    );
    
    expect(screen.getByText('Test Stop')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('City Center')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Airport')).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    render(
      <AppProvider>
        <TimetablePage {...mockProps} />
      </AppProvider>
    );
    
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    expect(mockProps.onRemove).toHaveBeenCalledTimes(1);
  });

  it('should call onPrint when print button is clicked', () => {
    render(
      <AppProvider>
        <TimetablePage {...mockProps} />
      </AppProvider>
    );
    
    const printColorButton = screen.getByText('Print Color');
    fireEvent.click(printColorButton);
    
    expect(mockProps.onPrint).toHaveBeenCalledWith(false);
    
    const printBWButton = screen.getByText('Print B&W');
    fireEvent.click(printBWButton);
    
    expect(mockProps.onPrint).toHaveBeenCalledWith(true);
  });

  it('should handle export as image', async () => {
    // Set up getElementById mock
    const originalGetElementById = document.getElementById;
    document.getElementById = vi.fn().mockImplementation(() => ({
      style: {}
    }));
    
    render(
      <AppProvider>
        <TimetablePage {...mockProps} />
      </AppProvider>
    );
    
    const exportButton = screen.getByText('Export Image');
    fireEvent.click(exportButton);
    
    // Verify link was created with correct attributes
    expect(mockLink.download).toContain('timetable-test_stop');
    
    // Restore original getElementById
    document.getElementById = originalGetElementById;
  });

  it('should display empty state when no data is provided', () => {
    render(
      <AppProvider>
        <TimetablePage {...mockProps} data={[]} />
      </AppProvider>
    );
    
    expect(screen.getByText('No departures found.')).toBeInTheDocument();
  });
});