import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { afterEach } from 'vitest';
import { AppShell } from './AppShell';
import { CockpitProvider, useCockpitContext } from '../hooks/useCockpitData';

function ChannelProbe() {
  const { filters, role } = useCockpitContext();
  return <output data-testid="cockpit-context">{`${filters.period}|${filters.channels.join(',')}|${role}`}</output>;
}

describe('AppShell', () => {
  afterEach(cleanup);

  it('keeps the channel selector and shared cockpit context in sync', () => {
    render(
      <CockpitProvider>
        <AppShell><ChannelProbe /></AppShell>
      </CockpitProvider>,
    );

    expect(screen.getByTestId('cockpit-context')).toHaveTextContent('yesterday|tmall,jd,douyin|operator');
    fireEvent.click(screen.getByRole('button', { name: '京东' }));
    expect(screen.getByTestId('cockpit-context')).toHaveTextContent('yesterday|tmall,douyin|operator');
    fireEvent.click(screen.getByRole('button', { name: '管理层' }));
    expect(screen.getByTestId('cockpit-context')).toHaveTextContent('yesterday|tmall,douyin|executive');
  });

  it('calls the export handler from the global report button', () => {
    const onExport = vi.fn();
    render(<CockpitProvider><AppShell onExport={onExport}><span>内容</span></AppShell></CockpitProvider>);

    fireEvent.click(screen.getByRole('button', { name: /导出当前报表/ }));
    expect(onExport).toHaveBeenCalledOnce();
  });
});
