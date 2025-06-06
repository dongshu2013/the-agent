/**
 * Jest test setup file
 * Configures the testing environment for DOM Analyzer V2 tests
 */

// Mock Chrome APIs for testing
global.chrome = {
  scripting: {
    executeScript: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    getCurrent: jest.fn(),
  },
  runtime: {
    lastError: null,
  },
  debugger: {
    attach: jest.fn(),
    detach: jest.fn(),
    sendCommand: jest.fn(),
  },
  sidePanel: {
    setOptions: jest.fn(),
    setPanelBehavior: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
} as any;

// Suppress console.log in tests unless needed for debugging
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  // Only log if we're in debug mode
  if (process.env.NODE_ENV === 'debug') {
    originalConsoleLog(...args);
  }
};

// Add any other global test setup here
export {};
