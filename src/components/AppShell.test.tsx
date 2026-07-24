import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';
import { CockpitProvider, useCockpitContext } from '../hooks/useCockpitData';

function ChannelProbe() {
  const { filters, role } = useCockpitContext();
  return <output data-testid="cockpit-context">{`${filters.period}|${filters.channels.join(',')}|${role}`}</output>;
}

describe('AppShell', () => {
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
});
