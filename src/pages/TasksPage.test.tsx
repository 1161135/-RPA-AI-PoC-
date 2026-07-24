import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { TasksPage } from './TasksPage';
import { AppShell } from '../components/AppShell';

describe('TasksPage', () => {
  afterEach(cleanup);
  it('explains the simulated saved-hours formula and exposes a failure snapshot', () => {
    render(<CockpitProvider><TasksPage /></CockpitProvider>);
    expect(screen.getByText('模拟节省工时计算公式')).toBeInTheDocument();
    expect(screen.getByText(/成功任务数 × 单次标准人工耗时/)).toBeInTheDocument();
    expect(screen.getByText('失败任务快照')).toBeInTheDocument();
  });

  it('filters task status and saved-hours summary by the selected channels', () => {
    render(<CockpitProvider><AppShell><TasksPage /></AppShell></CockpitProvider>);
    expect(screen.getByTestId('task-jd')).toBeInTheDocument();
    expect(screen.getByTestId('automation-successful-runs')).toHaveTextContent('186');
    fireEvent.click(screen.getByRole('button', { name: '\u4eac\u4e1c' }));
    expect(screen.queryByTestId('task-jd')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '\u6dd8\u5b9d/\u5929\u732b' }));
    expect(screen.getByTestId('automation-successful-runs')).toHaveTextContent('100');
  });
});
