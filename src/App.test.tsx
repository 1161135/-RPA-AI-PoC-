import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the cockpit overview and linked operational pages', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '经营总览' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '每日经营日报' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '商品分析' })).toBeInTheDocument();
  });
});
