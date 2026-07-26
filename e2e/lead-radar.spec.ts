import { expect, test } from '@playwright/test';
import { test as vitest } from 'vitest';

if (process.env.VITEST) {
  vitest.skip('由 Playwright 执行的公域需求雷达端到端测试', () => {});
} else test('operator completes the public lead review handoff without automatic publishing', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="#public-lead-radar"]').click();
  await expect(page.getByRole('heading', { name: '公域需求雷达' })).toBeVisible();
  await page.getByRole('button', { name: /查看高优先级线索/ }).first().click();
  await expect(page.getByRole('heading', { name: '合规审核工作台' })).toBeVisible();
  await page.getByRole('button', { name: '人工确认' }).click();
  await expect(page.getByTestId('lead-status-lead-001')).toHaveText('待外部执行');
  await page.getByRole('button', { name: '外部动作打卡' }).click();
  await expect(page.getByTestId('lead-status-lead-001')).toHaveText('外部执行已打卡');
  await expect(page.getByText(/external_action_logged/)).toBeVisible();
  await expect(page.getByText('AI 仅生成脱敏科普草稿；系统不自动发布、不保存平台账号信息。', { exact: true })).toBeVisible();
});
