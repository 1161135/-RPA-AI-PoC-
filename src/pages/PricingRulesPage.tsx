import { useState } from 'react';

const mappings = [
  ['SKU-101', '抖音', '竞品-A（脱敏）', '已映射', '2 小时前'],
  ['SKU-203', '淘宝/天猫', '竞品-B（脱敏）', '映射待更新', '8 天前'],
  ['SKU-305', '京东', '竞品-C（脱敏）', '已映射', '1 小时前'],
];

export function PricingRulesPage() {
  const [preview, setPreview] = useState(false);
  return <section id="pricing-rules" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">映射治理 · 渠道差异规则</p><h2>竞品映射与规则中心</h2><p>支持合规快照导入、批量映射和主管审批的规则变更；不采集未授权平台数据。</p></div></div>
    <div className="dashboard-grid"><article className="panel"><h3>SKU 与竞品映射</h3><div className="table-panel"><table><thead><tr><th>自家 SKU</th><th>渠道</th><th>竞品标识</th><th>状态</th><th>最新快照</th></tr></thead><tbody>{mappings.map((row) => <tr key={row.join('-')}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div><p className="audit-history">支持批量导入、按品类绑定规则、批量启用/失效；映射失效会创建“映射待更新”待办。</p></article><article className="panel"><h3>渠道规则与审批</h3><div className="formula"><b>抖音 · 竞品降价</b><p>下降 ≥ 10% ⇒ 高风险，24 小时未处理置顶</p></div><div className="formula"><b>淘宝/天猫 · 目标价偏离</b><p>偏离 ≥ 8% ⇒ 中风险，72 小时提醒</p></div><div className="formula"><b>全渠道 · 毛利硬熔断</b><p>预计毛利率低于 5% ⇒ 禁止批量批准，主管逐条复核</p></div><button className="secondary-button" onClick={() => setPreview(true)}>预览回滚至 v1.0</button>{preview && <p className="risk-text">规则回滚预览：主管确认后生效，并写入版本与审计记录。</p>}</article></div>
    <article className="panel"><h3>快照导入与异常价过滤</h3><p>同日相同“渠道 + 自家 SKU + 竞品标识”以最新发生时间覆盖；跨日保留价格历史。定金、凑单价、错价等疑似异常价格进入数据质量核查，不进入普通告警队列。</p></article>
  </section>;
}
