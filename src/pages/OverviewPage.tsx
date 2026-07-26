import { ChannelContribution } from '../components/ChannelContribution';
import { KpiCard } from '../components/KpiCard';
import { TrendChart } from '../components/TrendChart';
import { useAutomationTasks, useCockpitData } from '../hooks/useCockpitData';
import { calculatePeriodChange, calculateSavedHours } from '../services/metrics';

const currency = (value: number) => `¥${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const delta = (current: number, previous?: number) => { const value = previous === undefined ? null : calculatePeriodChange(current, previous); return value === null ? { text: '暂无可比周期', tone: 'neutral' as const } : { text: `较上一可比周期 ${value >= 0 ? '↑' : '↓'}${Math.abs(value * 100).toFixed(1)}%`, tone: value >= 0 ? 'positive' as const : 'negative' as const }; };
export function OverviewPage() {
  const { metrics, previousMetrics, channelMetrics, trend } = useCockpitData();
  const tasks = useAutomationTasks();
  const successfulRuns = tasks.reduce((sum, task) => sum + task.successfulRuns, 0);
  const failedTasks = tasks.filter((task) => task.status === 'failed').length;
  const readyRate = tasks.length ? (tasks.filter((task) => task.status === 'success').length / tasks.length) * 100 : 0;
  const savedHours = tasks.reduce((sum, task) => sum + calculateSavedHours(task.successfulRuns, task.manualMinutes), 0);
  const deltas = { gmv: delta(metrics.gmv, previousMetrics?.gmv), paidOrders: delta(metrics.paidOrders, previousMetrics?.paidOrders), conversionRate: delta(metrics.conversionRate, previousMetrics?.conversionRate), aov: delta(metrics.aov, previousMetrics?.aov) };
  return <section id="overview"><div className="page-heading"><div><p className="eyebrow">经营数据 · 模拟脱敏演示</p><h2>经营总览</h2><p>先看经营结果，再处理需要行动的异常。</p></div><span className="data-pill">数据更新于 <b>08:30</b> · 模拟数据</span></div><div className="kpi-grid" aria-label="经营核心指标"><KpiCard label="GMV" value={currency(metrics.gmv)} delta={deltas.gmv.text} tone={deltas.gmv.tone} caption="已支付订单金额" /><KpiCard label="支付订单" value={metrics.paidOrders.toLocaleString()} delta={deltas.paidOrders.text} tone={deltas.paidOrders.tone} caption="退款单独统计" /><KpiCard label="支付转化率" value={`${(metrics.conversionRate * 100).toFixed(2)}%`} delta={deltas.conversionRate.text} tone={deltas.conversionRate.tone} caption="支付订单 / 访问量" /><KpiCard label="客单价" value={currency(metrics.aov)} delta={deltas.aov.text} tone={deltas.aov.tone} caption="GMV / 支付订单" /></div><div className="dashboard-grid"><article className="panel"><h3>GMV 渠道趋势</h3><p>单位：元 · 横轴：日期</p><TrendChart data={trend} /></article><article className="panel"><h3>渠道贡献</h3><p>按当前筛选条件计算</p><ChannelContribution channels={channelMetrics} totalGmv={metrics.gmv} /></article></div><article className="panel automation-summary"><h3>自动化运行摘要</h3><p>运行稳定性与模拟 ROI 单独呈现，不与经营 KPI 混合。</p><div className="automation-metrics"><div><b>{tasks.length === 0 ? '—' : `${readyRate.toFixed(1)}%`}</b><span>渠道适配器就绪率</span></div><div><b data-testid="automation-failure-count">{failedTasks}</b><span>失败任务快照</span></div><div><b>{savedHours.toFixed(1)} h</b><span>累计节省工时（模拟测算）</span></div></div><small>成功任务次数：{successfulRuns}</small></article></section>;
}
