# 订单与售后工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simulated, de-identified order-risk and after-sales workbench with rule detection, role-aware handling, SLA visibility, and auditable external-action check-ins.

**Architecture:** Keep rule detection as pure services and keep workflow authorization/state transitions separate from the UI. The workbench consumes deterministic fixtures and local React state, while the existing cockpit role context controls which operations are available.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite.

---

## File structure

- Create `src/domain/orderService.ts`: domain types for order risks, after-sales tickets, history, rules, SLA and roles.
- Create `src/services/orderRules.ts`: pure rule merging, SLA and automatic-assignment functions.
- Create `src/services/orderRules.test.ts`: unit coverage for normal-order filtering, merged multi-rule records, SLA and assignment.
- Create `src/services/orderWorkflow.ts`: permission, state transition, batch-action and external-check-in functions.
- Create `src/services/orderWorkflow.test.ts`: unit coverage for role boundaries and type-specific check-ins.
- Create `src/data/orderServiceFixtures.ts`: de-identified fixtures covering three order risks, three ticket types, normal data and three data-quality states.
- Create `src/pages/OrderServiceWorkbenchPage.tsx`: dual queues, detail area, processing actions and audit history.
- Create `src/pages/OrderServiceRulesPage.tsx`: split rule libraries, import/validation explanation and explicit degradation states.
- Create `src/pages/OrderServicePages.test.tsx`: page-level behavior checks.
- Modify `src/App.tsx`: replace the legacy `OrderServicePage` render with the new workbench and rules pages.
- Modify `src/components/AppShell.tsx`: replace legacy order navigation with the new workbench and rules anchors.
- Modify `src/styles/polish.css`: focused layout and form styling for the two pages.
- Modify `src/pages/ExpansionPages.test.tsx`: remove the retired legacy order page assertion while keeping creative-compliance coverage.

### Task 1: Domain model and fixtures

**Files:**
- Create: `src/domain/orderService.ts`
- Create: `src/data/orderServiceFixtures.ts`

- [ ] **Step 1: Define the domain types**

```ts
export type OrderRiskType = 'price_conflict' | 'fulfilment_check' | 'review_required';
export type TicketType = 'refund' | 'reshipment' | 'consultation';
export type WorkSeverity = 'high' | 'medium' | 'low';
export type OrderRiskStatus = 'pending_review' | 'in_progress' | 'resolved' | 'ignored' | 'external_logged';
export type TicketStatus = 'pending' | 'in_progress' | 'awaiting_external' | 'awaiting_customer' | 'closed';
export type WorkHistory = { at: string; by: Role; note: string; action: string };
```

- [ ] **Step 2: Add fixtures with fixed dates and safe source labels**

```ts
export const orderRiskFixtures: OrderRisk[] = [
  { id: 'order-risk-101', orderId: 'DY-20260726-101', channel: 'douyin', severity: 'high', rules: ['price_conflict'], status: 'pending_review', owner: '运营专员', detectedAt: '2026-07-26T09:00:00Z', source: '模拟快照', customerKey: 'U-***-018' },
];
```

- [ ] **Step 3: Verify type checking**

Run: `npm run build`

Expected: TypeScript succeeds before the services depend on the new types.

- [ ] **Step 4: Commit**

```powershell
git add src/domain/orderService.ts src/data/orderServiceFixtures.ts
git commit -m "feat: add order service domain fixtures"
```

### Task 2: Rule detection, merging, SLA and assignment

**Files:**
- Create: `src/services/orderRules.test.ts`
- Create: `src/services/orderRules.ts`

- [ ] **Step 1: Write failing tests for filtering, merged findings and SLA**

```ts
expect(buildOrderRisks([normalOrder])).toEqual([]);
expect(buildOrderRisks([priceAndStockConflict])[0].rules).toEqual(['price_conflict', 'fulfilment_check']);
expect(getSlaState('high', '2026-07-25T08:00:00Z', '2026-07-26T09:00:00Z')).toBe('overdue');
expect(assignOwner({ channel: 'douyin', type: 'refund' }, assignmentRules)).toBe('运营专员');
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/services/orderRules.test.ts`

Expected: FAIL because `buildOrderRisks`, `getSlaState`, and `assignOwner` do not exist.

- [ ] **Step 3: Implement pure rule functions**

```ts
const severityRank: Record<WorkSeverity, number> = { high: 3, medium: 2, low: 1 };
export function buildOrderRisks(rows: ImportedOrder[]): OrderRisk[] {
  return Object.values(rows.reduce<Record<string, OrderRisk>>((result, row) => {
    const rules = detectRules(row);
    if (!rules.length) return result;
    const severity = rules.some((rule) => rule === 'price_conflict' || rule === 'review_required') ? 'high' : 'medium';
    const current = result[row.orderId];
    result[row.orderId] = current
      ? { ...current, rules: [...new Set([...current.rules, ...rules])], severity: severityRank[severity] > severityRank[current.severity] ? severity : current.severity }
      : { id: `risk-${row.orderId}`, orderId: row.orderId, channel: row.channel, severity, rules, status: 'pending_review', owner: '待分派', detectedAt: row.detectedAt, source: row.source, customerKey: row.customerKey, history: [] };
    return result;
  }, {}));
}
export function getSlaHours(severity: WorkSeverity, ticketType?: TicketType) { return ticketType === 'consultation' ? 48 : severity === 'high' ? 24 : 72; }
export function getSlaState(severity: WorkSeverity, detectedAt: string, now: string, ticketType?: TicketType) {
  const usedHours = (Date.parse(now) - Date.parse(detectedAt)) / 3_600_000;
  const limit = getSlaHours(severity, ticketType);
  return usedHours >= limit ? 'overdue' : usedHours >= limit * 0.8 ? 'due_soon' : 'on_track';
}
export function assignOwner(input: { channel: ChannelId; type: OrderRiskType | TicketType }, rules: AssignmentRule[]) {
  return rules.find((rule) => rule.channel === input.channel && rule.type === input.type)?.owner ?? '待主管分派';
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm run test:run -- src/services/orderRules.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/services/orderRules.ts src/services/orderRules.test.ts
git commit -m "feat: add order risk rules and sla"
```

### Task 3: Workflow and external-action audit trail

**Files:**
- Create: `src/services/orderWorkflow.test.ts`
- Create: `src/services/orderWorkflow.ts`

- [ ] **Step 1: Write failing authorization and check-in tests**

```ts
expect(canHandleOrderRisk('operator', risk, 'in_progress', '运营专员')).toBe(true);
expect(canHandleOrderRisk('operator', risk, 'resolved', '其他负责人')).toBe(false);
expect(canBatchHandle(ticket, 'operator')).toBe(true);
expect(canBatchHandle(highRisk, 'manager')).toBe(false);
expect(logExternalAction(refundTicket, { refundAmount: 99, reference: 'RF-101' }).status).toBe('closed');
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/services/orderWorkflow.test.ts`

Expected: FAIL because workflow helpers do not exist.

- [ ] **Step 3: Implement workflow helpers**

```ts
export function canHandleOrderRisk(role: Role, risk: OrderRisk, next: OrderRiskStatus, actorName: string): boolean {
  if (role === 'executive') return false;
  if (role === 'operator' && risk.owner !== actorName) return false;
  return (risk.status === 'pending_review' && next === 'in_progress') || (risk.status === 'in_progress' && (next === 'resolved' || next === 'ignored')) || (role === 'manager' && (next === 'in_progress' || next === 'external_logged'));
}
export function canBatchHandle(item: OrderRisk | AfterSalesTicket, role: Role): boolean { return role !== 'executive' && 'ticketType' in item && item.ticketType === 'consultation'; }
export function logExternalAction(ticket: AfterSalesTicket, data: RefundCheckIn | ReshipmentCheckIn | ConsultationCheckIn): AfterSalesTicket {
  const valid = ticket.ticketType === 'refund' ? 'refundAmount' in data && Boolean(data.reference) : ticket.ticketType === 'reshipment' ? 'trackingNumber' in data && Boolean(data.variant) : 'replySummary' in data && Boolean(data.replySummary);
  if (!valid) throw new Error('外部执行字段不完整');
  return { ...ticket, status: 'closed', history: [...ticket.history, { at: '2026-07-26T10:00:00Z', by: 'operator', action: 'external_logged', note: data.reference ?? data.replySummary ?? '' }] };
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm run test:run -- src/services/orderWorkflow.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/services/orderWorkflow.ts src/services/orderWorkflow.test.ts
git commit -m "feat: add order service workflow audit"
```

### Task 4: Workbench UI and role-aware handling

**Files:**
- Create: `src/pages/OrderServicePages.test.tsx`
- Create: `src/pages/OrderServiceWorkbenchPage.tsx`
- Modify: `src/styles/polish.css`

- [ ] **Step 1: Write failing workbench interaction tests**

```tsx
renderWithCockpit(<OrderServiceWorkbenchPage />);
expect(screen.getByRole('heading', { name: '订单与售后工作台' })).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: '开始处理' }));
fireEvent.change(screen.getByLabelText('处理说明'), { target: { value: '已联系仓配核验' } });
fireEvent.click(screen.getByRole('button', { name: '确认流转' }));
expect(screen.getByText(/已联系仓配核验/)).toBeInTheDocument();
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/pages/OrderServicePages.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Build the dual-queue workbench**

```tsx
export function OrderServiceWorkbenchPage() {
  const { role } = useCockpitContext();
  const [selectedId, setSelectedId] = useState('order-risk-101');
  const [risks, setRisks] = useState(orderRiskFixtures);
  const [tickets, setTickets] = useState(afterSalesFixtures);
  // Render KPIs, filterable risk/ticket queues, selected-item context, action form, and audit history.
}
```

- [ ] **Step 4: Add focused styles and verify page tests pass**

Run: `npm run test:run -- src/pages/OrderServicePages.test.tsx`

Expected: all workbench page tests pass, including read-only management role behavior.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/OrderServiceWorkbenchPage.tsx src/pages/OrderServicePages.test.tsx src/styles/polish.css
git commit -m "feat: add order service workbench"
```

### Task 5: Rules, import boundaries, navigation and regression

**Files:**
- Create: `src/pages/OrderServiceRulesPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/pages/ExpansionPages.test.tsx`

- [ ] **Step 1: Write failing navigation and rules-page tests**

```tsx
render(<OrderServiceRulesPage />);
expect(screen.getByRole('heading', { name: '订单与售后规则中心' })).toBeInTheDocument();
expect(screen.getByText(/完全降级/)).toBeInTheDocument();
expect(screen.getByText(/姓名仅保留姓氏/)).toBeInTheDocument();
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm run test:run -- src/pages/OrderServicePages.test.tsx`

Expected: FAIL because the rules page is missing.

- [ ] **Step 3: Implement the rules page and replace the legacy nav/render**

```tsx
<OrderServiceWorkbenchPage />
<OrderServiceRulesPage />
// Nav links: #order-service-workbench and #order-service-rules
```

The page must visibly distinguish normal, light degradation, and full degradation. It must document import rejection for unmasked name, phone, address, or payment fields.

- [ ] **Step 4: Run complete validation**

Run: `npm run test:run; npm run build; npx playwright test`

Expected: all unit, build, and browser tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/OrderServiceRulesPage.tsx src/App.tsx src/components/AppShell.tsx src/pages/ExpansionPages.test.tsx
git commit -m "feat: integrate order service workbench"
```
