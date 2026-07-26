import { type PropsWithChildren } from 'react';
import type { ChannelId, Role } from '../domain/types';
import { useCockpitContext, useScopedAnomalies, type PeriodPreset } from '../hooks/useCockpitData';

const channelNames: Record<ChannelId, string> = { tmall: '淘宝/天猫', jd: '京东', douyin: '抖音' };
const roleNames: Record<Role, string> = { operator: '运营专员', manager: '运营主管', executive: '管理层' };
const periods: Array<{ id: PeriodPreset; label: string }> = [
  { id: 'yesterday', label: '昨日' }, { id: 'last_7_days', label: '近 7 天' }, { id: 'month', label: '本月' }, { id: 'custom', label: '自定义' },
];

type AppShellProps = PropsWithChildren<{ onExport?: () => void }>;

export function AppShell({ children, onExport }: AppShellProps) {
  const { filters, role, setPeriod, toggleChannel, setRole, setCustomRange } = useCockpitContext();
  const scopedAnomalies = useScopedAnomalies();
  return <div className="app-shell">
    <aside className="sidebar" aria-label="主导航">
      <div className="brand-mark"><span>智</span><div><b>智营</b><small>RPA DATA COCKPIT</small></div></div>
      <nav className="nav-list">
        <a className="nav-item active" href="#overview">▦　经营总览</a><a className="nav-item" href="#daily-report">▤　每日经营日报</a><a className="nav-item" href="#anomalies">◇　异常中心 <em data-testid="anomaly-badge">{scopedAnomalies.length}</em></a><a className="nav-item" href="#sku-analysis">▤　商品分析</a><a className="nav-item" href="#automation">◌　自动化任务</a><a className="nav-item" href="#integrations">⌘　数据接入与规则</a>
        <a className="nav-item nav-divider" href="#order-service-workbench">▤　订单与售后工作台</a><a className="nav-item" href="#order-service-rules">⌘　订单与售后规则</a><a className="nav-item" href="#creative-compliance">✦　AI 素材与合规</a>
        <a className="nav-item nav-divider" href="#public-lead-radar">◉　公域需求雷达</a><a className="nav-item" href="#lead-review">◇　合规审核工作台</a><a className="nav-item" href="#lead-rules">⌘　导入与规则中心</a>
        <a className="nav-item nav-divider" href="#pricing-command-center">◉　竞品价格工作台</a><a className="nav-item" href="#pricing-approval">◇　调价建议审批</a><a className="nav-item" href="#pricing-rules">⌘　竞品映射与规则</a>
      </nav>
      <div className="sidebar-footer"><span className="live-dot" />所有数据均为模拟、脱敏数据</div>
    </aside>
    <section className="workspace"><header className="topbar"><div><p className="eyebrow">运营自动化 · 演示环境</p><h1>智营 RPA 数据驾驶舱</h1></div><div className="top-actions"><span className="refresh-status"><i />模拟数据 · 每日 08:30 刷新</span><button className="export-button" onClick={onExport} title="默认脱敏，不含可识别个人信息">导出 Power BI 数据集<span>→</span></button></div></header>
      <section className="filterbar" aria-label="全局筛选"><div className="filter-group"><span className="filter-label">时间范围</span><div className="segmented-control">{periods.map(({ id, label }) => <button key={id} className={filters.period === id ? 'selected' : ''} onClick={() => setPeriod(id)}>{label}</button>)}</div></div>{filters.period === 'custom' && <div className="custom-dates"><input aria-label="开始日期" type="date" defaultValue="2026-07-17" onChange={(event) => setCustomRange({ from: event.target.value, to: filters.customRange?.to ?? '2026-07-23' })} /><span>至</span><input aria-label="结束日期" type="date" defaultValue="2026-07-23" onChange={(event) => setCustomRange({ from: filters.customRange?.from ?? '2026-07-17', to: event.target.value })} /></div>}<div className="filter-divider" /><div className="filter-group"><span className="filter-label">渠道</span><div className="channel-pills">{(Object.keys(channelNames) as ChannelId[]).map((channel) => <button key={channel} aria-pressed={filters.channels.includes(channel)} className={filters.channels.includes(channel) ? 'selected' : ''} onClick={() => toggleChannel(channel)}>{channelNames[channel]}</button>)}</div></div><div className="filter-spacer" /><div className="role-switcher" aria-label="演示角色切换">{(Object.keys(roleNames) as Role[]).map((item) => <button key={item} className={role === item ? 'selected' : ''} onClick={() => setRole(item)}>{roleNames[item]}</button>)}</div></section>
      <main className="content-area">{children}</main>
    </section>
  </div>;
}
