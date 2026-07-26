# 公域需求雷达实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有智营 RPA 数据驾驶舱中交付可本地运行的“公域需求雷达与合规线索运营工作台”，完成合规样本导入、需求识别、人工审核与外部动作打卡闭环。

**Architecture:** 新增独立的 `leadRadar` 领域模型与服务层；CSV 仅在浏览器 Worker 内解析，输入先通过脱敏/格式校验，再进入规则驱动的分级、去重提示和审核状态机。页面以“指挥台首页 + 审核详情工作台 + 导入规则中心”三个锚点接入现有 AppShell，所有工作流数据以 LocalStorage 保存，真实渠道、模型和企业微信只通过可替换的模拟适配器显示状态和通知预览。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Playwright、Papa Parse（本地 CSV Worker 解析）、LocalStorage。

---

## 文件结构

- `src/domain/leads.ts`：线索、规则、数据来源、适配器、审核状态和权限类型。
- `src/data/leadRadarFixtures.ts`：脱敏演示线索、规则版本、适配器快照。
- `src/services/leadImport.ts`：CSV 规范化、字段校验、自动修正建议、敏感字段拦截。
- `src/services/leadScoring.ts`：关键词匹配、优先级、分流、内容相似提示和漏斗统计。
- `src/services/leadWorkflow.ts`：角色可执行的状态转移与不可篡改的操作历史。
- `src/services/leadStorage.ts`：LocalStorage 加载、保存、导入文件不落盘策略。
- `src/adapters/leadAdapters.ts`：官方 API、客户本地授权辅助、快照、模拟样本的状态模型和通知预览。
- `src/hooks/useLeadRadar.ts`：将 fixtures、导入结果、筛选、工作流和适配器状态提供给页面。
- `src/pages/PublicLeadRadarPage.tsx`：指挥台首页。
- `src/pages/LeadReviewWorkbenchPage.tsx`：线索队列、审核详情、复制草稿和外部动作打卡。
- `src/pages/LeadImportRulesPage.tsx`：文件导入、错误摘要、关键词与合规规则版本。
- `src/pages/LeadRadarPages.test.tsx`：页面可见性、审核动作、权限和导入错误回归。
- `src/services/*.test.ts`：各领域服务的单元测试。
- `e2e/lead-radar.spec.ts`：从导入/模拟样本到审核打卡的端到端流程。
- `src/styles/lead-radar.css`：三页面与窄屏工作台样式。

### Task 1: 建立领域边界与可失败的状态机测试

**Files:**
- Create: `src/domain/leads.ts`
- Create: `src/domain/leads.test.ts`

- [ ] **Step 1: 写出失败测试，约束高风险线索和外部动作状态机**

```ts
import { describe, expect, it } from 'vitest';
import { canTransitionLead, canConfirmLead, type LeadRecord } from './leads';

const lead = { id: 'lead-001', status: 'pending_review', riskLevel: 'low' } as LeadRecord;

describe('lead workflow permissions', () => {
  it('allows an assigned operator to move a low-risk lead into external execution', () => {
    expect(canTransitionLead('operator', 'approved', 'pending_external')).toBe(true);
  });
  it('blocks every role from confirming a strong compliance block', () => {
    expect(canConfirmLead({ ...lead, riskLevel: 'strong_block' }, 'manager')).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/domain/leads.test.ts`

Expected: FAIL，模块 `./leads` 不存在。

- [ ] **Step 3: 实现最小领域模型与权限函数**

```ts
export type LeadStatus = 'pending_review' | 'reviewing' | 'approved' | 'pending_external' | 'externally_logged' | 'followed_up' | 'ignored' | 'strong_block';
export type LeadRiskLevel = 'low' | 'warning' | 'strong_block';
export type LeadRole = 'operator' | 'manager' | 'executive';
export type LeadRecord = { id: string; status: LeadStatus; riskLevel: LeadRiskLevel; ownerId: string; history: LeadHistory[] };
export type LeadHistory = { at: string; by: LeadRole; action: string; note: string };

const transitions: Record<LeadRole, Partial<Record<LeadStatus, LeadStatus[]>>> = {
  operator: { pending_review: ['reviewing'], reviewing: ['approved', 'ignored', 'strong_block'], approved: ['pending_external'], pending_external: ['externally_logged'], externally_logged: ['followed_up'] },
  manager: { pending_review: ['reviewing', 'ignored', 'strong_block'], reviewing: ['approved', 'ignored', 'strong_block'], approved: ['pending_external'], pending_external: ['externally_logged'], externally_logged: ['followed_up'], ignored: ['reviewing'] },
  executive: {},
};
export const canTransitionLead = (role: LeadRole, from: LeadStatus, to: LeadStatus) => transitions[role][from]?.includes(to) ?? false;
export const canConfirmLead = (lead: LeadRecord, role: LeadRole) => role !== 'executive' && lead.riskLevel !== 'strong_block';
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/domain/leads.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/domain/leads.ts src/domain/leads.test.ts
git commit -m "feat: define lead radar workflow domain"
```

### Task 2: 实现 CSV 校验、规范化和隐私拦截

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/services/leadImport.ts`
- Create: `src/services/leadImport.test.ts`

- [ ] **Step 1: 写出失败测试，覆盖日期修正与敏感字段拦截**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeLeadRow } from './leadImport';

describe('normalizeLeadRow', () => {
  it('suggests a normalized date for an otherwise valid row', () => {
    expect(normalizeLeadRow({ channel: 'douyin', contentId: 'video-1', comment: '眼干怎么办', occurredAt: '2026.7.26' }, 2).normalized?.occurredAt).toBe('2026-07-26');
  });
  it('rejects rows containing a phone number instead of importing and masking it', () => {
    expect(normalizeLeadRow({ channel: 'jd', contentId: 'a', comment: '联系我 13800138000', occurredAt: '2026-07-26' }, 5).issues[0].code).toBe('personal_data_detected');
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/services/leadImport.test.ts`

Expected: FAIL，`normalizeLeadRow` 未定义。

- [ ] **Step 3: 安装并接入本地 CSV 解析依赖**

```bash
npm install papaparse
npm install -D @types/papaparse
```

实现 `parseLeadCsv(file)`，调用：

```ts
Papa.parse<Record<string, string>>(file, {
  header: true,
  skipEmptyLines: 'greedy',
  worker: true,
  step: ({ data }) => rows.push(normalizeLeadRow(data, rows.length + 2)),
  complete: () => resolve({ rows }),
  error: reject,
});
```

`normalizeLeadRow` 仅允许 `tmall | jd | douyin`，要求 `channel/contentId/comment/occurredAt`；检测手机号、邮箱、疑似姓名/地址和非脱敏账号 ID。日期只对无歧义的点号/斜线格式产生 `normalizationSuggestion`，由 UI 显示“应用修正”。

- [ ] **Step 4: 追加性能测试并验证**

```ts
it('validates one thousand mock rows without invalid results', () => {
  const start = performance.now();
  const results = Array.from({ length: 1000 }, (_, index) => normalizeLeadRow({ channel: 'tmall', contentId: String(index), comment: '眼干怎么缓解', occurredAt: '2026-07-26' }, index + 2));
  expect(results.every((item) => item.issues.length === 0)).toBe(true);
  expect(performance.now() - start).toBeLessThan(5000);
});
```

Run: `npm run test:run -- src/services/leadImport.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json src/services/leadImport.ts src/services/leadImport.test.ts
git commit -m "feat: add private local lead CSV import"
```

### Task 3: 实现线索评分、分流与相似内容提示

**Files:**
- Create: `src/services/leadScoring.ts`
- Create: `src/services/leadScoring.test.ts`
- Create: `src/data/leadRadarFixtures.ts`

- [ ] **Step 1: 写出失败测试，验证规则优先级不误伤价格异议**

```ts
it('routes price objection to a review queue rather than discarding a purchase signal', () => {
  expect(classifyLead('眼干滴眼液太贵了，哪个更适合？')).toMatchObject({ intent: 'price_sensitive', priority: 'medium' });
});
it('blocks a strong compliance phrase before purchase intent is considered', () => {
  expect(classifyLead('保证治愈吗，我要买')).toMatchObject({ riskLevel: 'strong_block' });
});
it('only labels similar wording as a manual-review hint', () => {
  expect(findSimilarLeads(fixtures[0], fixtures)).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'similar_content' })]));
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/services/leadScoring.test.ts`

Expected: FAIL，评分函数不存在。

- [ ] **Step 3: 实现可配置规则引擎**

实现 `KeywordRuleSet`，按如下顺序返回结果：强合规拦截/明确拒绝 → 无关或攻击性过滤 → 投诉服务恢复 → 决策词 → 需求词 → 症状词。`similarityHint` 使用规范化文本的 token overlap，仅返回提示，不读写用户身份字段、不合并记录。fixtures 中提供 20 组演示关键词和 `v1.0` 规则版本。

- [ ] **Step 4: 运行单元测试并确认通过**

Run: `npm run test:run -- src/services/leadScoring.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/services/leadScoring.ts src/services/leadScoring.test.ts src/data/leadRadarFixtures.ts
git commit -m "feat: score and route public lead samples"
```

### Task 4: 实现审核留痕、权限和本地持久化

**Files:**
- Create: `src/services/leadWorkflow.ts`
- Create: `src/services/leadWorkflow.test.ts`
- Create: `src/services/leadStorage.ts`
- Create: `src/services/leadStorage.test.ts`

- [ ] **Step 1: 写出失败测试，覆盖复制、打卡和角色边界**

```ts
it('does not treat copying a draft as an external send', () => {
  expect(copyDraft(approvedLead).status).toBe('approved');
});
it('requires an operator to log the external action before follow-up', () => {
  const logged = logExternalAction({ ...approvedLead, status: 'pending_external' }, 'operator', { channel: 'douyin', action: 'manual_comment', note: '已由运营在平台内完成' });
  expect(logged?.status).toBe('externally_logged');
});
it('does not let an executive mutate a lead', () => {
  expect(logExternalAction({ ...approvedLead, status: 'pending_external' }, 'executive', { channel: 'jd', action: 'manual_reply', note: 'x' })).toBeNull();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/services/leadWorkflow.test.ts src/services/leadStorage.test.ts`

Expected: FAIL，服务文件不存在。

- [ ] **Step 3: 实现最小工作流与存储服务**

`copyDraft` 只返回剪贴板文本；`logExternalAction` 通过 `canTransitionLead` 写入包含渠道、动作、说明和时间的 history。使用键 `rpa-cockpit-public-leads` 保存规范化线索、审核历史和规则版本；不保存 File、原始 CSV、账号密码或 Cookie。解析异常时回退 fixtures。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/services/leadWorkflow.test.ts src/services/leadStorage.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/services/leadWorkflow.ts src/services/leadWorkflow.test.ts src/services/leadStorage.ts src/services/leadStorage.test.ts
git commit -m "feat: persist auditable lead review workflow"
```

### Task 5: 加入适配器状态与 React 数据入口

**Files:**
- Create: `src/adapters/leadAdapters.ts`
- Create: `src/adapters/leadAdapters.test.ts`
- Create: `src/hooks/useLeadRadar.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 1: 写出失败测试，覆盖“无授权不实时拉取”和快照标识**

```ts
it('labels customer-local authorization as assisted work rather than real-time collection', () => {
  expect(getLeadAdapter('douyin').capability).toBe('manual_assistance_only');
});
it('keeps the latest successful timestamp when the adapter is degraded', () => {
  expect(getLeadAdapter('jd').dataMode).toBe('snapshot_24h');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/adapters/leadAdapters.test.ts`

Expected: FAIL，适配器未实现。

- [ ] **Step 3: 实现适配器、Hook 和导航入口**

`leadAdapters.ts` 为三渠道返回 `authorizationType`、`capability`、`lastSuccessfulAt`、`dataMode`、`noticePreview`。`useLeadRadar.ts` 管理筛选、导入摘要、当前选中线索、角色限定的命令和 LocalStorage。`App.tsx` 在现有 Provider 内渲染三个新页面；`AppShell.tsx` 在“核心能力”分组添加：`#public-lead-radar`、`#lead-review`、`#lead-rules`。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/adapters/leadAdapters.test.ts src/components/AppShell.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/adapters/leadAdapters.ts src/adapters/leadAdapters.test.ts src/hooks/useLeadRadar.ts src/App.tsx src/components/AppShell.tsx
git commit -m "feat: connect lead radar to cockpit navigation"
```

### Task 6: 构建公域需求雷达指挥台

**Files:**
- Create: `src/pages/PublicLeadRadarPage.tsx`
- Modify: `src/styles/lead-radar.css`
- Modify: `src/App.tsx`
- Create: `src/pages/LeadRadarPages.test.tsx`

- [ ] **Step 1: 写出失败页面测试**

```tsx
it('shows source-labelled lead funnel and opens a selected high-priority lead', async () => {
  render(<TestLeadRadar />);
  expect(screen.getByRole('heading', { name: '公域需求雷达' })).toBeInTheDocument();
  expect(screen.getByText(/模拟脱敏数据/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /查看高优先级线索/ }));
  expect(screen.getByRole('heading', { name: '合规审核工作台' })).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: FAIL，页面不存在。

- [ ] **Step 3: 实现指挥台**

按照设计说明布局六块：数据来源/新鲜度、六张 KPI、需求雷达、带流失归因的漏斗、高优先级队列、三渠道适配器状态和待处理异常。每个适配器使用文字、图标与颜色共同标注“实时授权 / 快照 24h / 模拟样本 / 客户本地人工辅助”。首页按钮以 `window.location.hash = '#lead-review'` 打开详情并保持当前选中项。

- [ ] **Step 4: 运行页面测试并确认通过**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/pages/PublicLeadRadarPage.tsx src/pages/LeadRadarPages.test.tsx src/styles/lead-radar.css src/App.tsx
git commit -m "feat: add public lead radar command center"
```

### Task 7: 构建合规审核工作台与外部动作打卡

**Files:**
- Create: `src/pages/LeadReviewWorkbenchPage.tsx`
- Modify: `src/pages/LeadRadarPages.test.tsx`
- Modify: `src/styles/lead-radar.css`

- [ ] **Step 1: 写出失败交互测试**

```tsx
it('requires an external-action check-in instead of marking copied content sent', async () => {
  render(<TestLeadRadar initialHash="#lead-review" />);
  await userEvent.click(screen.getByRole('button', { name: '人工确认' }));
  await userEvent.click(screen.getByRole('button', { name: '复制草稿' }));
  expect(screen.getByTestId('lead-status-lead-001')).toHaveTextContent('待外部执行');
  await userEvent.click(screen.getByRole('button', { name: '外部动作打卡' }));
  await userEvent.type(screen.getByLabelText('执行说明'), '已在抖音客户端人工回复');
  await userEvent.click(screen.getByRole('button', { name: '确认打卡' }));
  expect(screen.getByTestId('lead-status-lead-001')).toHaveTextContent('外部执行已打卡');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: FAIL，审核工作台不存在。

- [ ] **Step 3: 实现三栏/窄屏单栏审核体验**

左列为筛选与线索队列；中列显示脱敏上下文、命中理由、相似内容提示和当前状态；右列显示 AI 草稿、知识包版本、风险规则和不可删除的科普标识。强拦截禁用人工确认。运营专员只渲染自己负责的可操作按钮；主管显示分配、优先级与重开入口；管理层无变更按钮。打卡弹窗只收集渠道、人工动作类型和说明，不上传截图或账号信息。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/pages/LeadReviewWorkbenchPage.tsx src/pages/LeadRadarPages.test.tsx src/styles/lead-radar.css
git commit -m "feat: add auditable lead review workbench"
```

### Task 8: 构建导入与规则中心

**Files:**
- Create: `src/pages/LeadImportRulesPage.tsx`
- Modify: `src/pages/LeadRadarPages.test.tsx`
- Modify: `src/styles/lead-radar.css`

- [ ] **Step 1: 写出失败测试，验证错误行与规则回滚**

```tsx
it('shows the source row for rejected personal data and can preview a rule rollback', async () => {
  render(<TestLeadRadar initialHash="#lead-rules" />);
  await userEvent.upload(screen.getByLabelText('导入脱敏 CSV'), new File(['channel,contentId,comment,occurredAt\ndouyin,x,联系13800138000,2026-07-26'], 'samples.csv', { type: 'text/csv' }));
  expect(await screen.findByText(/第 2 行/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /预览回滚至 v1.0/ }));
  expect(screen.getByText(/规则回滚预览/)).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: FAIL，导入与规则页面不存在。

- [ ] **Step 3: 实现导入和规则界面**

上传控件只接收 `.csv`，呈现本地处理提示、进度、有效/拦截/待修正统计和行号级问题。规则中心展示四类关键词、渠道差异、强拦截/弱提示/预警规则及 `v1.0/v1.1` 版本时间线；“回滚”仅显示预览并要求主管确认。导出按钮仅下载规范化、脱敏的结果集与字段字典。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/pages/LeadRadarPages.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/pages/LeadImportRulesPage.tsx src/pages/LeadRadarPages.test.tsx src/styles/lead-radar.css
git commit -m "feat: add lead import and rules center"
```

### Task 9: 端到端验证、构建与演示文档

**Files:**
- Create: `e2e/lead-radar.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: 写出失败端到端场景**

```ts
test('operator completes the public lead review handoff without automatic publishing', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="#public-lead-radar"]').click();
  await page.getByRole('button', { name: /查看高优先级线索/ }).click();
  await page.getByRole('button', { name: '人工确认' }).click();
  await page.getByRole('button', { name: '外部动作打卡' }).click();
  await page.getByLabel('执行说明').fill('已在客户授权平台内人工完成');
  await page.getByRole('button', { name: '确认打卡' }).click();
  await expect(page.getByText('外部执行已打卡')).toBeVisible();
  await expect(page.getByText(/不自动发布|人工执行/)).toBeVisible();
});
```

- [ ] **Step 2: 运行并确认失败**

Run: `npx playwright test e2e/lead-radar.spec.ts`

Expected: FAIL，尚未实现页面。

- [ ] **Step 3: 补充 README 演示路径和边界**

新增“公域需求雷达”章节，记录启动命令、三分钟演示脚本、CSV 样例字段、模拟/快照/授权状态含义，以及不包含自动抓取、自动发送和真实账号凭据处理的声明。

- [ ] **Step 4: 完整验证**

Run:

```bash
npm run test:run
npx playwright test
npm run build
```

Expected: 全部通过；新测试无跳过；构建无 TypeScript 错误。

- [ ] **Step 5: 提交**

```bash
git add e2e/lead-radar.spec.ts README.md
git commit -m "test: verify public lead radar workflow"
```
