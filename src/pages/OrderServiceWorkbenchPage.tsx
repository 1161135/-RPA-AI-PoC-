import { useMemo, useState } from 'react';
import type { AfterSalesTicket, OrderRisk, OrderRiskStatus } from '../domain/orderService';
import { afterSalesFixtures, orderRiskFixtures } from '../data/orderServiceFixtures';
import { useCockpitContext } from '../hooks/useCockpitData';
import { canHandleOrderRisk } from '../services/orderWorkflow';

const riskStatusLabel: Record<OrderRisk['status'], string> = { pending_review: '待复核', in_progress: '处理中', resolved: '已解决', ignored: '已忽略', external_logged: '外部执行已打卡' };
const ticketStatusLabel: Record<AfterSalesTicket['status'], string> = { pending: '待处理', in_progress: '处理中', awaiting_external: '待外部执行', awaiting_customer: '待用户反馈', closed: '已关闭' };
const channelLabel = { douyin: '抖音', tmall: '淘宝/天猫', jd: '京东' };

export function OrderServiceWorkbenchPage() {
  const { role, filters } = useCockpitContext();
  const [risks, setRisks] = useState(orderRiskFixtures);
  const [tickets] = useState(afterSalesFixtures);
  const [selectedRiskId, setSelectedRiskId] = useState(risks[0].id);
  const [pendingStatus, setPendingStatus] = useState<OrderRiskStatus | null>(null);
  const [note, setNote] = useState('');
  const visibleRisks = useMemo(() => risks.filter((item) => filters.channels.includes(item.channel)), [filters.channels, risks]);
  const visibleTickets = useMemo(() => tickets.filter((item) => filters.channels.includes(item.channel)), [filters.channels, tickets]);
  const selected = risks.find((item) => item.id === selectedRiskId) ?? visibleRisks[0];
  const highRisk = visibleRisks.filter((item) => item.severity === 'high').length;
  const overdue = visibleRisks.filter((item) => item.source.includes('降级')).length;

  const requestTransition = (status: OrderRiskStatus) => { setPendingStatus(status); setNote(''); };
  const confirmTransition = () => {
    if (!selected || !pendingStatus || !note.trim() || !canHandleOrderRisk(role, selected, pendingStatus, '运营专员')) return;
    setRisks((items) => items.map((item) => item.id === selected.id ? { ...item, status: pendingStatus, history: [...item.history, { at: '2026-07-26T10:30:00Z', by: role, action: pendingStatus, note: note.trim() }] } : item));
    setPendingStatus(null);
  };
  const actionLabel = selected?.status === 'pending_review' ? '开始处理' : '标记已解决';
  const nextStatus: OrderRiskStatus = selected?.status === 'pending_review' ? 'in_progress' : 'resolved';

  return <section id="order-service-workbench" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">履约协同 · 模拟脱敏数据</p><h2>订单与售后工作台</h2><p>订单异常与售后工单双队列协同；所有真实退款、补发或取消订单均由人工在原业务系统执行。</p></div><span className="data-pill">{visibleRisks.length + visibleTickets.length} 项待关注</span></div>
    <div className="lead-kpis"><article><small>待人工复核</small><b>{visibleRisks.filter((item) => item.status === 'pending_review').length}</b><span>订单异常队列</span></article><article><small>高风险订单</small><b>{highRisk}</b><span>24 小时 SLA</span></article><article><small>SLA 临期/降级</small><b>{overdue}</b><span>最近成功快照保留</span></article><article><small>待外部执行</small><b>{visibleTickets.filter((item) => item.status === 'awaiting_external').length}</b><span>需人工打卡</span></article></div>
    <div className="dashboard-grid"><article className="panel"><div className="panel-header"><div><h3>异常订单队列</h3><p>同单多规则命中会合并为一个待办，按最高优先级展示。</p></div></div><div className="work-queue">{visibleRisks.map((item) => <button key={item.id} className={item.id === selected?.id ? 'queue-item selected' : 'queue-item'} onClick={() => { setSelectedRiskId(item.id); setPendingStatus(null); }}><b>{item.orderId}</b><span>{channelLabel[item.channel]} · {item.rules.join(' / ')}</span><small>{riskStatusLabel[item.status]} · {item.severity === 'high' ? '高风险' : '中风险'}</small></button>)}</div></article><article className="panel"><div className="panel-header"><div><h3>售后工单协同</h3><p>退款、补发和咨询拥有独立状态机；低风险咨询可批量处理。</p></div></div><div className="work-queue">{visibleTickets.map((item) => <div key={item.id} className="queue-item"><b>{item.orderId} · {item.ticketType === 'refund' ? '退款' : item.ticketType === 'reshipment' ? '补发' : '咨询'}</b><span>{item.summary}</span><small>{ticketStatusLabel[item.status]} · {item.owner}</small></div>)}</div></article></div>
    {selected && <article className="panel transition-panel"><div className="panel-header"><div><h3>订单风险详情 · {selected.orderId}</h3><p>脱敏用户 {selected.customerKey} · {channelLabel[selected.channel]} · 数据来源：{selected.source}</p></div><span className={`status-tag ${selected.severity === 'high' ? 'status-pending' : ''}`}>{riskStatusLabel[selected.status]}</span></div><div className="dashboard-grid"><div><h4>规则命中与建议</h4><p>命中规则：{selected.rules.join('、')}</p><p>建议：核验活动价格、库存和履约信息；高风险订单不自动取消或拦截。</p></div><div><h4>历史工单统计</h4><p>该脱敏标识近 30 天：退款 1 次 · 补发 0 次 · 咨询 2 次</p></div></div>{role !== 'executive' && (canHandleOrderRisk(role, selected, nextStatus, '运营专员') ? <div className="transition-actions"><button onClick={() => requestTransition(nextStatus)}>{actionLabel}</button></div> : <p className="audit-history">当前角色或负责人不具备此项流转权限。</p>)}{pendingStatus && <div className="transition-fields"><label>处理说明<textarea aria-label="处理说明" value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="transition-actions"><button disabled={!note.trim()} onClick={confirmTransition}>确认流转</button><button onClick={() => setPendingStatus(null)}>取消</button></div></div>}<details className="audit-history"><summary>审计历史</summary>{selected.history.length ? selected.history.map((item) => <small key={`${item.at}-${item.note}`}>{item.at} · {item.action} · {item.note}</small>) : <small>尚无处理记录</small>}</details></article>}
  </section>;
}
