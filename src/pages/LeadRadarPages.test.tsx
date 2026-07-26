import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LeadRadarProvider } from '../hooks/useLeadRadar';
import { PublicLeadRadarPage } from './PublicLeadRadarPage';
import { LeadReviewWorkbenchPage } from './LeadReviewWorkbenchPage';

describe('public lead radar pages', () => {
  it('shows source-labelled lead funnel and high-priority queue', () => {
    render(<LeadRadarProvider><PublicLeadRadarPage /></LeadRadarProvider>);

    expect(screen.getByRole('heading', { name: '公域需求雷达' })).toBeInTheDocument();
    expect(screen.getAllByText(/模拟脱敏数据/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /查看高优先级线索/ }).length).toBeGreaterThan(0);
  });

  it('shows an auditable manual external-action handoff', () => {
    render(<LeadRadarProvider><LeadReviewWorkbenchPage /></LeadRadarProvider>);

    expect(screen.getByRole('heading', { name: '合规审核工作台' })).toBeInTheDocument();
    expect(screen.getAllByText(/不自动发布/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '外部动作打卡' })).toBeInTheDocument();
  });
});
