import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock CSS imports to avoid Tailwind processing issues during tests
vi.mock('./App.css', () => ({}));

describe('App', () => {
  it('renders without crashing', () => {
    // Use a simple snapshot test instead of trying to find specific text
    const { container } = render(<App />);
    expect(container).toBeTruthy();
    // Basic check that some expected content is rendered
    expect(container.innerHTML).toContain('Vite');
  });
}); 