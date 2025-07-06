// Jest setup file to configure test environment

// Suppress console.log during tests unless they fail
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

// Only log if test fails or if explicitly enabled
console.log = (...args) => {
  if (process.env.JEST_VERBOSE === 'true' || args.some(arg => 
    typeof arg === 'string' && (
      arg.includes('[ERROR]') || 
      arg.includes('[FAIL]') ||
      arg.includes('analysis time:') ||
      arg.includes('cache')))) {
    originalConsoleLog(...args);
  }
};

console.warn = (...args) => {
  if (process.env.JEST_VERBOSE === 'true' || args.some(arg => 
    typeof arg === 'string' && (
      arg.includes('[ERROR]') || 
      arg.includes('[FAIL]')))) {
    originalConsoleWarn(...args);
  }
};

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  // Clear any timers or intervals
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Set up performance timing
global.performance = global.performance || {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
}; 