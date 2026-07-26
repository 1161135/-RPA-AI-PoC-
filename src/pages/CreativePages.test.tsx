import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppShell } from '../components/AppShell';
import { CockpitProvider } from '../hooks/useCockpitData';
import { CreativeReviewPage } from './CreativeReviewPage';

describe('creative compliance pages', () => {
  afterEach(cleanup);
  it('rewrites a weak-risk draft and keeps management read-only', () => {
    render(<CockpitProvider><AppShell><CreativeReviewPage /></AppShell></CockpitProvider>);
    expect(screen.getByRole('heading', { name: '素材审核工作台' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '应用低风险改写' }));
    expect(screen.getByDisplayValue(/建议结合个人情况/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '管理层' }));
    expect(screen.queryByRole('button', { name: '提交审核' })).not.toBeInTheDocument();
  });
});
