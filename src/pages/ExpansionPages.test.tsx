import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OrderServicePage } from './OrderServicePage';
import { CreativeCompliancePage } from './CreativeCompliancePage';

describe('remaining second-phase PoC pages', () => {
  afterEach(cleanup);

  it('shows order routing, an abnormal-order alert and after-sales flow', () => {
    render(<OrderServicePage />);
    expect(screen.getByRole('heading', { name: '订单与售后自动处理' })).toBeInTheDocument();
    expect(screen.getByText(/待人工复核/)).toBeInTheDocument();
    expect(screen.getByText(/售后工单流转/)).toBeInTheDocument();
  });

  it('generates a clearly simulated creative draft and keeps final approval human', () => {
    render(<CreativeCompliancePage />);
    fireEvent.click(screen.getByRole('button', { name: /生成模拟素材/ }));
    expect(screen.getByRole('heading', { name: '合规关键词审核' })).toBeInTheDocument();
    expect(screen.getAllByText(/人工终审/).length).toBeGreaterThan(0);
  });
});
