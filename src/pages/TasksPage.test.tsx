import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { TasksPage } from './TasksPage';

describe('TasksPage', () => {
  it('explains the simulated saved-hours formula and exposes a failure snapshot', () => {
    render(<CockpitProvider><TasksPage /></CockpitProvider>);
    expect(screen.getByText('模拟节省工时计算公式')).toBeInTheDocument();
    expect(screen.getByText(/成功任务数 × 单次标准人工耗时/)).toBeInTheDocument();
    expect(screen.getByText('失败任务快照')).toBeInTheDocument();
  });
});
