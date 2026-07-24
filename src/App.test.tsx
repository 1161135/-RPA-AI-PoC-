import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the cockpit title in Chinese', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '智营 RPA 数据驾驶舱' })).toBeInTheDocument();
  });
});
