import { calculateSavedHours } from '../services/metrics';
import { useAutomationTasks } from '../hooks/useCockpitData';

export function TasksPage() {
  const tasks = useAutomationTasks();
  const successfulRuns = tasks.reduce((sum, task) => sum + task.successfulRuns, 0);
  const manualMinutes = tasks[0]?.manualMinutes ?? 0;
  const saved = tasks.reduce((sum, task) => sum + calculateSavedHours(task.successfulRuns, task.manualMinutes), 0);
  const failures = tasks.filter((task) => task.status === 'failed');
  return <section id="automation" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">RPA 运维 · 模拟日志</p><h2>自动化任务</h2><p>业务数据与机器人运行状态分开监控，便于定位问题来源。</p></div></div>
    <div className="dashboard-grid">
      <article className="panel"><div className="panel-header"><div><h3>任务运行概况</h3><p>最近一次模拟刷新：08:30</p></div></div><div className="automation-metrics"><div><b data-testid="automation-successful-runs">{successfulRuns}</b><span>成功任务数</span></div><div><b>{tasks.length === 0 ? '—' : `${((tasks.filter((task) => task.status === 'success').length / tasks.length) * 100).toFixed(1)}%`}</b><span>运行成功率</span></div><div><b>{saved.toFixed(1)} h</b><span>节省工时（模拟）</span></div></div><div className="formula"><h4>模拟节省工时计算公式</h4><p>成功任务数 × 单次标准人工耗时 ÷ 60 = {successfulRuns} × {manualMinutes} ÷ 60 = <b>{saved.toFixed(1)} 小时</b></p></div></article>
      <article className="panel"><div className="panel-header"><div><h3>失败任务快照</h3><p>失败后保留上一次成功数据，不以 0 覆盖。</p></div></div>{failures.length === 0 ? <p>当前筛选范围内没有失败任务。</p> : failures.map((task) => <div className="failure-card" data-testid={`task-${task.channel}`} key={task.id}><b>{task.task}</b><span className="status-tag">降级/快照</span><p>{task.detail}</p><small>建议动作：重新授权后重试；若仍失败，导入后台导出文件。</small></div>)}</article>
    </div>
  </section>;
}
