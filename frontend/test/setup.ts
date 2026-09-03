import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  pathname: '/'
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: navigationMocks.push,
    refresh: navigationMocks.refresh,
    back: navigationMocks.back
  }),
  usePathname: () => navigationMocks.pathname
}));

vi.mock('@/config', () => ({ API_URL: 'http://api.test' }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverMock
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  navigationMocks.push.mockReset();
  navigationMocks.refresh.mockReset();
  navigationMocks.back.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
