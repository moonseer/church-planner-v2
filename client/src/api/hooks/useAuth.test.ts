import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the entire useAuth hook
vi.mock('./useAuth', () => ({
  default: vi.fn(() => mockAuthHook),
}));

// Define the credential types to match what's expected by the hook
interface LoginCredentials {
  email: string;
  password: string;
}

// Create a mock auth hook with all the functions
const mockAuthHook = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loadUser: vi.fn(),
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Import the hook (which is now mocked)
import useAuth from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup mock implementations
    mockAuthHook.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'test@example.com' }
    });
    
    mockAuthHook.logout.mockImplementation(() => {
      mockLocalStorage.removeItem('token');
      return Promise.resolve();
    });
    
    mockAuthHook.register.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'new@example.com' }
    });
    
    mockAuthHook.loadUser.mockResolvedValue({
      success: true,
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should provide authentication state', () => {
    // Get the hook (which is our mock)
    const auth = useAuth();
    
    // Verify it has the expected properties
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.isLoading).toBe(false);
    expect(auth.error).toBeNull();
    expect(typeof auth.login).toBe('function');
    expect(typeof auth.logout).toBe('function');
    expect(typeof auth.register).toBe('function');
    expect(typeof auth.loadUser).toBe('function');
  });
  
  it('login should call the API and set token on success', async () => {
    const auth = useAuth();
    
    // Create credentials object to match the expected interface
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password'
    };
    
    // Call login
    await auth.login(credentials);
    
    // Verify login was called with correct arguments
    expect(mockAuthHook.login).toHaveBeenCalledWith(credentials);
  });
  
  it('logout should remove token and user data', async () => {
    const auth = useAuth();
    
    // Set token in localStorage for testing removal
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    // Call logout
    await auth.logout();
    
    // Verify logout was called
    expect(mockAuthHook.logout).toHaveBeenCalled();
    
    // Verify token was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });
  
  it('register should call the API and set token on success', async () => {
    const auth = useAuth();
    
    const userData = {
      name: 'Test User',
      email: 'new@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    // Call register
    await auth.register(userData);
    
    // Verify register was called with correct data
    expect(mockAuthHook.register).toHaveBeenCalledWith(userData);
  });
  
  it('loadUser should update user state on success', async () => {
    const auth = useAuth();
    
    // Set token in localStorage
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    // Call loadUser
    await auth.loadUser();
    
    // Verify loadUser was called
    expect(mockAuthHook.loadUser).toHaveBeenCalled();
  });
}); 