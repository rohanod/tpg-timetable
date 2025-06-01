import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../services/auth';

// Mock the supabase client
vi.mock('../services/auth', async () => {
  const actual = await vi.importActual('../services/auth');
  return {
    ...actual,
    supabase: {
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn()
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis()
    }
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock window.location
const mockAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: mockAssign
  },
  writable: true
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      vi.mocked(AuthService.supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null
      } as any);

      const result = await AuthService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      vi.mocked(AuthService.supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when an error occurs', async () => {
      vi.mocked(AuthService.supabase.auth.getSession).mockRejectedValue(
        new Error('Auth error')
      );

      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should redirect to dashboard after successful login', async () => {
      vi.mocked(AuthService.supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null
      } as any);

      await AuthService.login('test@example.com', 'password');
      expect(window.location.href).toBe('/dashboard');
    });

    it('should throw an error when login fails', async () => {
      vi.mocked(AuthService.supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' }
      } as any);

      await expect(AuthService.login('test@example.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch and return user profile', async () => {
      // Mock the auth user
      vi.mocked(AuthService.supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      } as any);
      
      // Mock the profile query
      vi.mocked(AuthService.supabase.single).mockResolvedValue({
        data: { id: 'test-user', is_premium: false, email: 'test@example.com' },
        error: null
      });

      const profile = await AuthService.getUserProfile();
      expect(profile).toEqual({
        id: 'test-user',
        is_premium: false,
        email: 'test@example.com'
      });
    });

    it('should create a new profile if none exists', async () => {
      // Mock the auth user
      vi.mocked(AuthService.supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'new-user', email: 'new@example.com' } },
        error: null
      } as any);
      
      // Mock profile not found
      vi.mocked(AuthService.supabase.single).mockResolvedValueOnce({
        data: null,
        error: { message: 'No profile found' }
      });
      
      // Mock profile creation
      vi.mocked(AuthService.supabase.select).mockResolvedValueOnce({
        data: { id: 'new-user', is_premium: false, email: 'new@example.com' },
        error: null
      });

      const profile = await AuthService.getUserProfile();
      expect(profile).toEqual({
        id: 'new-user',
        is_premium: false,
        email: 'new@example.com'
      });
    });
  });
});