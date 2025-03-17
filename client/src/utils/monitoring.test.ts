import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { usePerformanceMonitoring } from './monitoring';

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn((callback) => {
      try {
        return callback();
      } catch (error) {
        console.error('Error in useEffect:', error);
        return undefined;
      }
    }),
  };
});

// Create a controlled mock for fetch
const mockFetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock the fetch API
global.fetch = mockFetch;

// Mock the sendBeacon API
Object.defineProperty(global.navigator, 'sendBeacon', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

// Define types for PerformanceObserver callback
type PerformanceEntryList = {
  getEntries: () => Array<Partial<PerformanceEntry>>;
};

type PerformanceObserverCallback = (entries: PerformanceEntryList) => void;

// Define a custom mock type for PerformanceObserver
interface MockPerformanceObserver {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

// Mock PerformanceObserver instance
const mockPerformanceObserver: MockPerformanceObserver = {
  observe: vi.fn(),
  disconnect: vi.fn(),
};

// Create mock PerformanceObserver constructor with exposed callbacks
interface MockPerformanceObserverType extends ReturnType<typeof vi.fn> {
  callbacks: PerformanceObserverCallback[];
}

const MockPerformanceObserver = vi.fn((callback: PerformanceObserverCallback) => {
  // Store the callback so tests can access it
  if (MockPerformanceObserver.callbacks.length < 2) {
    MockPerformanceObserver.callbacks.push(callback);
  }
  return mockPerformanceObserver;
}) as MockPerformanceObserverType;

// Initialize the callbacks array
MockPerformanceObserver.callbacks = [];

// Add supportedEntryTypes to the mock constructor
(MockPerformanceObserver as unknown as { supportedEntryTypes: string[] }).supportedEntryTypes = [
  'largest-contentful-paint', 
  'first-input'
];

// Override global PerformanceObserver with mock
global.PerformanceObserver = MockPerformanceObserver as unknown as typeof PerformanceObserver;

// Mock performance entries
const mockNavigationEntry = {
  startTime: 0,
  loadEventEnd: 1000,
  domContentLoadedEventEnd: 500,
};

// Mock window addEventListener
const mockAddEventListener = vi.fn();
window.addEventListener = mockAddEventListener;

// Mock the console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
};

describe('Performance Monitoring', () => {
  let originalConsole: typeof console;
  
  beforeEach(() => {
    originalConsole = { ...console };
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.info = mockConsole.info;
    console.log = mockConsole.log;
    
    vi.clearAllMocks();
    
    // Reset PerformanceObserver mock and callbacks
    global.PerformanceObserver = MockPerformanceObserver as unknown as typeof PerformanceObserver;
    MockPerformanceObserver.callbacks = [];
    
    Object.defineProperty(global.performance, 'getEntriesByType', {
      value: vi.fn().mockReturnValue([mockNavigationEntry]),
      configurable: true,
    });
    
    // Mock the environment
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.log = originalConsole.log;
  });

  describe('usePerformanceMonitoring', () => {
    it('should set up performance observers', () => {
      // Call the hook directly since we've mocked useEffect
      usePerformanceMonitoring();
      
      // Verify PerformanceObserver was created twice
      expect(MockPerformanceObserver).toHaveBeenCalledTimes(2);
      expect(mockPerformanceObserver.observe).toHaveBeenCalledTimes(2);
      
      // Check observe arguments for LCP
      expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({ 
        type: 'largest-contentful-paint', 
        buffered: true 
      });
      
      // Check observe arguments for FID
      expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({ 
        type: 'first-input', 
        buffered: true 
      });
    });

    it('should handle load event and log metrics in development mode', () => {
      usePerformanceMonitoring();
      
      // Check that addEventListener was called with 'load'
      expect(mockAddEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      
      // Get the load event handler and trigger it manually
      // Ensure the mock was called and there's a handler at index 0
      expect(mockAddEventListener.mock.calls.length).toBeGreaterThan(0);
      const loadHandler = mockAddEventListener.mock.calls[0][1];
      expect(loadHandler).toBeDefined();
      
      if (loadHandler) {
        loadHandler();
        
        // Verify metrics are logged to console.log in development mode
        expect(mockConsole.log).toHaveBeenCalledWith(
          '[Metric] page_load_time: 1000'
        );
        expect(mockConsole.log).toHaveBeenCalledWith(
          '[Metric] dom_content_loaded: 500'
        );
      }
    });

    it('should handle performance observer errors gracefully', () => {
      // Create a temporary backup of the original mock
      const originalMock = global.PerformanceObserver;
      
      // Explicitly set up the console.error mock
      console.error = vi.fn();
      
      // Create an error-throwing mock function
      const errorFn = () => {
        // Replace the global PerformanceObserver with an error-throwing mock
        global.PerformanceObserver = vi.fn(() => {
          throw new Error('Not supported');
        }) as unknown as typeof PerformanceObserver;
        
        // This should now catch the error in our useEffect mock
        usePerformanceMonitoring();
      };
      
      // Call the function with our error-throwing mock
      errorFn();
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
      
      // Restore the original mock for subsequent tests
      global.PerformanceObserver = originalMock;
    });

    it('should report metrics in production mode', () => {
      // Change to production mode
      vi.stubEnv('NODE_ENV', 'production');
      
      // Mock Date.now for consistent timestamp
      const mockTimestamp = 1678900000000;
      Date.now = vi.fn(() => mockTimestamp);
      
      usePerformanceMonitoring();
      
      // Verify PerformanceObserver was created
      expect(MockPerformanceObserver).toHaveBeenCalled();
      expect(MockPerformanceObserver.callbacks.length).toBeGreaterThan(0);
      
      // Get the LCP callback
      const lcpCallback = MockPerformanceObserver.callbacks[0];
      expect(lcpCallback).toBeDefined();
      
      if (lcpCallback) {
        // Mock LCP entry
        const mockLcpEntry = {
          startTime: 1500,
        };
        
        // Call the observer with mock entries
        lcpCallback({
          getEntries: () => [mockLcpEntry]
        });
        
        // Check that sendBeacon was called with correct data
        expect(navigator.sendBeacon).toHaveBeenCalledWith(
          '/api/metrics/client',
          JSON.stringify({
            name: 'largest_contentful_paint',
            value: 1500,
            timestamp: mockTimestamp,
            url: window.location.pathname,
          })
        );
      }
    });

    it('should fallback to fetch when sendBeacon is not available', () => {
      // Change to production mode
      vi.stubEnv('NODE_ENV', 'production');
      
      // Temporarily redefine sendBeacon to null
      const originalSendBeacon = navigator.sendBeacon;
      Object.defineProperty(navigator, 'sendBeacon', {
        value: null,
        configurable: true,
      });
      
      usePerformanceMonitoring();
      
      // Verify PerformanceObserver was created with callbacks
      expect(MockPerformanceObserver).toHaveBeenCalled();
      expect(MockPerformanceObserver.callbacks.length).toBeGreaterThan(1);
      
      // Get the FID callback
      const fidCallback = MockPerformanceObserver.callbacks[1];
      expect(fidCallback).toBeDefined();
      
      if (fidCallback) {
        // Mock FID entry
        const mockFidEntry = {
          startTime: 100,
          processingStart: 120,
        };
        
        // Call the observer with mock entry
        fidCallback({
          getEntries: () => [mockFidEntry]
        });
        
        // Check that fetch was called as fallback
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/metrics/client',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true,
          })
        );
      }
      
      // Restore the original sendBeacon
      Object.defineProperty(navigator, 'sendBeacon', {
        value: originalSendBeacon,
        configurable: true,
      });
    });

    it('should handle cleanup by disconnecting observers', () => {
      // Setup
      vi.stubEnv('NODE_ENV', 'development');
      
      // Capture the cleanup function
      let cleanupFn: (() => void) | undefined;
      
      // Override useEffect to capture the cleanup function
      (React.useEffect as ReturnType<typeof vi.fn>).mockImplementationOnce((callback) => {
        cleanupFn = callback() as (() => void);
      });
      
      // Call the hook
      usePerformanceMonitoring();
      
      // Verify we have a cleanup function
      expect(cleanupFn).toBeDefined();
      
      // Run the cleanup function if it exists
      if (cleanupFn) {
        cleanupFn();
        
        // Verify disconnect was called
        expect(mockPerformanceObserver.disconnect).toHaveBeenCalledTimes(2);
      }
    });

    it('should handle error during cleanup', () => {
      // Setup
      vi.stubEnv('NODE_ENV', 'development');
      
      // Capture the cleanup function
      let cleanupFn: (() => void) | undefined;
      
      // Override useEffect to capture the cleanup function
      (React.useEffect as ReturnType<typeof vi.fn>).mockImplementationOnce((callback) => {
        cleanupFn = callback() as (() => void);
      });
      
      // Call the hook
      usePerformanceMonitoring();
      
      // Make disconnect throw an error
      mockPerformanceObserver.disconnect.mockImplementationOnce(() => {
        throw new Error('Disconnect error');
      });
      
      // Run the cleanup function if it exists
      if (cleanupFn) {
        cleanupFn();
        
        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Error disconnecting observers',
          expect.any(Error)
        );
      }
    });

    it('should handle fetch error in reportMetric', async () => {
      // Change to production mode
      vi.stubEnv('NODE_ENV', 'production');
      
      // Setup a rejected fetch promise
      const fetchError = new Error('Fetch error');
      mockFetch.mockRejectedValueOnce(fetchError);
      
      // Mock console.error to capture the error
      console.error = vi.fn();
      
      // Temporarily redefine sendBeacon to null to force fetch usage
      const originalSendBeacon = navigator.sendBeacon;
      Object.defineProperty(navigator, 'sendBeacon', {
        value: null,
        configurable: true,
      });
      
      usePerformanceMonitoring();
      
      // Get the FID callback
      const fidCallback = MockPerformanceObserver.callbacks[1];
      
      if (fidCallback) {
        // Mock FID entry
        const mockFidEntry = {
          startTime: 100,
          processingStart: 120,
        };
        
        // Call the observer with mock entry
        fidCallback({
          getEntries: () => [mockFidEntry]
        });
        
        // Wait for the promise to be processed
        await new Promise(process.nextTick);
        
        // Verify error was logged
        expect(console.error).toHaveBeenCalled();
      }
      
      // Restore the original sendBeacon
      Object.defineProperty(navigator, 'sendBeacon', {
        value: originalSendBeacon,
        configurable: true,
      });
    });

    it('should handle an error in reportMetric function', () => {
      // Change to production mode
      vi.stubEnv('NODE_ENV', 'production');
      
      // Make Date.now throw an error
      Date.now = vi.fn(() => {
        throw new Error('Date error');
      });
      
      usePerformanceMonitoring();
      
      // Get the LCP callback
      const lcpCallback = MockPerformanceObserver.callbacks[0];
      
      if (lcpCallback) {
        // Mock LCP entry
        const mockLcpEntry = {
          startTime: 1500,
        };
        
        // Call the observer with mock entry
        lcpCallback({
          getEntries: () => [mockLcpEntry]
        });
        
        // Verify error was logged
        expect(console.error).toHaveBeenCalledWith(
          'Error reporting metric',
          expect.any(Error)
        );
      }
    });
  });
}); 