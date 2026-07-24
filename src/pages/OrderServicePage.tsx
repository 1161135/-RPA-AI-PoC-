const orders = [
  { id: 'DY-20260723-018', channel: '抖音', route: '自动分流至仓配', status: '已分流', note: '库存与地址校验通过' },
  { id: 'JD-20260723-042', channel: '京东', route: '异常订单待复核', status: '待人工复核', note: '支付金额与优惠规则不一致' },
  { id: 'TM-20260723-099', channel: '淘宝/天猫', route: '售后工单', status: '处理中', note: '退款申请已进入人工审核队列' },
];

export function OrderServicePage() {
  return <section id="order-service" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">二期能力演示 · 不写入真实订单系统</p><h2>订单与售后自动处理</h2><p>演示订单分流、异常订单识别和售后工单的人机协同流转。</p></div><span className="data-pill">规则命中后保留人工审核</span></div>
    <div className="report-grid"><article className="panel report-card"><span className="report-index">01</span><h3>订单分流</h3><p>根据渠道、库存、发货地和订单标签分流至仓配或人工审核队列。</p></article><article className="panel report-card"><span className="report-index">02</span><h3>异常订单告警</h3><p>价格、优惠、地址或库存不一致时，生成可追溯告警，不自动取消订单。</p></article><article className="panel report-card"><span className="report-index">03</span><h3>售后工单流转</h3><p>创建 → 分配 → 人工审核 → 完结，全程保留状态和处理说明。</p></article></div>
    <article className="panel table-panel"><table><thead><tr><th>订单号</th><th>渠道</th><th>处理路径</th><th>状态</th><th>说明</th></tr></thead><tbody>{orders.map((item) => <tr key={item.id}><td><b>{item.id}</b></td><td>{item.channel}</td><td>{item.route}</td><td><span className={`status-tag ${item.status === '待人工复核' ? 'status-pending' : ''}`}>{item.status}</span></td><td>{item.note}</td></tr>)}</tbody></table></article>
  </section>;
}
