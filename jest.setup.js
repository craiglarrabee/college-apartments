// jest.setup.js
import '@testing-library/jest-dom';

// Polyfill for MessageChannel (needed for React 19 with jsdom)
if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = {
        postMessage: jest.fn(),
        onmessage: null,
        close: jest.fn(),
      };
      this.port2 = {
        postMessage: jest.fn(),
        onmessage: null,
        close: jest.fn(),
      };
    }
  };
}

// Polyfill requestSubmit used by some forms
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function submitPolyfill(submitter) {
    if (submitter) {
      submitter.click();
    } else {
      const button = document.createElement('button');
      button.type = 'submit';
      button.style.display = 'none';
      this.appendChild(button);
      button.click();
      this.removeChild(button);
    }
  };
}

// Mock window.location
const originalLocation = window.location;
let mockedHref = '';
Object.defineProperty(window, 'location', {
  configurable: true,
  get() {
    return {
      ...originalLocation,
      assign: jest.fn((val) => {
        mockedHref = val;
      }),
      reload: jest.fn(),
      replace: jest.fn((val) => {
        mockedHref = val;
      }),
      get href() {
        return mockedHref || '';
      },
      set href(val) {
        mockedHref = val;
      },
    };
  },
  set(val) {
    mockedHref = val;
  },
});

// Mock Next.js router
jest.mock('next/router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
  };
  return {
    useRouter: () => router,
    Router: router,
  };
});

// Suppress specific console errors/warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

const suppressedMessages = [
  'React does not recognize the `controlId` prop',
  'You provided a `checked` prop to a form field without an `onChange` handler',
  'The current testing environment is not configured to support act',
  'Each child in a list should have a unique "key" prop',
  'HTMLFormElement.prototype.requestSubmit',
];

beforeAll(() => {
  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (suppressedMessages.some((snippet) => message.includes(snippet))) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
