import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LeadRadarProvider } from '../hooks/useLeadRadar';
import { PublicLeadRadarPage } from './PublicLeadRadarPage';
import { LeadReviewWorkbenchPage } from './LeadReviewWorkbenchPage';
import { LeadImportRulesPage } from './LeadImportRulesPage';

describe('public lead radar pages', () => {
  afterEach(cleanup);
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

  it('explains local CSV intake and rule version rollback', () => {
    render(<LeadRadarProvider><LeadImportRulesPage /></LeadRadarProvider>);

    expect(screen.getByRole('heading', { name: '导入与规则中心' })).toBeInTheDocument();
    expect(screen.getByLabelText('导入脱敏 CSV')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /预览回滚至 v1.0/ })).toBeInTheDocument();
  });

  it('shows line-level local validation feedback for a rejected CSV row', async () => {
    render(<LeadRadarProvider><LeadImportRulesPage /></LeadRadarProvider>);
    const file = new File(['channel,contentId,comment,occurredAt\ndouyin,x,联系我 13800138000,2026-07-26'], 'samples.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText('导入脱敏 CSV'), { target: { files: [file] } });

    expect(await screen.findByText(/第 2 行/)).toBeInTheDocument();
    expect(screen.getByText(/可识别个人信息/)).toBeInTheDocument();
  });
});
