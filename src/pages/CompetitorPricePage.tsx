const competitors = [
  { name: '竞品 A · 同规格', channel: '淘宝/天猫', current: 169, change: -12, status: '阈值告警', suggestion: '建议：核对活动券后价与库存，维持人工审批；不执行自动改价。' },
  { name: '竞品 B · 同品类', channel: '京东', current: 188, change: 3, status: '正常波动', suggestion: '建议：继续观察，不触发价格策略调整。' },
  { name: '竞品 C · 内容电商', channel: '抖音', current: 158, change: -18, status: '阈值告警', suggestion: '建议：检查投放节奏与毛利底线后，由运营主管确认。' },
];

export function CompetitorPricePage() {
  return <section id="competitor-pricing" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">二期能力演示 · 模拟脱敏数据</p><h2>竞品价格监控与告警</h2><p>导入或授权接入的竞品价格先进入规则引擎，所有建议均需人工确认。</p></div><span className="data-pill">模拟导入 · 最近刷新 09:10</span></div>
    <div className="kpi-grid"><article className="kpi-card"><p className="kpi-label">监控竞品</p><div className="kpi-value-row"><strong>18</strong></div><p className="kpi-caption">按同规格与同品类映射</p></article><article className="kpi-card"><p className="kpi-label">价格变动</p><div className="kpi-value-row"><strong>4</strong></div><p className="kpi-caption">近 24 小时变化超过 5%</p></article><article className="kpi-card"><p className="kpi-label">阈值告警</p><div className="kpi-value-row"><strong>2</strong></div><p className="kpi-caption">需运营主管人工确认</p></article><article className="kpi-card"><p className="kpi-label">自动改价</p><div className="kpi-value-row"><strong>关闭</strong></div><p className="kpi-caption">PoC 不执行真实调价</p></article></div>
    <article className="panel table-panel"><table><thead><tr><th>竞品映射</th><th>渠道</th><th className="numeric-cell">当前价</th><th className="numeric-cell">近 24h 变动</th><th>规则状态</th><th>人工建议</th></tr></thead><tbody>{competitors.map((item) => <tr key={item.name}><td><b>{item.name}</b></td><td>{item.channel}</td><td className="numeric-cell">¥{item.current}</td><td className={`numeric-cell ${item.change < -10 ? 'risk-text' : ''}`}>{item.change > 0 ? '+' : ''}{item.change}%</td><td><span className={`status-tag ${item.status === '阈值告警' ? 'status-pending' : ''}`}>{item.status}</span></td><td>{item.suggestion}</td></tr>)}</tbody></table></article>
  </section>;
}
