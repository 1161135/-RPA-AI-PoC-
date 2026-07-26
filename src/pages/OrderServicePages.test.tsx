import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { AppShell } from '../components/AppShell';
import { OrderServiceWorkbenchPage } from './OrderServiceWorkbenchPage';
import { OrderServiceRulesPage } from './OrderServiceRulesPage';

describe('order service workbench page', () => {
  afterEach(cleanup);
  it('moves an owned order risk through a noted human review', () => {
    render(<CockpitProvider><AppShell><OrderServiceWorkbenchPage /></AppShell></CockpitProvider>);
    expect(screen.getByRole('heading', { name: '订单与售后工作台' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '开始处理' }));
    fireEvent.change(screen.getByLabelText('处理说明'), { target: { value: '已联系仓配核验' } });
    fireEvent.click(screen.getByRole('button', { name: '确认流转' }));
    expect(screen.getByText(/已联系仓配核验/)).toBeInTheDocument();
  });

  it('keeps executive view read-only', () => {
    render(<CockpitProvider><AppShell><OrderServiceWorkbenchPage /></AppShell></CockpitProvider>);
    fireEvent.click(screen.getByRole('button', { name: '管理层' }));
    expect(screen.queryByRole('button', { name: '开始处理' })).not.toBeInTheDocument();
  });

  it('shows separate rule libraries, import protection, and degradation states', () => {
    render(<OrderServiceRulesPage />);
    expect(screen.getByRole('heading', { name: '订单与售后规则中心' })).toBeInTheDocument();
    expect(screen.getByText(/完全降级/)).toBeInTheDocument();
    expect(screen.getByText(/姓名仅保留姓氏/)).toBeInTheDocument();
  });
});
