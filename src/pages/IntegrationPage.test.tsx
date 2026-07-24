import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CockpitProvider } from '../hooks/useCockpitData';
import { IntegrationPage } from './IntegrationPage';

describe('IntegrationPage', () => {
  it('states the three channel adapter statuses and the constrained Power BI hand-off', () => {
    render(<CockpitProvider><IntegrationPage /></CockpitProvider>);

    expect(screen.getByRole('heading', { name: '数据接入与行业规则' })).toBeInTheDocument();
    expect(screen.getByText('淘宝/天猫')).toBeInTheDocument();
    expect(screen.getByText('京东')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(screen.getByText(/CSV、字段字典和连接说明/)).toBeInTheDocument();
    expect(screen.getAllByText(/PoC/)).toHaveLength(2);
  });
});
