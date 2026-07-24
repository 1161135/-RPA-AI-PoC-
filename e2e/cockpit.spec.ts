import { expect, test } from '@playwright/test';
import { test as vitest } from 'vitest';

// Vitest's default glob also picks up `*.spec.ts`; Playwright owns this suite.
if (process.env.VITEST) {
  vitest.skip('由 Playwright 执行的端到端测试', () => {});
} else test.describe('智营 RPA 数据驾驶舱', () => {
  test('运营专员可以完成异常处理闭环', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '智营 RPA 数据驾驶舱' })).toBeVisible();
    await expect(page.getByText('模拟数据 · 每日 08:30 刷新')).toBeVisible();

    await page.locator('a[href="#anomalies"]').click();
    await expect(page.getByRole('heading', { name: '异常中心' })).toBeVisible();

    await page.getByRole('button', { name: '开始处理' }).first().click();
    await page.getByLabel('处理说明').fill('已复核并完成处理。');
    await page.getByRole('button', { name: '确认流转' }).click();

    await expect(page.getByTestId('anomaly-status-conversion-SKU-305')).toHaveText('处理中');
  });

  test('管理层仅查看异常，不能执行流程操作', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理层' }).click();
    await page.locator('a[href="#anomalies"]').click();

    await expect(page.getByRole('heading', { name: '异常中心' })).toBeVisible();
    await expect(page.getByRole('button', { name: '开始处理' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '标记已解决' })).toHaveCount(0);
  });
});
