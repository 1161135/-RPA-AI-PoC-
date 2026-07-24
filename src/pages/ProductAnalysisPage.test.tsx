import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { ProductAnalysisPage } from './ProductAnalysisPage';

describe('ProductAnalysisPage', () => {
  it('renders SKU metrics derived from source rows', () => {
    render(<CockpitProvider><ProductAnalysisPage /></CockpitProvider>);
    expect(screen.getByRole('heading', { name: '商品分析' })).toBeInTheDocument();
    expect(screen.getByText('SKU-101')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '库存' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'GMV' })).toHaveClass('numeric-cell');
    expect(screen.getAllByText(/¥/)[0].closest('td')).toHaveClass('numeric-cell');
  });
});
