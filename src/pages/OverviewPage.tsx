import { ChannelContribution } from '../components/ChannelContribution';
import { KpiCard } from '../components/KpiCard';
import { TrendChart } from '../components/TrendChart';
import { useAutomationTasks, useCockpitData } from '../hooks/useCockpitData';
import { calculateSavedHours } from '../services/metrics';

const currency = (value: number) => `¥${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
export function OverviewPage() {
  const { metrics, channelMetrics, trend } = useCockpitData();
  const tasks = useAutomationTasks();
  const successfulRuns = tasks.reduce((sum, task) => sum + task.successfulRuns, 0);
  const savedHours = tasks.reduce((sum, task) => sum + calculateSavedHours(task.successfulRuns, task.manualMinutes), 0);
  const failedTasks = tasks.filter((task) => task.status === 'failed').length;
  return <section id="overview">
    <div className="page-heading"><div><p className="eyebrow">经营数据 · 模拟脱敏演示</p><h2>经营总览</h2><p>先看经营结果，再处理需要行动的异常。</p></div><span className="data-pill">数据更新于 <b>08:30</b> · 模拟数据</span></div>
    <div className="kpi-grid" aria-label="经营核心指标">
      <KpiCard label="GMV" value={currency(metrics.gmv)} caption="已支付订单金额" />
      <KpiCard label="支付订单" value={metrics.paidOrders.toLocaleString()} caption="退款单独统计" />
      <KpiCard label="支付转化率" value={`${(metrics.conversionRate * 100).toFixed(2)}%`} caption="支付订单 / 访问量" />
      <KpiCard label="客单价" value={currency(metrics.aov)} caption="GMV / 支付订单" />
    </div>
    <div className="dashboard-grid">
      <article className="panel"><div className="panel-header"><div><h3>GMV 渠道趋势</h3><p>单位：元 · 横轴：日期</p></div></div><TrendChart data={trend} /></article>
      <article className="panel"><div className="panel-header"><div><h3>渠道贡献</h3><p>按当前筛选条件计算</p></div></div><ChannelContribution channels={channelMetrics} totalGmv={metrics.gmv} /></article>
    </div>
    <article className="panel automation-summary"><div className="panel-header"><div><h3>自动化运行摘要</h3><p>运行稳定性与模拟 ROI 单独呈现，不与经营 KPI 混合。</p></div></div><div className="automation-metrics"><div><b>{tasks.length === 0 ? '—' : `${((tasks.filter((task) => task.status === 'success').length / tasks.length) * 100).toFixed(1)}%`}</b><span>采集任务成功率</span></div><div><b data-testid="automation-failure-count">{failedTasks}</b><span>失败任务快照</span></div><div><b>{savedHours.toFixed(1)} h</b><span>累计节省工时（模拟测算）</span></div></div><small>成功任务次数：{successfulRuns}</small></article>
  </section>;
}
