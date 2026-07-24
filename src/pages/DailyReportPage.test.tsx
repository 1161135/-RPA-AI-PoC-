import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { DailyReportPage } from './DailyReportPage';

describe('DailyReportPage', () => {
  it('presents yesterday as conclusions, reasons and recommended actions', () => {
    render(<CockpitProvider><DailyReportPage /></CockpitProvider>);
    expect(screen.getByRole('heading', { name: '每日经营日报' })).toBeInTheDocument();
    expect(screen.getByText('昨天发生什么')).toBeInTheDocument();
    expect(screen.getByText('今天建议做什么')).toBeInTheDocument();
  });
});
