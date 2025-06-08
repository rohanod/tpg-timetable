import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock components to avoid Auth0/Convex dependency issues in tests
vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: false }),
  Authenticated: ({ children }: { children: React.ReactNode }) => <div data-testid="authenticated">{children}</div>,
  Unauthenticated: ({ children }: { children: React.ReactNode }) => <div data-testid="unauthenticated">{children}</div>,
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  })
}));

vi.mock('../services/auth', () => ({
  useStoreUserEffect: () => ({ isLoading: false, isAuthenticated: false })
}));

vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => <div>Route Component</div>,
  Navigate: () => <div>Navigate Component</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should show loading state initially', () => {
    vi.spyOn(require('convex/react'), 'useConvexAuth').mockReturnValue({ isLoading: true });
    
    render(<App />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render unauthenticated content when not authenticated', async () => {
    vi.spyOn(require('convex/react'), 'useConvexAuth').mockReturnValue({ isLoading: false, isAuthenticated: false });
    
    render(<App />);
    
    expect(screen.getByTestId('unauthenticated')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Bus Timetable Generator')).toBeInTheDocument();
  });
});