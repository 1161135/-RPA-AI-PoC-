import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PricingApprovalPage } from './PricingApprovalPage';
import { PricingCommandCenter } from './PricingCommandCenter';
import { PricingRulesPage } from './PricingRulesPage';

describe('pricing workbench pages', () => {
  it('shows source-labelled pricing risk and a non-automatic proposal', () => {
    render(<PricingCommandCenter />);
    expect(screen.getByRole('heading', { name: '竞品价格监控与审批' })).toBeInTheDocument();
    expect(screen.getByText(/模拟测算/)).toBeInTheDocument();
    expect(screen.getAllByText(/不自动改价/).length).toBeGreaterThan(0);
  });

  it('moves a price proposal through human approval and records external execution fields', () => {
    render(<PricingApprovalPage />);
    fireEvent.click(screen.getByRole('button', { name: '主管批准' }));
    fireEvent.click(screen.getByRole('button', { name: '提交外部执行' }));
    fireEvent.change(screen.getByLabelText('实际执行价格'), { target: { value: '101' } });
    fireEvent.change(screen.getByLabelText('调价凭证编号'), { target: { value: 'manual-2026-07-26' } });
    fireEvent.click(screen.getByRole('button', { name: '外部执行打卡' }));
    expect(screen.getByTestId('pricing-status')).toHaveTextContent('外部执行已打卡');
    expect(screen.getByText(/manual-2026-07-26/)).toBeInTheDocument();
  });

  it('shows channel-specific rules and a manager-confirmed rollback preview', () => {
    render(<PricingRulesPage />);
    expect(screen.getByRole('heading', { name: '竞品映射与规则中心' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /预览回滚至 v1.0/ }));
    expect(screen.getByText(/主管确认后生效/)).toBeInTheDocument();
  });
});
