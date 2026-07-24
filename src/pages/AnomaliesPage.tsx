import { useMemo, useState } from 'react';
import { canTransitionAnomaly, type Anomaly, type AnomalyStatus, type HandlingMethod, type Role } from '../domain/types';
import { useCockpitContext, useScopedAnomalies } from '../hooks/useCockpitData';
import { updateAnomalyStatus } from '../services/storage';
import { AnomalyList } from '../components/AnomalyList';

const methods: HandlingMethod[] = ['人工复核', '已补货', '已改价', '优化投放', '忽略'];

export function AnomaliesPage() {
  const { role, anomalyRecords, persistAnomalies } = useCockpitContext();
  const anomalies = useScopedAnomalies();
  const [pendingChange, setPendingChange] = useState<{ anomaly: Anomaly; status: AnomalyStatus; actor: Role } | null>(null);
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<HandlingMethod>('人工复核');
  const [statusFilter, setStatusFilter] = useState<'all' | AnomalyStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | Anomaly['severity']>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const visibleAnomalies = useMemo(() => anomalies.filter((anomaly) =>
    (statusFilter === 'all' || anomaly.status === statusFilter)
    && (severityFilter === 'all' || anomaly.severity === severityFilter)
    && (typeFilter === 'all' || anomaly.type === typeFilter)
    && (ownerFilter === 'all' || anomaly.owner === ownerFilter),
  ), [anomalies, ownerFilter, severityFilter, statusFilter, typeFilter]);
  const requestTransition = (anomaly: Anomaly, status: AnomalyStatus) => {
    setPendingChange({ anomaly, status, actor: role });
    setNote('');
    setMethod(status === 'ignored' ? '忽略' : '人工复核');
  };
  const confirmTransition = () => {
    if (!pendingChange || !note.trim() || pendingChange.actor !== role) return;
    const current = anomalies.find((item) => item.id === pendingChange.anomaly.id);
    if (!current || !canTransitionAnomaly(pendingChange.actor, current.status, pendingChange.status)) return;
    const next = updateAnomalyStatus(current, pendingChange.status, pendingChange.actor, note.trim(), method);
    if (!next) return;
    persistAnomalies(anomalyRecords.map((item) => item.id === current.id ? next : item));
    setPendingChange(null);
  };
  const assignOwner = (anomaly: Anomaly) => {
    const nextOwner = window.prompt('输入负责人', anomaly.owner);
    if (!nextOwner?.trim()) return;
    persistAnomalies(anomalyRecords.map((item) => item.id === anomaly.id ? { ...item, owner: nextOwner.trim() } : item));
  };
  const selectOptions = (values: string[]) => values.filter((value, index) => values.indexOf(value) === index).map((value) => <option key={value} value={value}>{value}</option>);

  return <section id="anomalies" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">运营闭环 · 模拟脱敏数据</p><h2>异常中心</h2><p>从发现风险到人工处理、留痕追踪的可审计闭环。</p></div><span className="data-pill">{visibleAnomalies.length} 条待关注异常</span></div>
    <article className="panel">
      <div className="panel-header"><div><h3>当前异常</h3><p>全局时间、渠道筛选已生效；可进一步按异常属性定位待办。</p></div></div>
      <div className="anomaly-filters" aria-label="异常筛选"><label>状态<select aria-label="异常状态" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">全部状态</option><option value="pending">待处理</option><option value="in_progress">处理中</option><option value="resolved">已解决</option><option value="ignored">已忽略</option></select></label><label>级别<select aria-label="异常级别" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as typeof severityFilter)}><option value="all">全部级别</option><option value="high">高</option><option value="medium">中</option></select></label><label>类型<select aria-label="异常类型" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">全部类型</option>{selectOptions(anomalies.map((item) => item.type))}</select></label><label>负责人<select aria-label="异常负责人" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">全部负责人</option>{selectOptions(anomalies.map((item) => item.owner))}</select></label></div>
      <AnomalyList anomalies={visibleAnomalies} role={role} onTransition={requestTransition} onAssign={assignOwner} />
    </article>
    {pendingChange && <section className="panel transition-panel" aria-label="异常流转确认"><h3>确认异常流转</h3><p className="selection-context">当前选定：{pendingChange.anomaly.type} · {pendingChange.anomaly.title}</p><div className="transition-fields"><label>处理方式<select aria-label="处理方式" value={method} onChange={(event) => setMethod(event.target.value as HandlingMethod)}>{methods.map((item) => <option key={item}>{item}</option>)}</select></label><label>处理说明<textarea aria-label="处理说明" value={note} onChange={(event) => setNote(event.target.value)} /></label></div><div className="transition-actions"><button disabled={!note.trim()} onClick={confirmTransition}>确认流转</button><button onClick={() => setPendingChange(null)}>取消</button></div></section>}
  </section>;
}
