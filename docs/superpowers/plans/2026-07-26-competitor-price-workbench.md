# 竞品价格监控与审批工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将竞品价格模块重构为含快照、映射、规则、建议价、审批和人工打卡的独立工作台。

**Architecture:** 新增独立 pricing 领域、策略、规则、审批和本地存储服务；模拟/合规快照在浏览器本地处理，建议价永不自动写入平台。页面复用现有角色和审计模式。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Playwright、Recharts、LocalStorage。

---

### Task 1: 价格策略与毛利熔断

**Files:** `src/domain/pricing.ts`, `src/services/pricingStrategies.ts`, `src/domain/pricing.test.ts`, `src/services/pricingStrategies.test.ts`.

- [ ] 先写失败测试：毛利保底策略必须不低于安全价；预计毛利率低于 5% 必须标记为硬熔断。
- [ ] 运行 `npm run test:run -- src/services/pricingStrategies.test.ts`，确认模块缺失导致失败。
- [ ] 实现三种策略：跟随竞品、毛利保底、目标锚定；实现静态增量毛利公式 `(建议价 - 当前价) × 日均销量 × 天数`。
- [ ] 运行策略和领域测试，确认通过。
- [ ] 提交：`feat: add pricing proposal strategies`。

### Task 2: 快照、映射和风险规则

**Files:** `src/data/pricingFixtures.ts`, `src/services/pricingRules.ts`, `src/services/pricingImport.ts` 及对应测试。

- [ ] 先写失败测试：同日相同渠道/SKU/竞品记录只保留最新时间；定金、错价等进入数据质量核查而非普通告警。
- [ ] 实现最新快照覆盖键 `channel|sku|competitorId|YYYY-MM-DD`，跨日保留历史。
- [ ] 实现竞品降价、目标偏离、频繁变价、映射失效、疑似异常价规则和映射待更新任务。
- [ ] 运行规则与导入测试，确认通过。
- [ ] 提交：`feat: add pricing snapshots and risk rules`。

### Task 3: 审批和人工执行工作流

**Files:** `src/services/pricingWorkflow.ts`, `src/services/pricingStorage.ts` 及测试。

- [ ] 先写失败测试：毛利硬熔断不能批量批准；未审批记录不能外部执行打卡。
- [ ] 实现状态机：待分析、待审批、已批准/已退回、待外部执行、外部执行已打卡、已关闭。
- [ ] 记录执行平台、实际价格、凭证编号和说明；不上传截图、不改真实平台价格。
- [ ] 运行工作流测试，确认通过。
- [ ] 提交：`feat: add auditable price approval workflow`。

### Task 4: 三个独立价格工作台页面

**Files:** `src/hooks/usePricingWorkbench.tsx`, `src/pages/PricingCommandCenter.tsx`, `src/pages/PricingApprovalPage.tsx`, `src/pages/PricingRulesPage.tsx`, 对应页面测试；修改 `src/App.tsx`、`src/components/AppShell.tsx`、`src/styles/lead-radar.css`。

- [ ] 先写失败页面测试：价格风险明确显示来源、模拟测算和“不自动改价”边界。
- [ ] 实现指挥台（KPI/趋势/风险/SLA）、审批详情（7/30 天趋势/建议价/毛利熔断/审计）、映射与规则中心（批量映射/规则审批）。
- [ ] 导航归入“运营自动化中心”，不再保持旧的二期占位卡片。
- [ ] 运行页面测试和 `npm run build`，确认通过。
- [ ] 提交：`feat: rebuild competitor pricing workbench`。

### Task 5: 浏览器验证和作品集说明

**Files:** `e2e/pricing-workbench.spec.ts`, `README.md`。

- [ ] 写端到端流程：风险 → 提交审批 → 主管批准 → 外部执行打卡 → 审计记录。
- [ ] 在 README 补充价格工作台演示路线和不自动改价声明。
- [ ] 运行 `npm run test:run`、`npx playwright test`、`npm run build`，确认全绿。
- [ ] 提交：`test: verify pricing workbench workflow`。
