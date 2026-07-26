import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeadRadarProvider } from '../hooks/useLeadRadar';
import { PublicLeadRadarPage } from './PublicLeadRadarPage';

describe('public lead radar pages', () => {
  it('shows source-labelled lead funnel and high-priority queue', () => {
    render(<LeadRadarProvider><PublicLeadRadarPage /></LeadRadarProvider>);

    expect(screen.getByRole('heading', { name: '公域需求雷达' })).toBeInTheDocument();
    expect(screen.getAllByText(/模拟脱敏数据/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /查看高优先级线索/ }).length).toBeGreaterThan(0);
  });
});
