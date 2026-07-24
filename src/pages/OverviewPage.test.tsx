import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { OverviewPage } from './OverviewPage';

describe('OverviewPage', () => {
  it('derives business KPIs from the selected source rows and separates automation health', () => {
    render(
      <CockpitProvider>
        <OverviewPage />
      </CockpitProvider>,
    );

    expect(screen.getByRole('heading', { name: '经营总览' })).toBeInTheDocument();
    expect(screen.getByText('GMV')).toBeInTheDocument();
    expect(screen.getByText('自动化运行摘要')).toBeInTheDocument();
    expect(screen.getByText('GMV 渠道趋势')).toBeInTheDocument();
    expect(screen.getByText('渠道贡献')).toBeInTheDocument();
  });
});
