import '@testing-library/jest-dom';
import { expect } from '@jest/globals';

// extend expect with matchers
expect.extend({
  toBe(received: any, expected: any) {
    const pass = Object.is(received, expected);
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be ${expected}`
    };
  },
  toContain(received: any, expected: any) {
    const pass = Array.isArray(received) ? received.includes(expected) : received.indexOf(expected) !== -1;
    return {
      pass,
      message: () => `expected ${received} to ${pass ? 'not ' : ''}contain ${expected}`
    };
  }
}); 