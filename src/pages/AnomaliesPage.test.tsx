import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { AppShell } from '../components/AppShell';
import { AnomaliesPage } from './AnomaliesPage';

describe('AnomaliesPage', () => {
  afterEach(cleanup);
  it('moves an operator-owned pending anomaly into progress and persists its audit note', () => {
    localStorage.clear();
    render(<CockpitProvider><AnomaliesPage /></CockpitProvider>);

    expect(screen.getAllByText(/库存风险/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole('button', { name: '开始处理' })[0]);
    fireEvent.change(screen.getByLabelText('处理说明'), { target: { value: '已通知供应链复核' } });
    fireEvent.click(screen.getByRole('button', { name: '确认流转' }));

    expect(screen.getAllByRole('button', { name: '开始处理' }).length).toBeGreaterThan(0);
    expect(localStorage.getItem('rpa-cockpit-anomalies')).toContain('已通知供应链复核');
  });

  it('hides workflow actions for the executive role', () => {
    localStorage.clear();
    render(<CockpitProvider><AppShell><AnomaliesPage /></AppShell></CockpitProvider>);

    fireEvent.click(screen.getByRole('button', { name: '管理层' }));
    expect(screen.queryByRole('button', { name: '开始处理' })).not.toBeInTheDocument();
  });

  it('allows a manager to close a pending anomaly', () => {
    localStorage.clear();
    render(<CockpitProvider><AppShell><AnomaliesPage /></AppShell></CockpitProvider>);

    fireEvent.click(screen.getByRole('button', { name: '运营主管' }));
    expect(screen.getAllByRole('button', { name: '标记已解决' }).length).toBeGreaterThan(0);
  });

  it('does not persist a transition when the acting role changes before confirmation', () => {
    localStorage.clear();
    render(<CockpitProvider><AppShell><AnomaliesPage /></AppShell></CockpitProvider>);
    fireEvent.click(screen.getAllByRole('button', { name: '开始处理' })[0]);
    fireEvent.change(screen.getByLabelText('处理说明'), { target: { value: 'will not persist' } });
    fireEvent.click(screen.getByRole('button', { name: '管理层' }));
    fireEvent.click(screen.getByRole('button', { name: '确认流转' }));
    expect(localStorage.getItem('rpa-cockpit-anomalies')).toBeNull();
  });

  it('filters the visible anomalies by selected channel', () => {
    localStorage.clear();
    render(<CockpitProvider><AppShell><AnomaliesPage /></AppShell></CockpitProvider>);
    expect(screen.getAllByText(/SKU-305/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '抖音' }));
    expect(screen.queryAllByText(/SKU-305/)).toHaveLength(0);
  });

  it('records a structured handling method and shows the selected anomaly context', () => {
    localStorage.clear();
    render(<CockpitProvider><AnomaliesPage /></CockpitProvider>);
    fireEvent.click(screen.getAllByRole('button', { name: '开始处理' })[0]);
    expect(screen.getByText(/当前选定：/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('处理方式'), { target: { value: '已补货' } });
    fireEvent.change(screen.getByLabelText('处理说明'), { target: { value: '仓库确认下午补货' } });
    fireEvent.click(screen.getByRole('button', { name: '确认流转' }));
    expect(screen.getByText(/处理方式：已补货/)).toBeInTheDocument();
  });
});
