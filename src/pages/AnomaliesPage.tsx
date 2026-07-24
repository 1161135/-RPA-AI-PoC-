import { useState } from 'react';
import { canTransitionAnomaly, type Anomaly, type AnomalyStatus, type Role } from '../domain/types';
import { useCockpitContext, useScopedAnomalies } from '../hooks/useCockpitData';
import { updateAnomalyStatus } from '../services/storage';
import { AnomalyList } from '../components/AnomalyList';

export function AnomaliesPage() {
  const { role, anomalyRecords, persistAnomalies } = useCockpitContext();
  const anomalies = useScopedAnomalies();
  const [pendingChange, setPendingChange] = useState<{ anomaly: Anomaly; status: AnomalyStatus; actor: Role } | null>(null);
  const [note, setNote] = useState('');
  const requestTransition = (anomaly: Anomaly, status: AnomalyStatus) => {
    setPendingChange({ anomaly, status, actor: role });
    setNote('');
  };

  const confirmTransition = () => {
    if (!pendingChange || !note.trim() || pendingChange.actor !== role) return;
    const current = anomalies.find((item) => item.id === pendingChange.anomaly.id);
    if (!current || !canTransitionAnomaly(pendingChange.actor, current.status, pendingChange.status)) return;
    const next = updateAnomalyStatus(current, pendingChange.status, pendingChange.actor, note.trim());
    if (!next) return;
    persistAnomalies(anomalyRecords.map((item) => item.id === current.id ? next : item));
    setPendingChange(null);
  };

  const assignOwner = (anomaly: Anomaly) => {
    const nextOwner = window.prompt('输入负责人', anomaly.owner);
    if (!nextOwner?.trim()) return;
    persistAnomalies(anomalyRecords.map((item) => item.id === anomaly.id ? { ...item, owner: nextOwner.trim() } : item));
  };

  return <section id="anomalies" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">运营闭环 · 模拟脱敏数据</p><h2>异常中心</h2><p>从发现风险到人工处理、留痕追踪的可审计闭环。</p></div><span className="data-pill">{anomalies.length} 条待关注异常</span></div>
    <article className="panel">
      <div className="panel-header"><div><h3>当前异常</h3><p>高优先级异常应先完成复核；所有流转需要记录处理说明。</p></div></div>
      <AnomalyList anomalies={anomalies} role={role} onTransition={requestTransition} onAssign={assignOwner} />
    </article>
    {pendingChange && <section className="panel" aria-label="异常流转确认"><h3>确认异常流转</h3><p>处理说明会写入审计记录。</p><label>处理说明<textarea aria-label="处理说明" value={note} onChange={(event) => setNote(event.target.value)} /></label><button disabled={!note.trim()} onClick={confirmTransition}>确认流转</button><button onClick={() => setPendingChange(null)}>取消</button></section>}
  </section>;
}
