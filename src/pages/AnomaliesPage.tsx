import { useMemo, useState } from 'react';
import type { Anomaly, AnomalyStatus } from '../domain/types';
import { useCockpitContext, useCockpitData } from '../hooks/useCockpitData';
import { detectAnomalies } from '../services/anomalies';
import { loadAnomalies, saveAnomalies, updateAnomalyStatus } from '../services/storage';
import { AnomalyList } from '../components/AnomalyList';

export function AnomaliesPage() {
  const { role } = useCockpitContext();
  const { skuMetrics } = useCockpitData();
  const [records, setRecords] = useState(loadAnomalies);
  const [pendingChange, setPendingChange] = useState<{ anomaly: Anomaly; status: AnomalyStatus } | null>(null);
  const [note, setNote] = useState('');
  const anomalies = useMemo(
    () => detectAnomalies(skuMetrics.map(({ sku, stock, averageDailySales }) => ({ sku, stock, averageDailySales })), records),
    [records, skuMetrics],
  );

  const persist = (next: Anomaly[]) => {
    setRecords(next);
    saveAnomalies(next);
  };

  const requestTransition = (anomaly: Anomaly, status: AnomalyStatus) => {
    setPendingChange({ anomaly, status });
    setNote('');
  };

  const confirmTransition = () => {
    if (!pendingChange || !note.trim()) return;
    persist(anomalies.map((item) => item.id === pendingChange.anomaly.id
      ? updateAnomalyStatus(item, pendingChange.status, role, note.trim()) : item));
    setPendingChange(null);
  };

  const assignOwner = (anomaly: Anomaly) => {
    const nextOwner = window.prompt('输入负责人', anomaly.owner);
    if (!nextOwner?.trim()) return;
    persist(anomalies.map((item) => item.id === anomaly.id ? { ...item, owner: nextOwner.trim() } : item));
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
