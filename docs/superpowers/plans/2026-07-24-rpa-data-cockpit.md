# 智营 RPA 数据驾驶舱 PoC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, browser-based e-commerce RPA data cockpit PoC using simulated Tmall, JD, and Douyin data, with unified metrics, anomaly workflow, task observability, and Power BI-ready CSV exports.

**Architecture:** A Vite React TypeScript app keeps source adapters, normalized domain models, metrics/anomaly services, and UI components in separate folders. Simulated channel adapters feed a unified in-memory dataset; filters drive all pages; anomaly state transitions persist in browser local storage. The app exports the currently filtered, de-identified dataset and a fixed daily-report summary CSV.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Recharts, Vitest, React Testing Library, Playwright, CSS custom properties.

---

## File structure

```text
package.json                         Tool scripts and dependencies
vite.config.ts                       Vite and Vitest configuration
playwright.config.ts                 Browser test configuration
src/main.tsx                         React bootstrap
src/App.tsx                          Route and application-shell composition
src/styles/global.css                Design tokens, responsive layout, component styles
src/domain/types.ts                  Stable domain types and role permissions
src/data/mock-data.ts                Deterministic, de-identified source fixtures
src/adapters/channelAdapter.ts       Replaceable channel-adapter contract
src/adapters/mockAdapters.ts         Tmall/JD/Douyin simulated adapters
src/services/metrics.ts              Unified metric, contribution and ROI calculations
src/services/anomalies.ts            Deterministic anomaly detection and workflow validation
src/services/export.ts               Browser CSV generators and downloads
src/services/storage.ts              Local-storage persistence for anomaly state
src/hooks/useCockpitData.ts          Filtered data and computed-view hook
src/components/AppShell.tsx          Navigation, filter bar, role selector and freshness badge
src/components/KpiCard.tsx           Business and automation KPI card
src/components/TrendChart.tsx        Accessible GMV trend chart with axes and tooltip
src/components/ChannelContribution.tsx Channel amount/share chart
src/components/AnomalyList.tsx       Clickable anomaly summary/list
src/pages/OverviewPage.tsx           Home dashboard
src/pages/DailyReportPage.tsx        Narrative daily report
src/pages/ProductAnalysisPage.tsx    SKU analysis
src/pages/AnomaliesPage.tsx          Anomaly detail and workflow actions
src/pages/TasksPage.tsx              RPA task status and logs
src/pages/IntegrationPage.tsx        Adapter, rule-pack and Power BI delivery guidance
src/test/setup.ts                    DOM matcher setup
src/**/*.test.ts(x)                  Unit and component tests
e2e/cockpit.spec.ts                  Browser acceptance tests
README.md                            Local run and demonstration instructions
```

### Task 1: Bootstrap the local application and stable domain model

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/domain/types.ts`
- Create: `src/test/setup.ts`
- Create: `src/domain/types.test.ts`

- [ ] **Step 1: Write the failing domain-permission test.**

```ts
import { describe, expect, it } from 'vitest';
import { canTransitionAnomaly } from './types';

describe('role permissions', () => {
  it('allows an operator to claim an anomaly but blocks management edits', () => {
    expect(canTransitionAnomaly('operator', 'pending', 'in_progress')).toBe(true);
    expect(canTransitionAnomaly('executive', 'pending', 'in_progress')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the project has not been created.**

Run: `npm test -- --run src/domain/types.test.ts`

Expected: command fails because `package.json` or the test file does not exist.

- [ ] **Step 3: Create the minimal Vite/Vitest project and domain contract.**

```json
{
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "test": "vitest", "test:run": "vitest run", "test:e2e": "playwright test" },
  "dependencies": { "@vitejs/plugin-react": "latest", "recharts": "latest", "react": "latest", "react-dom": "latest", "react-router-dom": "latest", "vite": "latest", "typescript": "latest" },
  "devDependencies": { "@playwright/test": "latest", "@testing-library/jest-dom": "latest", "@testing-library/react": "latest", "jsdom": "latest", "vitest": "latest" }
}
```

```ts
export type Role = 'operator' | 'manager' | 'executive';
export type AnomalyStatus = 'pending' | 'in_progress' | 'resolved' | 'ignored';
export type ChannelId = 'tmall' | 'jd' | 'douyin';
export type AnomalySeverity = 'high' | 'medium';

export type Anomaly = { id: string; type: string; severity: AnomalySeverity; status: AnomalyStatus; owner: string; title: string; detail: string; recommendation: string; createdAt: string; history: Array<{ at: string; by: Role; status: AnomalyStatus; note: string }> };

const allowed: Record<Role, Record<AnomalyStatus, AnomalyStatus[]>> = {
  operator: { pending: ['in_progress'], in_progress: ['resolved', 'ignored'], resolved: [], ignored: [] },
  manager: { pending: ['in_progress', 'resolved', 'ignored'], in_progress: ['resolved', 'ignored'], resolved: ['in_progress'], ignored: ['in_progress'] },
  executive: { pending: [], in_progress: [], resolved: [], ignored: [] }
};

export const canTransitionAnomaly = (role: Role, from: AnomalyStatus, to: AnomalyStatus) => allowed[role][from].includes(to);
```

- [ ] **Step 4: Add minimal bootstrap files.**

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
```

```tsx
export default function App() { return <main><h1>智营 RPA 数据驾驶舱</h1></main>; }
```

- [ ] **Step 5: Run the unit test and production build.**

Run: `npm install && npm run test:run && npm run build`

Expected: the role-permission test passes and Vite emits `dist/`.

- [ ] **Step 6: Commit the bootstrap.**

Run: `git add package.json vite.config.ts index.html src && git commit -m "feat: bootstrap cockpit application"`

### Task 2: Add source adapters, unified metrics, ROI, and anomaly rules

**Files:**
- Create: `src/data/mock-data.ts`
- Create: `src/adapters/channelAdapter.ts`
- Create: `src/adapters/mockAdapters.ts`
- Create: `src/services/metrics.ts`
- Create: `src/services/anomalies.ts`
- Create: `src/services/metrics.test.ts`
- Create: `src/services/anomalies.test.ts`

- [ ] **Step 1: Write failing calculation and rule tests.**

```ts
it('calculates GMV only from paid orders and reports refunds separately', () => {
  expect(calculateMetrics([{ paidAmount: 100, refundedAmount: 10, visits: 20, paidOrders: 2 }])).toMatchObject({ gmv: 100, refunds: 10, conversionRate: 0.1, aov: 50 });
});

it('creates a high inventory anomaly below three sellable days', () => {
  expect(detectAnomalies([{ sku: 'SKU-203', stock: 8, averageDailySales: 3 }], [])).toEqual(expect.arrayContaining([expect.objectContaining({ type: '库存风险', severity: 'high' })]));
});
```

- [ ] **Step 2: Run the tests and verify the imports are unresolved.**

Run: `npm test -- --run src/services/metrics.test.ts src/services/anomalies.test.ts`

Expected: FAIL because the service modules do not exist.

- [ ] **Step 3: Define the adapter boundary and deterministic source fixtures.**

```ts
export interface ChannelAdapter<T> { channel: 'tmall' | 'jd' | 'douyin'; load(): Promise<T[]>; lastSuccessfulAt: string; status: 'success' | 'failed'; }
```

```ts
export const sourceRows = [
  { date: '2026-07-23', channel: 'tmall', sku: 'SKU-101', visits: 1400, paidOrders: 84, paidAmount: 12480, refundedAmount: 420, stock: 320, averageDailySales: 18 },
  { date: '2026-07-23', channel: 'jd', sku: 'SKU-203', visits: 760, paidOrders: 29, paidAmount: 4350, refundedAmount: 0, stock: 8, averageDailySales: 3 },
  { date: '2026-07-23', channel: 'douyin', sku: 'SKU-305', visits: 1100, paidOrders: 31, paidAmount: 3720, refundedAmount: 120, stock: 160, averageDailySales: 7 }
];
```

- [ ] **Step 4: Implement metric and anomaly services.**

```ts
export function calculateMetrics(rows: Array<{ paidAmount: number; refundedAmount: number; visits: number; paidOrders: number }>) {
  const gmv = rows.reduce((sum, row) => sum + row.paidAmount, 0);
  const refunds = rows.reduce((sum, row) => sum + row.refundedAmount, 0);
  const visits = rows.reduce((sum, row) => sum + row.visits, 0);
  const paidOrders = rows.reduce((sum, row) => sum + row.paidOrders, 0);
  return { gmv, refunds, visits, paidOrders, conversionRate: visits ? paidOrders / visits : 0, aov: paidOrders ? gmv / paidOrders : 0 };
}

export const calculateSavedHours = (successfulRuns: number, manualMinutes: number) => successfulRuns * manualMinutes / 60;
```

```ts
export function detectAnomalies(products: Array<{ sku: string; stock: number; averageDailySales: number }>, existing: import('../domain/types').Anomaly[]) {
  const inventory = products.filter(p => p.stock / p.averageDailySales < 3).map(p => ({ id: `stock-${p.sku}`, type: '库存风险', severity: 'high' as const, status: 'pending' as const, owner: '供应链专员', title: `${p.sku} 库存可售天数低于 3 天`, detail: '需要复核库存并创建补货跟进。', recommendation: '复核库存并安排补货', createdAt: '2026-07-24T08:30:00', history: [] }));
  return [...existing, ...inventory];
}
```

- [ ] **Step 5: Run all service tests.**

Run: `npm run test:run -- src/services/metrics.test.ts src/services/anomalies.test.ts`

Expected: PASS, including GMV/refund separation and inventory alert detection.

- [ ] **Step 6: Commit the data domain.**

Run: `git add src/data src/adapters src/services src/domain src/**/*.test.ts && git commit -m "feat: add cockpit metrics and anomaly rules"`

### Task 3: Build shared state, filters, layout, and accessible visual system

**Files:**
- Create: `src/hooks/useCockpitData.ts`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/KpiCard.tsx`
- Create: `src/styles/global.css`
- Create: `src/components/AppShell.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write a failing filter test.**

```tsx
it('changes all dashboard data when the channel filter changes', async () => {
  render(<AppShell><span data-testid="value">淘宝/天猫</span></AppShell>);
  await userEvent.selectOptions(screen.getByLabelText('渠道'), 'jd');
  expect(screen.getByTestId('value')).toHaveTextContent('京东');
});
```

- [ ] **Step 2: Run it and confirm the component import fails.**

Run: `npm test -- --run src/components/AppShell.test.tsx`

Expected: FAIL because `AppShell` is absent.

- [ ] **Step 3: Implement one shared filter store/hook.**

```ts
export type FilterState = { period: 'yesterday' | 'seven_days' | 'month' | 'custom'; channels: import('../domain/types').ChannelId[]; role: import('../domain/types').Role };
export const defaultFilters: FilterState = { period: 'yesterday', channels: ['tmall', 'jd', 'douyin'], role: 'operator' };
```

The hook must derive filtered rows and expose `setPeriod`, `setChannels`, and `setRole`; it must never duplicate metric calculations inside page components.

- [ ] **Step 4: Implement the shell with required global controls.**

```tsx
<header>
  <span className="eyebrow">模拟数据 · 每日 08:30 刷新</span>
  <label>时间<select aria-label="时间"><option value="yesterday">昨日</option><option value="seven_days">近 7 天</option><option value="month">本月</option><option value="custom">自定义</option></select></label>
  <label>渠道<select aria-label="渠道" multiple>{['tmall','jd','douyin'].map(channel => <option key={channel} value={channel}>{channel === 'tmall' ? '淘宝/天猫' : channel === 'jd' ? '京东' : '抖音'}</option>)}</select></label>
  <label>角色<select aria-label="角色"><option value="operator">运营专员</option><option value="manager">运营主管</option><option value="executive">管理层</option></select></label>
</header>
```

- [ ] **Step 5: Add responsive tokens and status styles.**

```css
:root { --bg:#f6f8fb; --surface:#fff; --text:#182230; --muted:#62748a; --brand:#2563eb; --high:#c2410c; --medium:#b7791f; --ok:#15803d; }
.app-shell { min-height:100vh; background:var(--bg); color:var(--text); }
.status-high { color:var(--high); } .status-medium { color:var(--medium); } .status-ok { color:var(--ok); }
@media (max-width: 860px) { .sidebar { display:none; } .metric-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
```

- [ ] **Step 6: Run component tests and the build.**

Run: `npm run test:run -- src/components/AppShell.test.tsx && npm run build`

Expected: PASS and a responsive application shell builds.

- [ ] **Step 7: Commit layout and shared state.**

Run: `git add src/hooks src/components src/styles src/App.tsx && git commit -m "feat: add cockpit filters and shell"`

### Task 4: Implement overview, report, product, and task pages

**Files:**
- Create: `src/components/TrendChart.tsx`
- Create: `src/components/ChannelContribution.tsx`
- Create: `src/pages/OverviewPage.tsx`
- Create: `src/pages/DailyReportPage.tsx`
- Create: `src/pages/ProductAnalysisPage.tsx`
- Create: `src/pages/TasksPage.tsx`
- Create: `src/pages/OverviewPage.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write a failing overview test.**

```tsx
it('shows business KPIs separately from automation observability', () => {
  render(<OverviewPage />);
  expect(screen.getByRole('heading', { name: '经营总览' })).toBeInTheDocument();
  expect(screen.getByText('GMV')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '自动化运行摘要' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify the test fails before implementation.**

Run: `npm test -- --run src/pages/OverviewPage.test.tsx`

Expected: FAIL because the page module does not exist.

- [ ] **Step 3: Implement reusable chart components with chart semantics.**

```tsx
<ResponsiveContainer width="100%" height={280}>
  <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={v => `¥${v / 1000}k`} /><Tooltip formatter={(value: number) => `¥${value.toLocaleString('zh-CN')}`} /><Legend /><Line dataKey="tmall" name="淘宝/天猫" stroke="#2563eb" /><Line dataKey="jd" name="京东" stroke="#14b8a6" /><Line dataKey="douyin" name="抖音" stroke="#9333ea" /></LineChart>
</ResponsiveContainer>
```

- [ ] **Step 4: Build the four pages from shared computed data.**

Overview must render four business cards (GMV, 支付订单, 支付转化率, 客单价), the trend chart, amount-and-share channel contribution, clickable anomaly summary, and a separate automation summary. Daily report must render “昨天发生什么、重点异常、今日建议”. Product analysis must show SKU, channel, sales, conversion, stock days, and an anomaly link. Tasks must show last successful time, success rate, failures, run duration, and the simulated-hours formula.

- [ ] **Step 5: Register routes.**

```tsx
<Routes>
  <Route path="/" element={<OverviewPage />} />
  <Route path="/daily-report" element={<DailyReportPage />} />
  <Route path="/products" element={<ProductAnalysisPage />} />
  <Route path="/tasks" element={<TasksPage />} />
</Routes>
```

- [ ] **Step 6: Run the overview test and build.**

Run: `npm run test:run -- src/pages/OverviewPage.test.tsx && npm run build`

Expected: PASS; trend contains axes/legend and automation KPIs are not mixed with business KPIs.

- [ ] **Step 7: Commit reporting pages.**

Run: `git add src/components src/pages src/App.tsx && git commit -m "feat: add operational dashboard pages"`

### Task 5: Implement anomaly detail, workflow, and local persistence

**Files:**
- Create: `src/services/storage.ts`
- Create: `src/components/AnomalyList.tsx`
- Create: `src/pages/AnomaliesPage.tsx`
- Create: `src/pages/AnomaliesPage.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing workflow tests.**

```tsx
it('lets an operator claim and resolve an anomaly with a note', async () => {
  render(<AnomaliesPage initialRole="operator" />);
  await userEvent.click(screen.getByRole('button', { name: '认领' }));
  await userEvent.type(screen.getByLabelText('处理说明'), '已通知供应链补货');
  await userEvent.click(screen.getByRole('button', { name: '标记已解决' }));
  expect(screen.getByText('已解决')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify the missing-page failure.**

Run: `npm test -- --run src/pages/AnomaliesPage.test.tsx`

Expected: FAIL because `AnomaliesPage` does not exist.

- [ ] **Step 3: Implement storage and state transitions.**

```ts
const key = 'rpa-cockpit-anomalies';
export const loadAnomalies = <T,>(fallback: T): T => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
export const saveAnomalies = <T,>(items: T) => localStorage.setItem(key, JSON.stringify(items));
```

The page must call `canTransitionAnomaly` before rendering action buttons. Every allowed action appends `{ at: new Date().toISOString(), by: role, status, note }` to `history`, updates `owner` where a manager assigns one, and persists the full anomaly list.

- [ ] **Step 4: Build the details screen and accessible severity labels.**

Each row must display a text severity label (`高` or `中`) in addition to color, owner, current state, metric change detail, recommendation, history, and only role-allowed buttons. The overview anomaly summary must navigate to `/anomalies`.

- [ ] **Step 5: Register the route and run tests.**

Run: `npm run test:run -- src/pages/AnomaliesPage.test.tsx && npm run build`

Expected: operator transitions pass; executive controls are absent; the build passes.

- [ ] **Step 6: Commit anomaly workflow.**

Run: `git add src/services/storage.ts src/components/AnomalyList.tsx src/pages/AnomaliesPage.tsx src/App.tsx src/pages/AnomaliesPage.test.tsx && git commit -m "feat: add anomaly workflow and audit trail"`

### Task 6: Implement exports, integration guidance, and demonstration documentation

**Files:**
- Create: `src/services/export.ts`
- Create: `src/services/export.test.ts`
- Create: `src/pages/IntegrationPage.tsx`
- Create: `src/pages/IntegrationPage.test.tsx`
- Create: `README.md`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write a failing CSV privacy test.**

```ts
it('exports only the current filtered fact fields and no personal identifiers', () => {
  const csv = createFactCsv([{ date: '2026-07-23', channel: 'jd', sku: 'SKU-203', paidAmount: 4350, customerPhone: '13800000000' }]);
  expect(csv).toContain('date,channel,sku,paidAmount');
  expect(csv).not.toContain('customerPhone');
  expect(csv).not.toContain('13800000000');
});
```

- [ ] **Step 2: Verify the test fails.**

Run: `npm test -- --run src/services/export.test.ts`

Expected: FAIL because `createFactCsv` does not exist.

- [ ] **Step 3: Implement deterministic CSV generation and browser download.**

```ts
const headers = ['date', 'channel', 'sku', 'visits', 'paidOrders', 'paidAmount', 'refundedAmount', 'stock', 'averageDailySales'];
export const createFactCsv = (rows: Record<string, unknown>[]) => [headers.join(','), ...rows.map(row => headers.map(key => JSON.stringify(row[key] ?? '')).join(','))].join('\n');
export const downloadCsv = (name: string, csv: string) => { const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = Object.assign(document.createElement('a'), { href: url, download: name }); a.click(); URL.revokeObjectURL(url); };
```

- [ ] **Step 4: Add the integration page and fixed delivery boundary.**

The page must show three source adapters (淘宝/天猫、京东、抖音), their simulated status and last-success time, the medical rule-pack note, a Power BI section containing “统一 CSV 数据集、字段字典、连接说明”, and an explicit notice that no embedded report, gateway, or unverified `.pbit` is delivered in the PoC.

- [ ] **Step 5: Write the README demonstration script.**

The README must include: `npm install`, `npm run dev`, `npm run test:run`, a 3–5 minute walkthrough (refresh → overview → anomaly → resolve → export), simulated-data disclosure, metric definitions, and future real-integration prerequisites.

- [ ] **Step 6: Run export/component tests and build.**

Run: `npm run test:run -- src/services/export.test.ts src/pages/IntegrationPage.test.tsx && npm run build`

Expected: PASS and exported CSV never contains non-whitelisted fields.

- [ ] **Step 7: Commit exports and documentation.**

Run: `git add src/services/export.ts src/services/export.test.ts src/pages/IntegrationPage.tsx src/pages/IntegrationPage.test.tsx src/App.tsx README.md && git commit -m "feat: add Power BI-ready export and integration guide"`

### Task 7: Run browser acceptance tests and independent review

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/cockpit.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: Write browser acceptance coverage.**

```ts
import { test, expect } from '@playwright/test';

test('operator completes the cockpit anomaly loop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('模拟数据')).toBeVisible();
  await page.getByText('SKU-203 库存可售天数低于 3 天').click();
  await page.getByRole('button', { name: '认领' }).click();
  await page.getByLabel('处理说明').fill('已通知供应链补货');
  await page.getByRole('button', { name: '标记已解决' }).click();
  await expect(page.getByText('已解决')).toBeVisible();
});
```

- [ ] **Step 2: Run the browser test and verify it fails before Playwright configuration is added.**

Run: `npx playwright test e2e/cockpit.spec.ts`

Expected: FAIL because the project lacks a Playwright web server configuration.

- [ ] **Step 3: Add Playwright configuration.**

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './e2e', use: { baseURL: 'http://127.0.0.1:4173' }, webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: true } });
```

Set the Playwright `baseURL` to the same Vite port used by the `webServer` (`http://127.0.0.1:5173`) before executing the test.

- [ ] **Step 4: Run all verification commands.**

Run: `npm run test:run && npm run build && npx playwright test`

Expected: all unit, component, build, and browser tests pass.

- [ ] **Step 5: Request independent review.**

Send Claude Code a read-only review task covering type boundaries, data-disclosure honesty, and tests. Send Hermes a read-only task covering anomaly rule coverage and demonstration narrative. Apply only reproducible review findings, rerun the commands in Step 4, and record the final commands/results in `README.md`.

- [ ] **Step 6: Commit verified release candidate.**

Run: `git add playwright.config.ts e2e/cockpit.spec.ts README.md && git commit -m "test: verify cockpit demonstration flow"`

## Plan self-review

- Spec coverage: Tasks 1–2 implement replaceable adapters, unified metrics, ROI, and anomaly rules. Tasks 3–5 implement filters, role matrix, visible data freshness, charts, and closed-loop anomaly handling. Task 6 implements de-identified Power BI-ready exports and the explicit integration boundary. Task 7 validates the required demonstration journey and performs independent review.
- No-placeholder check: every implementation task specifies exact files, test commands, expected outcomes, and concrete interfaces.
- Type consistency: `Role`, `AnomalyStatus`, and `Anomaly` are defined in Task 1; all later tasks reuse these exact names. `calculateMetrics`, `calculateSavedHours`, `detectAnomalies`, `createFactCsv`, and `canTransitionAnomaly` are defined before their consuming tasks.
