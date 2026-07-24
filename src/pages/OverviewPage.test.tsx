import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { OverviewPage } from './OverviewPage';
import { AppShell } from '../components/AppShell';

describe('OverviewPage', () => {
  afterEach(cleanup);
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

  it('derives the automation summary from visible channel tasks', () => {
    render(<CockpitProvider><AppShell><OverviewPage /></AppShell></CockpitProvider>);
    expect(screen.getByTestId('automation-failure-count')).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { name: '京东' }));
    expect(screen.getByTestId('automation-failure-count')).toHaveTextContent('0');
  });
});
