import { calculateSavedHours } from '../services/metrics';

const successfulRuns = 186;
const manualMinutes = 8;
export function TasksPage() {
  const saved = calculateSavedHours(successfulRuns, manualMinutes);
  return <section id="automation" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">RPA 运维 · 模拟日志</p><h2>自动化任务</h2><p>业务数据与机器人运行状态分开监控，便于定位问题来源。</p></div></div>
    <div className="dashboard-grid">
      <article className="panel"><div className="panel-header"><div><h3>任务运行概况</h3><p>最近一次模拟刷新：08:30</p></div></div><div className="automation-metrics"><div><b>186</b><span>成功任务数</span></div><div><b>98.9%</b><span>运行成功率</span></div><div><b>{saved.toFixed(1)} h</b><span>节省工时（模拟）</span></div></div><div className="formula"><h4>模拟节省工时计算公式</h4><p>成功任务数 × 单次标准人工耗时 ÷ 60 = {successfulRuns} × {manualMinutes} ÷ 60 = <b>{saved.toFixed(1)} 小时</b></p></div></article>
      <article className="panel"><div className="panel-header"><div><h3>失败任务快照</h3><p>失败后保留上一次成功数据，不以 0 覆盖。</p></div></div><div className="failure-card"><b>京东经营数据采集</b><span className="status-tag">待复核</span><p>08:25 · 登录会话失效（模拟）</p><small>建议动作：重新授权后重试；若仍失败，导入后台导出文件。</small></div></article>
    </div>
  </section>;
}
