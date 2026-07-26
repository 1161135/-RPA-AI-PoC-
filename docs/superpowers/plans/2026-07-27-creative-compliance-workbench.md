# AI 素材与合规工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simulated, de-identified AI content production and compliance workbench for product content and public communication, with non-bypassable human review and external publishing check-ins.

**Architecture:** Place pure compliance evaluation and state transition logic in services, retain fixtures in a dedicated data file, and use local React state for the PoC workbench. Reuse the existing `CockpitProvider` role state; no real model, account, comment, message, or publishing API is called.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite.

---

## File structure

- Create `src/domain/creativeCompliance.ts`: content type, risk, knowledge-base version, template, review status, check-in and history types.
- Create `src/data/creativeFixtures.ts`: de-identified product/public drafts, risk samples, knowledge-base version and approved template fixtures.
- Create `src/services/creativeRules.ts` and `src/services/creativeRules.test.ts`: rule priority, disclaimer injection, rewrite and degradation functions.
- Create `src/services/creativeWorkflow.ts` and `src/services/creativeWorkflow.test.ts`: role-aware status transitions, bulk boundary, structured return and type-specific check-in.
- Create `src/pages/CreativeCommandCenterPage.tsx`: content funnel and compliance KPIs.
- Create `src/pages/CreativeReviewPage.tsx`: draft editor, diagnosis, template reuse, review and external-action check-in UI.
- Create `src/pages/CreativeRulesPage.tsx`: dual rule libraries, knowledge-base version, import/degeneration boundary.
- Create `src/pages/CreativePages.test.tsx`: page-level behavior coverage.
- Modify `src/App.tsx`, `src/components/AppShell.tsx`, `src/styles/polish.css`, and `src/pages/ExpansionPages.test.tsx` to replace the retired temporary page and navigation.

### Task 1: Creative compliance domain and fixtures

**Files:**
- Create: `src/domain/creativeCompliance.ts`
- Create: `src/data/creativeFixtures.ts`

- [ ] **Step 1: Define stable domain types**

```ts
export type ContentTrack = 'product' | 'public_communication';
export type ContentRisk = 'block' | 'warning' | 'notice';
export type CreativeStatus = 'editing' | 'pending_review' | 'blocked' | 'returned' | 'pending_final_review' | 'approved_waiting_publish' | 'externally_logged';
export type KnowledgeBaseVersion = { id: string; version: string; reviewer: string; effectiveAt: string; scope: string };
export type CreativeDraft = { id: string; track: ContentTrack; channel: ChannelId; risk: ContentRisk; status: CreativeStatus; owner: string; body: string; knowledgeBase: KnowledgeBaseVersion; history: CreativeHistory[] };
```

- [ ] **Step 2: Add deterministic, safe fixtures**

```ts
export const knowledgeBaseFixture = { id: 'kb-eye-2026-07', version: 'v2026.07', reviewer: '运营主管', effectiveAt: '2026-07-01', scope: '眼部健康科普（模拟）' };
export const creativeDraftFixtures: CreativeDraft[] = [
  { id: 'creative-product-101', track: 'product', channel: 'douyin', risk: 'warning', status: 'editing', owner: '运营专员', body: '夏季居家护理图文草稿（模拟）', knowledgeBase: knowledgeBaseFixture, history: [] },
];
```

- [ ] **Step 3: Verify type checking**

Run: `npm run build`

Expected: TypeScript build passes before services consume the types.

- [ ] **Step 4: Commit**

```powershell
git add src/domain/creativeCompliance.ts src/data/creativeFixtures.ts
git commit -m "feat: add creative compliance domain fixtures"
```

### Task 2: Compliance rules and knowledge-source safeguards

**Files:**
- Create: `src/services/creativeRules.test.ts`
- Create: `src/services/creativeRules.ts`

- [ ] **Step 1: Write failing rule tests**

```ts
expect(evaluateCreative('可根治眼干', 'douyin').risk).toBe('block');
expect(evaluateCreative('改善日常不适', 'douyin').risk).toBe('warning');
expect(appendPublicDisclaimer('健康科普草稿')).toContain('不构成医疗建议');
expect(applyLowRiskRewrite('绝对有效')).toContain('建议结合个人情况');
expect(selectStrictestRisk(['notice', 'warning'])).toBe('warning');
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/services/creativeRules.test.ts`

Expected: FAIL because `creativeRules.ts` does not exist.

- [ ] **Step 3: Implement pure rule functions**

```ts
const blockedTerms = ['根治', '治疗', '处方药推荐'];
const warningTerms = ['绝对有效', '立刻改善'];
export function selectStrictestRisk(risks: ContentRisk[]) { return risks.includes('block') ? 'block' : risks.includes('warning') ? 'warning' : 'notice'; }
export function appendPublicDisclaimer(text: string) { return `${text}\n\n本文仅为健康科普，不构成医疗建议；如有不适请咨询专业医师。`; }
export function applyLowRiskRewrite(text: string) { return text.replace('绝对有效', '建议结合个人情况').replace('立刻改善', '可关注日常护理'); }
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm run test:run -- src/services/creativeRules.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/services/creativeRules.ts src/services/creativeRules.test.ts
git commit -m "feat: add creative compliance rules"
```

### Task 3: Review workflow, return reasons and external check-ins

**Files:**
- Create: `src/services/creativeWorkflow.test.ts`
- Create: `src/services/creativeWorkflow.ts`

- [ ] **Step 1: Write failing workflow tests**

```ts
expect(canTransition('operator', blockedDraft, 'pending_final_review')).toBe(false);
expect(canTransition('operator', returnedDraft, 'pending_review')).toBe(true);
expect(canBulkReview(lowRiskProductDraft, 'operator')).toBe(true);
expect(canBulkReview(publicHealthDraft, 'manager')).toBe(false);
expect(logPublish(productDraft, { channel: 'douyin', reference: 'DY-creative-101' }).status).toBe('externally_logged');
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/services/creativeWorkflow.test.ts`

Expected: FAIL because workflow helpers do not exist.

- [ ] **Step 3: Implement the guarded state machine**

```ts
export function canTransition(role: Role, draft: CreativeDraft, next: CreativeStatus): boolean {
  if (role === 'executive' || (draft.risk === 'block' && next !== 'editing')) return false;
  if (draft.status === 'returned') return next === 'editing';
  if (draft.status === 'editing') return next === 'pending_review';
  return role === 'manager' && draft.status === 'pending_final_review' && next === 'approved_waiting_publish';
}
export function canBulkReview(draft: CreativeDraft, role: Role) { return role !== 'executive' && draft.track === 'product' && draft.risk === 'notice'; }
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm run test:run -- src/services/creativeWorkflow.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/services/creativeWorkflow.ts src/services/creativeWorkflow.test.ts
git commit -m "feat: add creative review workflow"
```

### Task 4: Command center and review workbench

**Files:**
- Create: `src/pages/CreativePages.test.tsx`
- Create: `src/pages/CreativeCommandCenterPage.tsx`
- Create: `src/pages/CreativeReviewPage.tsx`
- Modify: `src/styles/polish.css`

- [ ] **Step 1: Write failing page interaction tests**

```tsx
render(<CockpitProvider><AppShell><CreativeReviewPage /></AppShell></CockpitProvider>);
expect(screen.getByRole('heading', { name: '素材审核工作台' })).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: '应用低风险改写' }));
expect(screen.getByText(/建议结合个人情况/)).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: '管理层' }));
expect(screen.queryByRole('button', { name: '提交审核' })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/pages/CreativePages.test.tsx`

Expected: FAIL because the pages do not exist.

- [ ] **Step 3: Build the two visual pages**

```tsx
export function CreativeCommandCenterPage() {
  return <section id="creative-command-center" className="page-section"><h2>AI 素材与合规指挥台</h2><div className="lead-kpis"><article><small>待审核草稿</small><b>8</b></article><article><small>强拦截阻断</small><b>2</b></article><article><small>平均审核时长</small><b>18m</b></article><article><small>待外部发布打卡</small><b>3</b></article></div><article className="panel"><h3>素材生产漏斗（模拟）</h3><p>草稿生成 24 → 规则检测 21（内容废弃 3）→ 人工审核 16（强拦截待改写 2）→ 外部打卡 10（人工退回改写 5）</p></article></section>;
}
export function CreativeReviewPage() {
  const { role } = useCockpitContext();
  const [drafts, setDrafts] = useState(creativeDraftFixtures);
  const [selectedId, setSelectedId] = useState('creative-product-101');
  const selected = drafts.find((item) => item.id === selectedId)!;
  return <section id="creative-review" className="page-section"><h2>素材审核工作台</h2><button onClick={() => setDrafts((items) => items.map((item) => item.id === selected.id ? { ...item, body: applyLowRiskRewrite(item.body) } : item))}>应用低风险改写</button>{role !== 'executive' && <button>提交审核</button>}<textarea aria-label="素材草稿" value={selected.body} readOnly /><p>知识库版本：{selected.knowledgeBase.version}</p></section>;
}
```

- [ ] **Step 4: Run page tests and add styles**

Run: `npm run test:run -- src/pages/CreativePages.test.tsx`

Expected: all page tests pass, including management read-only behavior.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/CreativeCommandCenterPage.tsx src/pages/CreativeReviewPage.tsx src/pages/CreativePages.test.tsx src/styles/polish.css
git commit -m "feat: add creative compliance workbench"
```

### Task 5: Rules center, navigation and final verification

**Files:**
- Create: `src/pages/CreativeRulesPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/pages/ExpansionPages.test.tsx`

- [ ] **Step 1: Write failing rules-page tests**

```tsx
render(<CreativeRulesPage />);
expect(screen.getByRole('heading', { name: '素材合规规则中心' })).toBeInTheDocument();
expect(screen.getByText(/通用医学\/广告规则是底线/)).toBeInTheDocument();
expect(screen.getByText(/完全降级/)).toBeInTheDocument();
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/pages/CreativePages.test.tsx`

Expected: FAIL because `CreativeRulesPage` is missing.

- [ ] **Step 3: Implement rules center and replace legacy page**

```tsx
<CreativeCommandCenterPage />
<CreativeReviewPage />
<CreativeRulesPage />
// Nav anchors: #creative-command-center, #creative-review, #creative-rules
```

The rules page must show strictest-rule precedence, knowledge-base version metadata, templates requiring fresh review, and normal/light/full degradation labels.

- [ ] **Step 4: Run full verification**

Run: `npm run test:run; npm run build; npx playwright test`

Expected: all unit, build, and browser tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/CreativeRulesPage.tsx src/App.tsx src/components/AppShell.tsx src/pages/ExpansionPages.test.tsx
git commit -m "feat: integrate creative compliance workbench"
```
